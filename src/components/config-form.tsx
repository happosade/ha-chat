import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const configSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  llmEndpoint: z.string().url('Must be a valid URL'),
  llmModel: z.string().min(1, 'Model is required'),
  apiKey: z.string().min(1, 'API key is required'),
  mcpSupport: z.boolean().optional(),
  mcpEndpoint: z.string().url('Must be a valid URL').optional(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface ConfigFormProps {
  defaultValues?: Partial<ConfigFormValues>;
  onSubmit: (data: ConfigFormValues) => void;
  isLoading: boolean;
}

export function ConfigForm({ defaultValues, onSubmit, isLoading }: ConfigFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      name: '',
      llmEndpoint: 'https://api.openai.com/v1',
      llmModel: 'gpt-4o',
      apiKey: '',
      mcpSupport: false,
      mcpEndpoint: '',
      ...defaultValues,
    },
  });

  const mcpSupport = watch('mcpSupport');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Configuration Name
        </label>
        <Input id="name" {...register('name')} placeholder="My Configuration" />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="llmEndpoint" className="block text-sm font-medium mb-1">
          LLM API Endpoint
        </label>
        <Input 
          id="llmEndpoint" 
          {...register('llmEndpoint')} 
          placeholder="https://api.openai.com/v1" 
        />
        {errors.llmEndpoint && (
          <p className="text-sm text-red-500 mt-1">{errors.llmEndpoint.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="llmModel" className="block text-sm font-medium mb-1">
          LLM Model
        </label>
        <Input 
          id="llmModel" 
          {...register('llmModel')} 
          placeholder="gpt-4o" 
        />
        {errors.llmModel && (
          <p className="text-sm text-red-500 mt-1">{errors.llmModel.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
          API Key
        </label>
        <Input 
          id="apiKey" 
          type="password"
          {...register('apiKey')} 
          placeholder="Your API key" 
        />
        {errors.apiKey && (
          <p className="text-sm text-red-500 mt-1">{errors.apiKey.message}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <input 
          id="mcpSupport" 
          type="checkbox" 
          {...register('mcpSupport')} 
          className="h-4 w-4"
        />
        <label htmlFor="mcpSupport" className="text-sm font-medium">
          Enable MCP (Model Context Protocol) Support
        </label>
      </div>
      
      {mcpSupport && (
        <div>
          <label htmlFor="mcpEndpoint" className="block text-sm font-medium mb-1">
            MCP Endpoint
          </label>
          <Input 
            id="mcpEndpoint" 
            {...register('mcpEndpoint')} 
            placeholder="https://api.example.com/mcp" 
          />
          {errors.mcpEndpoint && (
            <p className="text-sm text-red-500 mt-1">{errors.mcpEndpoint.message}</p>
          )}
        </div>
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : 'Save Configuration'}
      </Button>
    </form>
  );
}
