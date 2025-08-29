import axios from 'axios';
import { AnomalyRequest, AnomalyResponse } from '@/types/ipdr';

const API_BASE_URL = 'https://ipdr-graph-engine.onrender.com/api/v1';

export class AnomalyService {
  private static instance: AnomalyService;

  public static getInstance(): AnomalyService {
    if (!AnomalyService.instance) {
      AnomalyService.instance = new AnomalyService();
    }
    return AnomalyService.instance;
  }

  async detectAnomalies(sessions: AnomalyRequest[]): Promise<AnomalyResponse[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/anomalies/predict`, sessions, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      return response.data;
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Anomaly detection service not found. Please check the API endpoint.');
        } else if (error.response?.status >= 500) {
          throw new Error('Anomaly detection service is temporarily unavailable.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. The service is taking too long to respond.');
        } else {
          throw new Error(`API Error: ${error.response?.statusText || error.message}`);
        }
      }
      
      throw new Error('Failed to connect to anomaly detection service.');
    }
  }

  // Mock anomaly detection for demo purposes
  async mockDetectAnomalies(sessions: AnomalyRequest[]): Promise<AnomalyResponse[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return sessions.map(session => ({
      session_id: session.session_id,
      anomaly: Math.random() < 0.15 ? 1 : 0, // 15% chance of anomaly
      confidence_score: 0.7 + Math.random() * 0.3, // Random confidence between 0.7-1.0
    }));
  }
}