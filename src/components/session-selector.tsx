import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, Trash2 } from 'lucide-react';

interface SessionSelectorProps {
  configId: string;
  currentSessionId: string;
  sessions: {
    id: string;
    messages: number;
  }[];
  onSessionChange: (sessionId: string) => void;
  onNewSession: () => void;
}

export function SessionSelector({
  configId,
  currentSessionId,
  sessions,
  onSessionChange,
  onNewSession,
}: SessionSelectorProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(sessionId);
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // If the current session is deleted, create a new one
        if (sessionId === currentSessionId) {
          onNewSession();
        }
        
        // Refresh the page to update the session list
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setIsDeleting(null);
    }
  };

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

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-3 bg-muted font-medium">Sessions</div>
      <div className="divide-y max-h-64 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-3 text-sm text-gray-500">No saved sessions</div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSessionChange(session.id)}
              className={`p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                currentSessionId === session.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">
                    {formatSessionDate(session.id)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.messages} message{session.messages !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full opacity-50 hover:opacity-100"
                disabled={isDeleting === session.id}
                onClick={(e) => handleDeleteSession(session.id, e)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onNewSession}
        >
          New Chat
        </Button>
      </div>
    </div>
  );
}
