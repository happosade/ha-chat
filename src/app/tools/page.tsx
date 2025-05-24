'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ToolForm } from '@/components/tool-form';

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tools');
      if (response.ok) {
        const data = await response.json();
        setTools(data);
      } else {
        setError('Failed to load tools');
      }
    } catch (error) {
      setError('An error occurred while loading tools');
      console.error('Error fetching tools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTool = () => {
    setSelectedTool(null);
    setIsCreating(true);
  };

  const handleEditTool = (tool: any) => {
    setSelectedTool(tool);
    setIsCreating(false);
  };

  const handleDeleteTool = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      try {
        const response = await fetch(`/api/tools/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setTools((prevTools) => prevTools.filter((tool) => tool.id !== id));
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to delete tool');
        }
      } catch (error) {
        setError('An error occurred while deleting the tool');
        console.error('Error deleting tool:', error);
      }
    }
  };

  const handleSaveTool = async (data: any) => {
    setIsSaving(true);
    setError(null);

    try {
      const url = selectedTool 
        ? `/api/tools/${selectedTool.id}` 
        : '/api/tools';
      
      const method = selectedTool ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchTools();
        setIsCreating(false);
        setSelectedTool(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${selectedTool ? 'update' : 'create'} tool`);
      }
    } catch (error) {
      setError(`An error occurred while ${selectedTool ? 'updating' : 'creating'} the tool`);
      console.error(`Error ${selectedTool ? 'updating' : 'creating'} tool:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedTool(null);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">MCP Tools</h1>
            <p className="text-gray-500">Manage your Model Context Protocol tools</p>
          </div>
          <div className="flex gap-2">
            {!isCreating && !selectedTool && (
              <Button onClick={handleCreateTool}>Add New Tool</Button>
            )}
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md mb-6 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Tool List */}
          <div className={`${(isCreating || selectedTool) ? 'hidden md:block' : ''} w-full md:w-1/2`}>
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading tools...</p>
              </div>
            ) : tools.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No tools added yet</h3>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  Add your first MCP tool to enhance your AI assistant
                </p>
                <Button onClick={handleCreateTool}>Add New Tool</Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {tools.map((tool) => (
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
                        <p className="text-xs text-gray-400 mt-2">{tool.endpoint}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTool(tool)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTool(tool.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tool Form */}
          {(isCreating || selectedTool) && (
            <div className="w-full md:w-1/2 md:border-l md:pl-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedTool ? 'Edit Tool' : 'New Tool'}
                </h2>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>

              <ToolForm
                defaultValues={selectedTool || undefined}
                onSubmit={handleSaveTool}
                isLoading={isSaving}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
