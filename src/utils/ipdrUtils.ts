import { IPDRSession, AnomalyRequest, GraphData, GraphNode, GraphLink } from '@/types/ipdr';

export function convertToAnomalyRequest(session: IPDRSession): AnomalyRequest {
  return {
    timestamp: session.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19),
    session_id: session.session_id,
    src_ip: session.src.ip,
    src_port: session.src.port,
    dst_ip: session.des.ip,
    dst_port: session.des.port,
    protocol: session.protocol,
    duration_sec: session.duration,
    bytes: session.bytes,
    phone_number: session.src.phone.toString(),
    cell_tower_lat: session.src.tower_lat,
    cell_tower_lon: session.src.tower_lon,
  };
}

export function convertToGraphData(sessions: IPDRSession[], anomalies: Map<string, any> = new Map()): GraphData {
  const nodeMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  sessions.forEach((session) => {
    // Create source node
    const srcId = `${session.src.ip}:${session.src.port}`;
    if (!nodeMap.has(srcId)) {
      nodeMap.set(srcId, {
        id: srcId,
        name: session.src.phone.toString(),
        group: 1,
        phone: session.src.phone,
        ip: session.src.ip,
        tower_lat: session.src.tower_lat,
        tower_lon: session.src.tower_lon,
        sessionCount: 0,
      });
    }

    // Create destination node
    const desId = `${session.des.ip}:${session.des.port}`;
    if (!nodeMap.has(desId)) {
      nodeMap.set(desId, {
        id: desId,
        name: session.des.phone.toString(),
        group: 2,
        phone: session.des.phone,
        ip: session.des.ip,
        tower_lat: session.des.tower_lat,
        tower_lon: session.des.tower_lon,
        sessionCount: 0,
      });
    }

    // Update session counts
    const srcNode = nodeMap.get(srcId)!;
    const desNode = nodeMap.get(desId)!;
    srcNode.sessionCount = (srcNode.sessionCount || 0) + 1;
    desNode.sessionCount = (desNode.sessionCount || 0) + 1;

    // Check if this session is anomalous
    const anomaly = anomalies.get(session.session_id);
    const isAnomaly = anomaly?.anomaly === 1;

    if (isAnomaly) {
      srcNode.isAnomaly = true;
      srcNode.confidence_score = anomaly.confidence_score;
      desNode.isAnomaly = true;
      desNode.confidence_score = anomaly.confidence_score;
    }

    // Create link
    links.push({
      source: srcId,
      target: desId,
      value: Math.log(session.bytes) / 10, // Scale for visualization
      session_id: session.session_id,
      protocol: session.protocol,
      duration: session.duration,
      bytes: session.bytes,
      isAnomaly,
      confidence_score: anomaly?.confidence_score,
    });
  });

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

export function generateMockIPDRData(): IPDRSession[] {
  const protocols = ['SIP', 'RTP', 'HTTP', 'HTTPS', 'TCP'];
  const mockData: IPDRSession[] = [];

  for (let i = 0; i < 50; i++) {
    const sessionId = `session-${i.toString().padStart(3, '0')}`;
    const srcPhone = 7800000000 + Math.floor(Math.random() * 999999);
    const desPhone = 7800000000 + Math.floor(Math.random() * 999999);
    
    mockData.push({
      session_id: sessionId,
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      duration: Math.random() * 10000,
      bytes: Math.random() * 1000000000,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      src: {
        node_id: `node-src-${i}`,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        port: Math.floor(Math.random() * 65535),
        phone: srcPhone,
        tower_lat: 28.6139 + (Math.random() - 0.5) * 0.1,
        tower_lon: 77.209 + (Math.random() - 0.5) * 0.1,
      },
      des: {
        node_id: `node-des-${i}`,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        port: Math.floor(Math.random() * 65535),
        phone: desPhone,
        tower_lat: 28.6139 + (Math.random() - 0.5) * 0.1,
        tower_lon: 77.209 + (Math.random() - 0.5) * 0.1,
      },
    });
  }

  return mockData;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}