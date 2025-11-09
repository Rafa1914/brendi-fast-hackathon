import { useApi } from './useApi'
import type { AnalyticsResponse, AnalyticsFilters } from '@/types/analytics'

const API_BASE_URL = '/api'

export function useAnalyticsApi() {
  const getAnalytics = (filters?: AnalyticsFilters) => {
    return useApi<AnalyticsResponse>(
      async () => {
        const params = new URLSearchParams()
        
        if (filters?.dateRange?.startDate) {
          params.append('startDate', filters.dateRange.startDate)
        }
        if (filters?.dateRange?.endDate) {
          params.append('endDate', filters.dateRange.endDate)
        }

        const queryString = params.toString()
        const url = `${API_BASE_URL}/analytics${queryString ? `?${queryString}` : ''}`
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Erro ao buscar analytics: ${response.statusText}`)
        }
        return response.json()
      },
      { immediate: false }
    )
  }

  return {
    getAnalytics
  }
}

