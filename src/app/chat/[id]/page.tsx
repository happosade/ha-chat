// This is the updated page.tsx file with improved logging
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PulseLoader } from 'react-spinners';

import logger from '@/lib/logger';
import { ChatList } from '@/components/chat-message-enhanced';
import { ChatInput } from '@/components/chat-input';
import { SessionSelector } from '@/components/session-selector';
import { ToolIndicator } from '@/components/tool-indicator';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: string;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [configId, setConfigId] = useState<string>('');
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get configId from URL params or search params
    if (params.id) {
      setConfigId(params.id);
    } else {
      const idFromSearch = searchParams.get('id');
      if (idFromSearch) {
        setConfigId(idFromSearch);
      }
    }

    // Generate a session ID if it doesn't exist
    const existingSession = localStorage.getItem(`chat-session-${configId}`);
    if (existingSession) {
      setSessionId(existingSession);
    } else {
      const newSessionId = `session-${Date.now()}`;
      localStorage.setItem(`chat-session-${configId}`, newSessionId);
      setSessionId(newSessionId);
    }

    // Fetch the configuration
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/config/${configId}`);
        if (!response.ok) {
          throw new Error('Failed to load configuration');
        }
        const data = await response.json();
        setConfig(data);

        // Load tools for this config
        if (data.mcpSupport && Array.isArray(data.toolIds)) {
          const toolResponse = await fetch('/api/tools', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: data.toolIds }),
          });

          if (!toolResponse.ok) {
            throw new Error('Failed to load tools');
          }

          const toolData = await toolResponse.json();
          setTools(toolData);
          setSelectedTools(data.toolIds);
        }
      } catch (error) {
        console.error('Error fetching configuration:', error);
        setError('An error occurred while loading the configuration');
      }
    };

    fetchConfig();
  }, [configId, searchParams]);

  const handleSendMessage = async (content: string) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('handleSendMessage called with content length:', content.length);
    }

    if (!content.trim()) {
      logger.warn('Empty message received, ignoring');
      return;
    }

    // Add user message to the chat immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content,
    };

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Adding user message to chat with ID and role:', { id: userMessage.id, role: userMessage.role });
    }
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare the messages array for the API
      const apiMessages = [];

      // Add system prompt for guidance on tool usage if MCP is enabled
      if (config?.mcpSupport && selectedTools.length > 0) {
        const toolNames = tools
          .filter(tool => selectedTools.includes(tool.id))
          .map(tool => tool.name)
          .join(', ');

        apiMessages.push({
          role: 'system',
          content: `You are a helpful AI assistant with access to external tools. The following tools are available to you: ${toolNames}.
When a user asks a question that requires using one of these tools:
1. Consider which tool is most appropriate for the task
2. Call the tool with the necessary parameters
3. Wait for the result and incorporate it into your response
4. If tool execution fails, inform the user and suggest alternatives
5. Always format your response in a clear, readable way

Be proactive about using tools when they would help answer the user's question more accurately or completely. If multiple tools are needed, use them sequentially.`
        });
      } else {
        // Basic system prompt for standard chat
        apiMessages.push({
          role: 'system',
          content: 'You are a helpful AI assistant. Provide thoughtful, accurate, and concise responses to the user\'s questions.'
        });
      }

      // Add conversation history and current message
      apiMessages.push(...messages.map(({ role, content }) => ({
        role,
        content,
      })));

      // Add current user message
      apiMessages.push({
        role: userMessage.role,
        content: userMessage.content,
      });

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Sending message to API with config', { configId, hasTools: !!config?.mcpSupport });
      }

      // Send the request to the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          configId: parseInt(configId),
          toolIds: config?.mcpSupport ? selectedTools : [],
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`API request failed with status ${response.status}: ${errorText}`);
        throw new Error(`Failed to get response from LLM (status: ${response.status})`);
      }

      const data = await response.json();

      // Add the assistant's response to the chat
      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      logger.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Set a more descriptive error message
      setError(`Failed to send message: ${errorMessage}. Please try again.`);
    } finally {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Setting loading state to false');
      }
      setIsLoading(false);
    }
  };

  // Handle tool selection changes
  const handleToolSelectionChange = (selected: number[]) => {
    setSelectedTools(selected);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat</h1>
        <SessionSelector
          sessionId={sessionId}
          onChange={(newSessionId) => setSessionId(newSessionId)}
        />
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? (
          <ChatList messages={messages} />
        ) : (
          <p className="text-gray-500 italic">Start a conversation with the AI assistant</p>
        )}
      </div>

      {/* Tool selection */}
      {config?.mcpSupport && tools.length > 0 && (
        <ToolIndicator
          tools={tools}
          selectedTools={selectedTools}
          onChange={handleToolSelectionChange}
        />
      )}

      {/* Chat input */}
      <footer className="p-4 border-t flex items-center">
        {isLoading ? (
          <PulseLoader size={8} color="#3b82f6" />
        ) : error ? (
          <div className="text-red-500 mr-2">{error}</div>
        ) : null}

        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading || !config}
          placeholder={!config ? "Loading configuration..." : "Type a message"}
        />
      </footer>
    </div>
  );
}