import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const toolSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  endpoint: z.string().url('Must be a valid URL'),
  parameters: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }, 'Must be valid JSON'),
});

type ToolFormValues = z.infer<typeof toolSchema>;

interface ToolFormProps {
  defaultValues?: Partial<ToolFormValues>;
  onSubmit: (data: ToolFormValues) => void;
  isLoading: boolean;
}

export function ToolForm({ defaultValues, onSubmit, isLoading }: ToolFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: '',
      description: '',
      endpoint: '',
      parameters: JSON.stringify({
        type: 'object',
        properties: {},
        required: []
      }, null, 2),
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Tool Name
        </label>
        <Input id="name" {...register('name')} placeholder="search_database" />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Tool Description
        </label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Search the database for information"
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="endpoint" className="block text-sm font-medium mb-1">
          Tool Endpoint
        </label>
        <Input
          id="endpoint"
          {...register('endpoint')}
          placeholder="https://api.example.com/tools/search"
        />
        {errors.endpoint && (
          <p className="text-sm text-red-500 mt-1">{errors.endpoint.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="parameters" className="block text-sm font-medium mb-1">
          Parameters Schema (JSON)
        </label>
        <Textarea
          id="parameters"
          {...register('parameters')}
          className="font-mono text-sm h-40"
        />
        {errors.parameters && (
          <p className="text-sm text-red-500 mt-1">{errors.parameters.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : 'Save Tool'}
      </Button>
    </form>
  );
}
