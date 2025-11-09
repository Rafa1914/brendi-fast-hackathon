import fetch from 'node-fetch';
import { AnalyticsResponse, AnalyticsFilters } from '../types/analytics';

const MANAGEMENT_API_URL = process.env.MANAGEMENT_API_URL || 'http://localhost:3000';

class ManagementApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = MANAGEMENT_API_URL) {
    this.baseUrl = baseUrl;
  }

  async getAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.dateRange?.startDate) {
      params.append('startDate', filters.dateRange.startDate.toISOString());
    }
    if (filters?.dateRange?.endDate) {
      params.append('endDate', filters.dateRange.endDate.toISOString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/api/analytics${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar analytics: ${response.statusText}`);
    }
    
    return response.json() as Promise<AnalyticsResponse>;
  }
}

export default new ManagementApiClient();

