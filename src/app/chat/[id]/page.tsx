'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PulseLoader } from 'react-spinners';

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

// Format date from session ID (session_TIMESTAMP_RANDOM)
const formatSessionDate = (sessionId: string) => {
  const parts = sessionId.split('_');
  if (parts.length > 1) {
    const timestamp = parseInt(parts[1], 10);
    if (!isNaN(timestamp)) {
      return new Date(timestamp).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  }
  return 'Unknown date';
};

export default function ChatPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use() as recommended by Next.js
  const unwrappedParams = React.use(params as any) as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [configId, setConfigId] = useState<string>(unwrappedParams.id);
  const [config, setConfig] = useState<any>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [savedSessions, setSavedSessions] = useState<{id: string, messages: number}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update configId when params.id changes
  useEffect(() => {
    setConfigId(unwrappedParams.id);
  }, [unwrappedParams.id]);

  // Initialize a new session
  useEffect(() => {
    const createNewSession = async () => {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            configId: parseInt(configId),
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setSessionId(data.sessionId);
          setMessages([]); // Clear messages for new session
        }
      } catch (error) {
        console.error('Error creating session:', error);
      }
    };

    // Fetch saved sessions
    const fetchSavedSessions = async () => {
      try {
        const response = await fetch(`/api/sessions?configId=${configId}`);
        if (response.ok) {
          const data = await response.json();
          setSavedSessions(data);
        }
      } catch (error) {
        console.error('Error fetching saved sessions:', error);
      }
    };

    const sessionFromUrl = searchParams.get('session');
    if (sessionFromUrl) {
      // Load existing session from URL parameter
      setSessionId(sessionFromUrl);
      loadSession(sessionFromUrl);
    } else if (configId && !sessionId) {
      // Create a new session if no session ID exists
      createNewSession();
    }
    
    // Always fetch saved sessions list
    fetchSavedSessions();
  }, [configId, sessionId, searchParams]);

  // Fetch configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/config/${configId}`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);

          // If MCP is enabled, fetch tools
          if (data.mcpSupport) {
            const toolsResponse = await fetch('/api/tools');
            if (toolsResponse.ok) {
              const toolsData = await toolsResponse.json();
              setTools(toolsData);
              
              // Check if tools are specified in the URL
              const toolsParam = searchParams.get('tools');
              if (toolsParam) {
                const toolIds = toolsParam.split(',').map(id => parseInt(id, 10));
                setSelectedTools(toolIds.filter(id => !isNaN(id)));
              }
            }
          }
        } else {
          setError('Failed to load configuration');
          console.error('Failed to load configuration');
        }
      } catch (error) {
        setError('An error occurred while loading the configuration');
        console.error('Error fetching configuration:', error);
      }
    };

    fetchConfig();
  }, [configId, searchParams]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to the chat immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content,
    };

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
4. If the tool execution fails, inform the user and suggest alternatives
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
        throw new Error('Failed to get response from LLM');
      }

      const data = await response.json();
      
      // Add the assistant's response to the chat
      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolSelection = (toolId: number) => {
    setSelectedTools((prev) => {
      if (prev.includes(toolId)) {
        return prev.filter((id) => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  };

  // Function to load messages from a specific session
  const loadSession = async (sessionId: string) => {
    if (!sessionId) return;
    
    setIsLoadingSession(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          toolCalls: msg.toolCalls
        })));
        
        // Update the URL with the session ID without navigation
        const url = new URL(window.location.href);
        url.searchParams.set('session', sessionId);
        window.history.replaceState({}, '', url.toString());
      } else {
        throw new Error('Failed to load session');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setError('Failed to load chat history. Please try again.');
    } finally {
      setIsLoadingSession(false);
    }
  };
  
  // Function to handle creating a new session
  const createNewSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configId: parseInt(configId),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setMessages([]);
        
        // Update saved sessions list
        const sessionsResponse = await fetch(`/api/sessions?configId=${configId}`);
        if (sessionsResponse.ok) {
          const data = await sessionsResponse.json();
          setSavedSessions(data);
        }
        
        // Update URL to remove session parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('session');
        window.history.replaceState({}, '', url.toString());
      }
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      <header className="border-b p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold">{config.name}</h1>
          <p className="text-sm text-gray-500">{config.llmModel}</p>
        </div>
        <div className="flex gap-2">
          <div className="md:hidden">
            {savedSessions.length > 0 && (
              <div className="relative inline-block text-left mr-2">
                <select
                  className="block w-full pl-3 pr-8 py-1.5 text-sm border rounded-md"
                  value={sessionId}
                  onChange={(e) => {
                    const newSessionId = e.target.value;
                    if (newSessionId === 'new') {
                      createNewSession();
                    } else {
                      setSessionId(newSessionId);
                      loadSession(newSessionId);
                    }
                  }}
                >
                  <option value="new">New Chat</option>
                  {savedSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {formatSessionDate(session.id)} ({session.messages})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <Button 
            variant="default" 
            size="sm"
            onClick={createNewSession}
            disabled={isLoading || isLoadingSession}
          >
            New Chat
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {config?.mcpSupport && tools.length > 0 && (
            <div className="border-b p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium">MCP Tools</h2>
                {selectedTools.length > 0 && (
                  <ToolIndicator 
                    toolNames={tools
                      .filter(tool => selectedTools.includes(tool.id))
                      .map(tool => tool.name)
                    }
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Select the tools you want to make available to the AI for this conversation.
                The AI will use these tools when appropriate to answer your questions.
              </p>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelection(tool.id)}
                    title={tool.description}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedTools.includes(tool.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoadingSession ? (
              <div className="flex items-center justify-center h-full">
                <PulseLoader
                  color="currentColor"
                  size={8}
                  margin={4}
                  speedMultiplier={0.7}
                />
              </div>
            ) : (
              <ChatList messages={messages} isLoading={isLoading} />
            )}
          </div>

          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            hasMcpTools={config?.mcpSupport && selectedTools.length > 0} 
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive text-destructive-foreground text-sm p-2 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
