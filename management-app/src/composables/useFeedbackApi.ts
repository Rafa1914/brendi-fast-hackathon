import { useApi } from './useApi'
import type { FeedbackAnalyticsResponse, FeedbackAnalyticsFilters } from '@/types/feedback'

const API_BASE_URL = '/api'

export function useFeedbackApi() {
  const getFeedbackAnalytics = (filters?: FeedbackAnalyticsFilters) => {
    return useApi<FeedbackAnalyticsResponse>(
      async () => {
        const params = new URLSearchParams()
        
        if (filters?.dateRange?.startDate) {
          params.append('startDate', filters.dateRange.startDate)
        }
        if (filters?.dateRange?.endDate) {
          params.append('endDate', filters.dateRange.endDate)
        }

        const queryString = params.toString()
        const url = `${API_BASE_URL}/feedback/analytics${queryString ? `?${queryString}` : ''}`
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Erro ao buscar analytics de feedbacks: ${response.statusText}`)
        }
        return response.json()
      },
      { immediate: false }
    )
  }

  return {
    getFeedbackAnalytics
  }
}

