'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ConfigForm } from '@/components/config-form';
import { Button } from '@/components/ui/button';

export default function NewConfigPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create configuration');
      }
    } catch (error) {
      setError('An error occurred while saving the configuration');
      console.error('Error creating configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">New Configuration</h1>
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md mb-6 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <ConfigForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
