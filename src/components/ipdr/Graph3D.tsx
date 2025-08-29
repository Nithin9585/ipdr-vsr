import * as React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { GraphData, GraphNode, GraphLink } from '@/types/ipdr';
import { motion } from 'framer-motion';

interface Graph3DProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onLinkClick: (link: GraphLink) => void;
  selectedNodeId?: string;
  showAnomaliesOnly?: boolean;
}

export function Graph3D({
  data,
  onNodeClick,
  onLinkClick,
  selectedNodeId,
  showAnomaliesOnly = false
}: Graph3DProps) {
  const graphRef = useRef<any>(null);
  // Store the ForceGraph3D instance
  const forceGraphInstance = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<GraphLink | null>(null);

  // Filter data based on anomaly filter
  const filteredData = React.useMemo(() => {
    if (!showAnomaliesOnly) return data;

    const anomalyNodes = data.nodes.filter(node => node.isAnomaly);
    const anomalyNodeIds = new Set(anomalyNodes.map(node => node.id));
    const anomalyLinks = data.links.filter(link =>
      link.isAnomaly || (anomalyNodeIds.has(link.source as string) || anomalyNodeIds.has(link.target as string))
    );

    return {
      nodes: anomalyNodes,
      links: anomalyLinks
    };
  }, [data, showAnomaliesOnly]);

  // Node styling function
  const getNodeColor = useCallback((node: GraphNode) => {
    if (node.id === selectedNodeId) return '#22c55e'; // Green for selected
    if (node.isAnomaly) return '#ef4444'; // Red for anomalies
    return '#3b82f6'; // Blue for normal
  }, [selectedNodeId]);

  // Link styling function
  const getLinkColor = useCallback((link: GraphLink) => {
    if (link.isAnomaly) return '#ef4444'; // Red for anomaly links
    return '#64748b'; // Gray for normal links
  }, []);

  // Node size based on session count
  const getNodeSize = useCallback((node: GraphNode) => {
    const baseSize = 4;
    const sessionMultiplier = Math.log((node.sessionCount || 1) + 1) * 2;
    return baseSize + sessionMultiplier;
  }, []);

  // Link width based on bytes transferred
  const getLinkWidth = useCallback((link: GraphLink) => {
    return Math.max(1, Math.log(link.bytes / 1000000) * 0.5);
  }, []);

  // Node label function
  const getNodeLabel = useCallback((node: GraphNode) => {
    return `
      <div class="bg-gray-900 text-white p-2 rounded text-xs max-w-xs">
        <div class="font-bold">${node.name}</div>
        <div>IP: ${node.ip}</div>
        <div>Sessions: ${node.sessionCount || 0}</div>
        ${node.isAnomaly ? `<div class="text-red-400">⚠ ANOMALY (${(node.confidence_score || 0).toFixed(2)})</div>` : ''}
      </div>
    `;
  }, []);

  // Link label function
  const getLinkLabel = useCallback((link: GraphLink) => {
    return `
      <div class="bg-gray-900 text-white p-2 rounded text-xs max-w-xs">
        <div class="font-bold">${link.session_id}</div>
        <div>Protocol: ${link.protocol}</div>
        <div>Duration: ${link.duration.toFixed(2)}s</div>
        <div>Bytes: ${(link.bytes / 1024 / 1024).toFixed(2)} MB</div>
        ${link.isAnomaly ? `<div class="text-red-400">⚠ ANOMALY</div>` : ''}
      </div>
    `;
  }, []);

  // Handle node clicks
  const handleNodeClick = useCallback((node: GraphNode) => {
    onNodeClick(node);

    // Focus camera on node
    if (graphRef.current) {
      const distance = 200;
      const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);

      graphRef.current.cameraPosition(
        { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
        node,
        3000
      );
    }
  }, [onNodeClick]);

  // Create node texture
  const createNodeTexture = (node: GraphNode) => {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI);
    ctx.fillStyle = getNodeColor(node);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = node.isAnomaly ? '#fca5a5' : '#93c5fd';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw phone number
    ctx.fillStyle = 'white';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    const phoneStr = node.phone?.toString().slice(-4) || '----';
    ctx.fillText(phoneStr, size / 2, size / 2 + 3);

    return canvas;
  };

  // Apply graph styling and interactions
  useEffect(() => {
    if (forceGraphInstance.current && typeof forceGraphInstance.current.nodeThreeObject === 'function') {
      forceGraphInstance.current.nodeThreeObject((node: GraphNode) => {
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(createNodeTexture(node)),
            transparent: true,
          })
        );
        const size = getNodeSize(node);
        sprite.scale.set(size, size, 1);
        if (node.isAnomaly) {
          const glowGeometry = new THREE.SphereGeometry(size * 1.2);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: '#ef4444',
            transparent: true,
            opacity: 0.3,
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          sprite.add(glow);
        }
        return sprite;
      });
    }
  }, [filteredData, getNodeSize, createNodeTexture]);

  return (
    <div className="relative w-full h-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full"
      >
        <ForceGraph3D
          ref={graphRef}
          graphData={filteredData}
          nodeLabel={getNodeLabel}
          nodeColor={getNodeColor}
          nodeVal={getNodeSize}
          onNodeClick={handleNodeClick}
          onNodeHover={setHoveredNode}
          linkLabel={getLinkLabel}
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          onLinkClick={onLinkClick}
          onLinkHover={setHoveredLink}
          backgroundColor="rgba(0,0,0,0)"
          showNavInfo={false}
          controlType="orbit"
          enableNodeDrag={true}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.25}
          warmupTicks={100}
          cooldownTicks={200}
          d3AlphaDecay={0.0228}
          d3VelocityDecay={0.4}
        />
      </motion.div>

      {/* Hover info overlay */}
      {hoveredNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 intel-panel max-w-xs z-10"
        >
          <h4 className="font-semibold text-sm mb-2">Node: {hoveredNode.name}</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>IP: {hoveredNode.ip}</p>
            <p>Phone: {hoveredNode.phone}</p>
            <p>Sessions: {hoveredNode.sessionCount || 0}</p>
            <p>Location: {hoveredNode.tower_lat?.toFixed(4)}, {hoveredNode.tower_lon?.toFixed(4)}</p>
            {hoveredNode.isAnomaly && (
              <p className="text-red-400 font-medium">
                ⚠ ANOMALY ({(hoveredNode.confidence_score || 0).toFixed(2)})
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 intel-panel">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Normal Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Anomaly Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Selected Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}