'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ConfigForm } from '@/components/config-form';
import { Button } from '@/components/ui/button';

interface PageParams {
  id: string;
  [key: string]: string | string[];
}

export default function EditConfigPage({ params }: { params: Promise<PageParams> | PageParams }) {
  const router = useRouter();
  const unwrappedParams = React.use(params as Promise<PageParams>);
  const configId = unwrappedParams.id;
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/config/${configId}`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        } else {
          setError('Failed to load configuration');
        }
      } catch (error) {
        setError('An error occurred while loading the configuration');
        console.error('Error fetching configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [configId]);

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/config/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update configuration');
      }
    } catch (error) {
      setError('An error occurred while saving the configuration');
      console.error('Error updating configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        const response = await fetch(`/api/config/${configId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to delete configuration');
        }
      } catch (error) {
        setError('An error occurred while deleting the configuration');
        console.error('Error deleting configuration:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

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

  return (
    <div className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Configuration</h1>
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        <ConfigForm 
          defaultValues={config} 
          onSubmit={handleSubmit} 
          isLoading={isSaving} 
        />

        {config?.mcpSupport && (
          <div className="mt-6">
            <Link href={`/config/${configId}/tools`}>
              <Button variant="outline" className="w-full">
                Configure MCP Tools
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <Button 
            onClick={handleDelete} 
            variant="destructive" 
            className="w-full"
          >
            Delete Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
