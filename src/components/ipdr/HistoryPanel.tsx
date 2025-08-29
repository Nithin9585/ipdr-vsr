import React, { useState, useEffect } from 'react';
import { History, Trash2, Calendar, Database, AlertTriangle } from 'lucide-react';
import { IPDRSession } from '@/types/ipdr';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionHistory {
  id: string;
  name: string;
  timestamp: string;
  sessionCount: number;
  anomalyCount: number;
  sessions: IPDRSession[];
}

interface HistoryPanelProps {
  onLoadHistory: (sessions: IPDRSession[]) => void;
  currentSessions: IPDRSession[];
}

export function HistoryPanel({ onLoadHistory, currentSessions }: HistoryPanelProps) {
  const [history, setHistory] = useState<SessionHistory[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ipdr-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  // Save current sessions to history
  const saveCurrentSession = () => {
    if (currentSessions.length === 0) return;

    const newSession: SessionHistory = {
      id: Date.now().toString(),
      name: `Session ${new Date().toLocaleString()}`,
      timestamp: new Date().toISOString(),
      sessionCount: currentSessions.length,
      anomalyCount: 0, // Will be updated when anomalies are detected
      sessions: currentSessions,
    };

    const updatedHistory = [newSession, ...history].slice(0, 10); // Keep only last 10
    setHistory(updatedHistory);
    localStorage.setItem('ipdr-history', JSON.stringify(updatedHistory));
  };

  // Delete a history entry
  const deleteHistoryEntry = (id: string) => {
    const updatedHistory = history.filter(entry => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('ipdr-history', JSON.stringify(updatedHistory));
  };

  // Load a historical session
  const loadHistoricalSession = (entry: SessionHistory) => {
    onLoadHistory(entry.sessions);
  };

  return (
    <div className="intel-panel space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Session History</h3>
        </div>
        <Button
          onClick={saveCurrentSession}
          disabled={currentSessions.length === 0}
          size="sm"
          className="intel-button text-xs h-6 px-2"
        >
          Save Current
        </Button>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No saved sessions</p>
            </motion.div>
          ) : (
            history.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-muted/50 border border-border rounded-md hover:bg-muted/70 transition-colors cursor-pointer group"
                onClick={() => loadHistoricalSession(entry)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm truncate pr-2">{entry.name}</h4>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryEntry(entry.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span>{entry.sessionCount} sessions</span>
                    </div>
                    
                    {entry.anomalyCount > 0 && (
                      <div className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{entry.anomalyCount} anomalies</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-xs">
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: entry.anomalyCount > 0 ? `${(entry.anomalyCount / entry.sessionCount) * 100}%` : '0%' }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="h-full bg-red-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        <p>Click any session to load it. Up to 10 sessions are stored.</p>
      </div>
    </div>
  );
}