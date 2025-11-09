import { ref, type Ref } from 'vue'

interface UseApiOptions {
  immediate?: boolean
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const data: Ref<T | null> = ref(null)
  const loading = ref(false)
  const error: Ref<Error | null> = ref(null)

  const execute = async () => {
    loading.value = true
    error.value = null
    try {
      data.value = await apiCall()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Erro desconhecido')
      console.error('API Error:', err)
    } finally {
      loading.value = false
    }
  }

  if (options.immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute
  }
}

