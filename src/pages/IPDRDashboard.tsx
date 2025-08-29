import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Radar, AlertTriangle, Database, Activity, Menu, X } from 'lucide-react';
import { IPDRSession, GraphData, GraphNode, GraphLink, FilterState, AnomalyResponse } from '@/types/ipdr';
import { convertToGraphData, convertToAnomalyRequest, generateMockIPDRData } from '@/utils/ipdrUtils';
import { AnomalyService } from '@/services/anomalyService';
import { CSVUploader } from '@/components/ipdr/CSVUploader';
import { Graph3D } from '@/components/ipdr/Graph3D';
import { FilterPanel } from '@/components/ipdr/FilterPanel';
import { NodeDetailPanel } from '@/components/ipdr/NodeDetailPanel';
import { HistoryPanel } from '@/components/ipdr/HistoryPanel';
import { ThemeToggle } from '@/components/ipdr/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const INITIAL_FILTERS: FilterState = {
  search: '',
  protocol: '',
  minBytes: 0,
  maxBytes: 999999999,
  minDuration: 0,
  maxDuration: 99999,
  startDate: '',
  endDate: '',
  showAnomaliesOnly: false,
};

export default function IPDRDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<IPDRSession[]>([]);
  const [anomalies, setAnomalies] = useState<Map<string, AnomalyResponse>>(new Map());
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMockData, setShowMockData] = useState(false);
  const { toast } = useToast();

  // Load mock data on component mount
  useEffect(() => {
    const mockData = generateMockIPDRData();
    setSessions(mockData);
    setShowMockData(true);
  }, []);

  // Filter sessions based on current filters
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableText = [
          session.src.ip,
          session.des.ip,
          session.src.phone.toString(),
          session.des.phone.toString(),
          session.session_id,
          session.protocol,
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchLower)) return false;
      }

      // Protocol filter
      if (filters.protocol && session.protocol !== filters.protocol) return false;

      // Bytes filter
      if (session.bytes < filters.minBytes || session.bytes > filters.maxBytes) return false;

      // Duration filter
      if (session.duration < filters.minDuration || session.duration > filters.maxDuration) return false;

      // Date filter
      if (filters.startDate || filters.endDate) {
        const sessionDate = new Date(session.timestamp || Date.now());
        if (filters.startDate && sessionDate < new Date(filters.startDate)) return false;
        if (filters.endDate && sessionDate > new Date(filters.endDate + 'T23:59:59')) return false;
      }

      // Anomaly filter
      if (filters.showAnomaliesOnly) {
        const anomaly = anomalies.get(session.session_id);
        if (!anomaly || anomaly.anomaly !== 1) return false;
      }

      return true;
    });
  }, [sessions, filters, anomalies]);

  // Convert sessions to graph data
  const graphData: GraphData = useMemo(() => {
    return convertToGraphData(filteredSessions, anomalies);
  }, [filteredSessions, anomalies]);

  // Handle new data load
  const handleDataLoaded = async (newSessions: IPDRSession[]) => {
    setSessions(newSessions);
    setShowMockData(false);
    setSelectedNode(null);

    // Auto-analyze for anomalies
    await analyzeAnomalies(newSessions);

    toast({
      title: "Data Loaded",
      description: `${newSessions.length} sessions loaded successfully.`,
    });
  };

  // Analyze anomalies
  const analyzeAnomalies = async (sessionsToAnalyze: IPDRSession[] = sessions) => {
    if (sessionsToAnalyze.length === 0) return;

    setIsAnalyzing(true);
    try {
      const anomalyService = AnomalyService.getInstance();
      const requests = sessionsToAnalyze.map(convertToAnomalyRequest);

      // Try real API first, fallback to mock
      let results: AnomalyResponse[];
      try {
        results = await anomalyService.detectAnomalies(requests);
      } catch (error) {
        console.warn('Real API failed, using mock detection:', error);
        results = await anomalyService.mockDetectAnomalies(requests);
        toast({
          title: "Using Demo Mode",
          description: "Anomaly detection API unavailable. Using mock results.",
          variant: "destructive",
        });
      }

      const anomalyMap = new Map<string, AnomalyResponse>();
      results.forEach(result => {
        anomalyMap.set(result.session_id, result);
      });

      setAnomalies(anomalyMap);

      const anomalyCount = results.filter(r => r.anomaly === 1).length;
      toast({
        title: "Analysis Complete",
        description: `Found ${anomalyCount} anomalies out of ${results.length} sessions.`,
      });
    } catch (error) {
      console.error('Anomaly analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze sessions for anomalies.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  // Handle link click
  const handleLinkClick = (link: GraphLink) => {
    console.log('Link clicked:', link);
  };

  // Statistics
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const filteredCount = filteredSessions.length;
    const anomalyCount = Array.from(anomalies.values()).filter(a => a.anomaly === 1).length;
    const protocols = new Set(sessions.map(s => s.protocol)).size;

    return { totalSessions, filteredCount, anomalyCount, protocols };
  }, [sessions, filteredSessions, anomalies]);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {/* Toggle for sidebar (menu icon, always visible in navbar) */}
            <div className="block">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-2">
                    <span className="sr-only">Open Menu</span>
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 max-w-full">
                  <div className="p-4 space-y-6">
                    <FilterPanel
                      filters={filters}
                      onFiltersChange={setFilters}
                      totalSessions={sessions.length}
                      filteredCount={filteredSessions.length}
                    />
                    <CSVUploader onDataLoaded={handleDataLoaded} isLoading={isAnalyzing} />
                    <HistoryPanel
                      onLoadHistory={handleDataLoaded}
                      currentSessions={sessions}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">IPDR Intelligence Platform</h1>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground ml-8">
              <div className="flex items-center gap-1">
                <Database className="w-4 h-4" />
                <span>{stats.totalSessions} Sessions</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{stats.anomalyCount} Anomalies</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span>{stats.protocols} Protocols</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => analyzeAnomalies()}
              disabled={isAnalyzing || sessions.length === 0}
              className="intel-button text-xs"
            >
              <Radar className="w-4 h-4 mr-1" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-col h-[calc(100vh-73px)]">
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar (only on md and up) */}
          <div className="hidden md:block w-80 border-r border-border bg-card/30 backdrop-blur-sm overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-6">
              {/* Filter Section */}
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                totalSessions={sessions.length}
                filteredCount={filteredSessions.length}
              />
              {/* Upload Section */}
              <CSVUploader onDataLoaded={handleDataLoaded} isLoading={isAnalyzing} />
              {/* History Section */}
              <HistoryPanel
                onLoadHistory={handleDataLoaded}
                currentSessions={sessions}
              />
              {/* Demo Data */}
              {showMockData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md"
                >
                  <p className="text-xs text-blue-400">
                    Demo data loaded. Upload CSV to analyze real IPDR data.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
          {/* Main Graph Area */}
          <div className="flex-1 relative border-2 border-blue-500 bg-background/80 rounded-xl m-2 mt-10 p-4 md:p-8 max-w-[1200px] max-h-[700px] w-full mx-auto overflow-auto flex items-center justify-center custom-scrollbar">
            {sessions.length > 0 ? (
              <Graph3D
                data={graphData}
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
                selectedNodeId={selectedNode?.id}
                showAnomaliesOnly={filters.showAnomaliesOnly}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-4">
                  <Radar className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No Data Loaded</h3>
                    <p className="text-muted-foreground">
                      Upload IPDR CSV data to begin visualization and analysis.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Loading Overlay */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  <div className="intel-panel p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Analyzing Sessions</h3>
                    <p className="text-sm text-muted-foreground">
                      Detecting anomalies in {sessions.length} sessions...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Right Sidebar - Node Details */}
          <AnimatePresence>
            {selectedNode && (
              <NodeDetailPanel
                node={selectedNode}
                links={graphData.links}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </AnimatePresence>
        </div>
        {/* Right Sidebar - Node Details */}
        <AnimatePresence>
          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              links={graphData.links}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}