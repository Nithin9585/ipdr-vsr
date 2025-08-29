import React from 'react';
import { X, Phone, Wifi, MapPin, Activity, AlertTriangle, Clock, Database } from 'lucide-react';
import { GraphNode, GraphLink } from '@/types/ipdr';
import { Button } from '@/components/ui/button';
import { formatBytes, formatDuration } from '@/utils/ipdrUtils';
import { motion } from 'framer-motion';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  links: GraphLink[];
  onClose: () => void;
}

export function NodeDetailPanel({ node, links, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  // Get all links connected to this node
  const connectedLinks = links.filter(
    link => link.source === node.id || link.target === node.id
  );

  const totalBytes = connectedLinks.reduce((sum, link) => sum + link.bytes, 0);
  const totalDuration = connectedLinks.reduce((sum, link) => sum + link.duration, 0);
  const anomalyLinks = connectedLinks.filter(link => link.isAnomaly);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed right-0 top-20 h-full w-80 intel-panel shadow-2xl z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Node Details</h3>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Node Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            <span className="font-mono text-lg">{node.name}</span>
            {node.isAnomaly && (
              <div className="flex items-center gap-1 text-red-400 text-xs">
                <AlertTriangle className="w-3 h-3" />
                ANOMALY
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">IP Address</p>
              <p className="font-mono">{node.ip}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Phone</p>
              <p className="font-mono">{node.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono">
              {node.tower_lat?.toFixed(6)}, {node.tower_lon?.toFixed(6)}
            </span>
          </div>

          {node.isAnomaly && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-red-400 text-sm">Anomaly Detected</span>
              </div>
              <p className="text-xs text-red-300">
                Confidence: {((node.confidence_score || 0) * 100).toFixed(1)}%
              </p>
            </motion.div>
          )}
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Connection Statistics
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="intel-panel p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wifi className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">Sessions</span>
              </div>
              <p className="font-mono text-lg">{connectedLinks.length}</p>
            </div>

            <div className="intel-panel p-3">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">Total Data</span>
              </div>
              <p className="font-mono text-sm">{formatBytes(totalBytes)}</p>
            </div>

            <div className="intel-panel p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">Total Time</span>
              </div>
              <p className="font-mono text-sm">{formatDuration(totalDuration)}</p>
            </div>

            <div className="intel-panel p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-xs text-muted-foreground">Anomalies</span>
              </div>
              <p className="font-mono text-lg text-red-400">{anomalyLinks.length}</p>
            </div>
          </div>
        </div>

        {/* Connected Sessions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Connected Sessions</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {connectedLinks.map((link, index) => (
              <motion.div
                key={`${link.session_id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-md border ${
                  link.isAnomaly 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-xs">{link.session_id}</span>
                  {link.isAnomaly && (
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span className="font-mono">{link.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-mono">{formatDuration(link.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bytes:</span>
                    <span className="font-mono">{formatBytes(link.bytes)}</span>
                  </div>
                  {link.isAnomaly && (
                    <div className="flex justify-between text-red-400">
                      <span>Confidence:</span>
                      <span className="font-mono">
                        {((link.confidence_score || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Protocol Distribution */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Protocol Distribution</h4>
          <div className="space-y-2">
            {Object.entries(
              connectedLinks.reduce((acc, link) => {
                acc[link.protocol] = (acc[link.protocol] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([protocol, count]) => (
              <div key={protocol} className="flex items-center justify-between text-sm">
                <span>{protocol}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(count / connectedLinks.length) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}