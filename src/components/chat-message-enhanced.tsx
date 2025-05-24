import React from 'react';
import { cn } from '@/lib/utils';
import { ToolCallsList } from './tool-call';

interface ChatMessageProps {
  message: {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    toolCalls?: string;
  };
}

interface ToolCall {
  id: string;
  function?: {
    name: string;
    arguments: string;
  };
  result?: any;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // Parse tool calls if present
  let parsedToolCalls: ToolCall[] = [];
  if (message.toolCalls) {
    try {
      parsedToolCalls = JSON.parse(message.toolCalls);
    } catch (e) {
      console.error('Error parsing tool calls:', e);
    }
  }
  
  return (
    <div
      className={cn(
        'flex w-full items-start gap-2 py-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'rounded-lg px-4 py-2 max-w-[80%]',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <div className="prose dark:prose-invert break-words whitespace-pre-wrap">
          {message.content}
        </div>
        
        {parsedToolCalls.length > 0 && (
          <ToolCallsList 
            toolCalls={parsedToolCalls.map(call => ({
              id: call.id,
              name: call.function?.name || 'Unknown Tool',
              arguments: call.function?.arguments || '{}',
              result: call.result
            }))} 
          />
        )}
      </div>
    </div>
  );
}

export function ChatList({ messages }: { messages: ChatMessageProps['message'][] }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}
