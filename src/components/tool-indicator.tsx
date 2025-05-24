import React from 'react';
import { Wrench } from 'lucide-react';

interface ToolIndicatorProps {
  toolNames: string[];
}

export function ToolIndicator({ toolNames }: ToolIndicatorProps) {
  if (toolNames.length === 0) return null;
  
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 px-2 border rounded-md bg-muted/30">
      <Wrench className="h-3 w-3" />
      <span>Using: {toolNames.join(', ')}</span>
    </div>
  );
}
