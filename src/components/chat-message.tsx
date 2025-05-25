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

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // Parse tool calls if present
  let parsedToolCalls = [];
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
        'flex w-full items-start gap-2 py-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'rounded-lg px-4 py-2 max-w-[85%] hover:bg-muted/90 transition-colors',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <div className="prose dark:prose-invert break-words whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>
        
        {parsedToolCalls.length > 0 && (
          <div className="mt-3 border-t border-border/50 pt-2">
            <ToolCallsList 
              toolCalls={parsedToolCalls.map((call: any) => ({
                id: call.id,
                name: call.function?.name || 'Unknown Tool',
                arguments: call.function?.arguments || '{}',
                result: call.result
              }))} 
            />
          </div>
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
