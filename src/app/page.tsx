'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

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

export default function Home() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [configSessions, setConfigSessions] = useState<{[key: string]: any[]}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          setConfigs(data);
          
          // Fetch sessions for each config
          const sessionsData: {[key: string]: any[]} = {};
          await Promise.all(data.map(async (config: any) => {
            try {
              const sessionsResponse = await fetch(`/api/sessions?configId=${config.id}`);
              if (sessionsResponse.ok) {
                const sessions = await sessionsResponse.json();
                sessionsData[config.id] = sessions;
              }
            } catch (error) {
              console.error(`Error fetching sessions for config ${config.id}:`, error);
            }
          }));
          
          setConfigSessions(sessionsData);
        }
      } catch (error) {
        console.error('Error fetching configurations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigurations();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8">HA-Chat</h1>
        
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Configurations</h2>
            <Link href="/config/new">
              <Button>Add New</Button>
            </Link>
          </div>
          
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : configs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No configurations yet</h3>
              <p className="mb-6 text-gray-500 dark:text-gray-400">
                Add your first LLM configuration to get started
              </p>
              <Link href="/config/new">
                <Button>Add Configuration</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{config.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {config.llmModel} • {config.llmEndpoint}
                      </p>
                      {config.mcpSupport && (
                        <p className="text-xs text-blue-500 mt-1">MCP Enabled</p>
                      )}
                      
                      {/* Show recent sessions if available */}
                      {configSessions[config.id]?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Recent Sessions:</p>
                          <div className="space-y-1">
                            {configSessions[config.id].slice(0, 3).map((session) => (
                              <Link 
                                key={session.id} 
                                href={`/chat/${config.id}?session=${session.id}`}
                                className="block text-xs text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:underline"
                              >
                                {formatSessionDate(session.id)} • {session.messages} message{session.messages !== 1 ? 's' : ''}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/chat/${config.id}`}>
                        <Button variant="default" size="sm">
                          Chat
                        </Button>
                      </Link>
                      <Link href={`/config/${config.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">MCP Tools</h2>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 dark:text-gray-400">
                Manage your Model Context Protocol tools
              </p>
              <Link href="/tools">
                <Button variant="outline">Manage Tools</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
