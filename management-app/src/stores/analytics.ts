import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AnalyticsResponse, AnalyticsFilters } from '@/types/analytics'
import { useAnalyticsApi } from '@/composables/useAnalyticsApi'

export const useAnalyticsStore = defineStore('analytics', () => {
  const analytics = ref<AnalyticsResponse | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const filters = ref<AnalyticsFilters>({})

  const fetchAnalytics = async (newFilters?: AnalyticsFilters) => {
    loading.value = true
    error.value = null
    
    if (newFilters) {
      filters.value = newFilters
    }

    try {
      const { getAnalytics } = useAnalyticsApi()
      const { data, execute } = getAnalytics(filters.value)
      await execute()
      
      if (data.value) {
        analytics.value = data.value
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Erro ao carregar analytics')
    } finally {
      loading.value = false
    }
  }

  return {
    analytics,
    loading,
    error,
    filters,
    fetchAnalytics
  }
})

