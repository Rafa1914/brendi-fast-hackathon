import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FeedbackAnalyticsResponse, FeedbackAnalyticsFilters } from '@/types/feedback'
import { useFeedbackApi } from '@/composables/useFeedbackApi'

export const useFeedbackStore = defineStore('feedback', () => {
  const analytics = ref<FeedbackAnalyticsResponse | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const filters = ref<FeedbackAnalyticsFilters>({})

  const fetchFeedbackAnalytics = async (newFilters?: FeedbackAnalyticsFilters) => {
    loading.value = true
    error.value = null
    
    if (newFilters) {
      filters.value = newFilters
    }

    try {
      const { getFeedbackAnalytics } = useFeedbackApi()
      const { data, execute } = getFeedbackAnalytics(filters.value)
      await execute()
      
      if (data.value) {
        analytics.value = data.value
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Erro ao carregar analytics de feedbacks')
    } finally {
      loading.value = false
    }
  }

  return {
    analytics,
    loading,
    error,
    filters,
    fetchFeedbackAnalytics
  }
})
