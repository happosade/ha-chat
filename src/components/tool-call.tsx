import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Wrench, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

interface ToolCallProps {
  toolCall: {
    id: string;
    name: string;
    arguments: string;
    result?: string;
    error?: string;
  };
}

export function ToolCall({ toolCall }: ToolCallProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Parse the arguments for display
  let parsedArgs;
  try {
    parsedArgs = JSON.parse(toolCall.arguments);
  } catch (e) {
    parsedArgs = toolCall.arguments;
  }
  
  // Parse the result if it's a JSON string
  let parsedResult;
  if (toolCall.result) {
    try {
      parsedResult = typeof toolCall.result === 'string' 
        ? JSON.parse(toolCall.result) 
        : toolCall.result;
    } catch (e) {
      parsedResult = toolCall.result;
    }
  }
  
  const hasError = !!toolCall.error;
  
  return (
    <div className="mt-2 text-xs border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
      <div 
        className={cn(
          "px-3 py-2 flex justify-between items-center cursor-pointer",
          hasError 
            ? "bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800" 
            : "bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="font-medium flex items-center gap-1.5">
          <Wrench className="h-3.5 w-3.5" />
          <span>{toolCall.name}</span>
          {hasError ? (
            <XCircle className="h-3.5 w-3.5 text-red-500 ml-1" />
          ) : (
            <CheckCircle className="h-3.5 w-3.5 text-green-500 ml-1" />
          )}
        </div>
        <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-3">
          <div>
            <div className="font-medium mb-1 text-gray-700 dark:text-gray-300">Arguments:</div>
            <pre className="overflow-x-auto p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs">
              {JSON.stringify(parsedArgs, null, 2)}
            </pre>
          </div>
          
          {(toolCall.result || toolCall.error) && (
            <div className="mt-3">
              <div className={cn(
                "font-medium mb-1",
                hasError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
              )}>
                {hasError ? "Error:" : "Result:"}
              </div>
              <pre className={cn(
                "overflow-x-auto p-2 rounded text-xs",
                hasError 
                  ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200" 
                  : "bg-green-50 dark:bg-green-900/20"
              )}>
                {hasError 
                  ? toolCall.error 
                  : (typeof parsedResult === 'string' 
                      ? parsedResult 
                      : JSON.stringify(parsedResult, null, 2))}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ToolCallsListProps {
  toolCalls: Array<{
    id: string;
    name: string;
    arguments: string;
    result?: string;
    error?: string;
  }>;
}

export function ToolCallsList({ toolCalls }: ToolCallsListProps) {
  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        <Wrench className="h-3.5 w-3.5" />
        <span>{toolCalls.length} Tool Call{toolCalls.length !== 1 ? 's' : ''}</span>
      </div>
      {toolCalls.map((toolCall) => (
        <ToolCall key={toolCall.id} toolCall={toolCall} />
      ))}
    </div>
  );
}
