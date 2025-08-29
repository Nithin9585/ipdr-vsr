export interface IPDRNode {
  node_id: string;
  ip: string;
  port: number;
  phone: number;
  tower_lat: number;
  tower_lon: number;
}

export interface IPDRSession {
  session_id: string;
  protocol: string;
  duration: number;
  bytes: number;
  src: IPDRNode;
  des: IPDRNode;
  timestamp?: string;
}

export interface AnomalyRequest {
  timestamp: string;
  session_id: string;
  src_ip: string;
  src_port: number;
  dst_ip: string;
  dst_port: number;
  protocol: string;
  duration_sec: number;
  bytes: number;
  phone_number: string;
  cell_tower_lat: number;
  cell_tower_lon: number;
}

export interface AnomalyResponse {
  session_id: string;
  anomaly: number;
  confidence_score: number;
}

export interface GraphNode {
  id: string;
  name: string;
  group: number;
  phone?: number;
  ip?: string;
  tower_lat?: number;
  tower_lon?: number;
  isAnomaly?: boolean;
  confidence_score?: number;
  sessionCount?: number;
  // 3D position coordinates (added by force-graph)
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
  session_id: string;
  protocol: string;
  duration: number;
  bytes: number;
  isAnomaly?: boolean;
  confidence_score?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface FilterState {
  search: string;
  protocol: string;
  minBytes: number;
  maxBytes: number;
  minDuration: number;
  maxDuration: number;
  startDate: string;
  endDate: string;
  showAnomaliesOnly: boolean;
}