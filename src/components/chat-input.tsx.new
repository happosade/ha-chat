import React from 'react';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const messageSchema = z.object({
  content: z.string().min(1),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  hasMcpTools?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, hasMcpTools = false }: ChatInputProps) {
  const { register, handleSubmit, reset, formState } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = (data: MessageFormValues) => {
    onSendMessage(data.content);
    reset();
  };

  return (
    <div className="border-t bg-background">
      {hasMcpTools && (
        <div className="px-4 pt-2 text-xs text-gray-500">
          <p>This chat has access to MCP tools. Try asking questions that might require external tools to answer.</p>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-end gap-2 p-4"
      >
        <Textarea
          {...register('content')}
          placeholder="Type your message here..."
          className="min-h-[80px] flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !formState.isValid}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
