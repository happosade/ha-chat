'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface PageParams {
  id: string;
  [key: string]: string | string[];
}

export default function ConfigToolsPage({ params }: { params: Promise<PageParams> | PageParams }) {
  const router = useRouter();
  const unwrappedParams = React.use(params as Promise<PageParams>);
  const configId = unwrappedParams.id;
  const [config, setConfig] = useState<any>(null);
  const [allTools, setAllTools] = useState<any[]>([]);
  const [configuredTools, setConfiguredTools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the configuration
        const configResponse = await fetch(`/api/config/${configId}`);
        if (!configResponse.ok) {
          throw new Error('Failed to load configuration');
        }
        const configData = await configResponse.json();
        setConfig(configData);

        // Only proceed if MCP is enabled
        if (!configData.mcpSupport) {
          setError('MCP is not enabled for this configuration. Please enable it first.');
          setIsLoading(false);
          return;
        }

        // Fetch all available tools
        const toolsResponse = await fetch('/api/tools');
        if (!toolsResponse.ok) {
          throw new Error('Failed to load tools');
        }
        const toolsData = await toolsResponse.json();
        setAllTools(toolsData);

        // For now, we're showing all tools as available, but this could be enhanced
        // to show which tools are already configured for this specific config
        setConfiguredTools([]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('An error occurred while loading data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [configId]);

  const handleAddTool = (toolId: number) => {
    router.push(`/chat/${configId}?tools=${toolId}`);
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
          <Link href={`/config/${configId}`}>
            <Button>Back to Configuration</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">MCP Tools for {config.name}</h1>
            <p className="text-gray-500">
              Configure which Model Context Protocol tools to use with this LLM configuration.
            </p>
            {config.mcpEndpoint && (
              <p className="text-sm mt-2">
                MCP Endpoint: {config.mcpEndpoint}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/config/${configId}`}>
              <Button variant="outline">Back to Config</Button>
            </Link>
            <Link href="/tools">
              <Button variant="outline">Manage Tools</Button>
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Available Tools</h2>
          {allTools.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No tools available</h3>
              <p className="mb-6 text-gray-500 dark:text-gray-400">
                Add MCP tools first to use them with this configuration
              </p>
              <Link href="/tools">
                <Button>Add New Tool</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {allTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{tool.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {tool.description}
                      </p>
                    </div>
                    <div>
                      <Link href={`/chat/${configId}?tools=${tool.id}`}>
                        <Button size="sm">
                          Start Chat with This Tool
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">How MCP Tools Work</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <span className="font-medium">Configure your LLM:</span> Enable MCP support and set the MCP endpoint
              </li>
              <li>
                <span className="font-medium">Define your tools:</span> Create tools with their endpoints and parameter schemas
              </li>
              <li>
                <span className="font-medium">Start a chat:</span> Select which tools to make available to the LLM
              </li>
              <li>
                <span className="font-medium">Let the LLM use tools:</span> The model will automatically use the tools when needed
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
