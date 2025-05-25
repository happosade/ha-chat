import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ToolCallsList } from './tool-call';
import { Button } from './ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PulseLoader } from 'react-spinners';

interface ChatMessageProps {
  message: {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    toolCalls?: string;
  };
  isLastMessage?: boolean;
  isLoading?: boolean;
}

interface ToolCall {
  id: string;
  function?: {
    name: string;
    arguments: string;
  };
  result?: any;
}

// Custom components for markdown rendering
const MarkdownComponents = {
  ol: (props: any) => (
    <ol className="list-decimal list-outside ml-4 space-y-1 my-2" {...props} />
  ),
  ul: (props: any) => (
    <ul className="list-disc list-outside ml-4 space-y-1 my-2" {...props} />
  ),
  li: (props: any) => (
    <li className="pl-1" {...props} />
  ),
  code: (props: any) => (
    <code className="bg-muted/50 rounded px-1.5 py-0.5 text-sm" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-muted/50 rounded p-3 overflow-x-auto my-2" {...props} />
  ),
};

export function ChatMessage({ message, isLastMessage, isLoading }: ChatMessageProps) {
  const [isThinkBlockExpanded, setIsThinkBlockExpanded] = useState(false);
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

  // Split content into think block and main content
  const thinkMatch = message.content.match(/<think>([\s\S]*?)<\/think>/);
  const thinkContent = thinkMatch?.[1]?.trim();
  const mainContent = message.content
    .replace(/<think>[\s\S]*?<\/think>/, '')
    .trim();
  
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
        {thinkContent && (
          <div className="mb-3 border-b border-border/50 pb-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 mb-1 px-1 hover:bg-transparent"
              onClick={() => setIsThinkBlockExpanded(!isThinkBlockExpanded)}
            >
              {isThinkBlockExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-xs font-medium">Thinking process</span>
            </Button>
            {isThinkBlockExpanded && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {thinkContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {mainContent}
          </ReactMarkdown>
        </div>
        
        {parsedToolCalls.length > 0 && (
          <div className="mt-3 border-t border-border/50 pt-2">
            <ToolCallsList 
              toolCalls={parsedToolCalls.map(call => ({
                id: call.id,
                name: call.function?.name || 'Unknown Tool',
                arguments: call.function?.arguments || '{}',
                result: call.result
              }))} 
            />
          </div>
        )}

        {isLastMessage && isUser && isLoading && (
          <div className="absolute right-0 bottom-0 transform translate-x-full translate-y-full p-2">
            <PulseLoader
              color="currentColor"
              size={4}
              margin={2}
              speedMultiplier={0.7}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatList({ messages, isLoading }: { messages: ChatMessageProps['message'][], isLoading?: boolean }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {messages.map((message, index) => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          isLastMessage={index === messages.length - 1}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
