import { useApi } from './useApi'
import type { Store } from '@/types/store'

const API_BASE_URL = '/api'

export function useStoreApi() {
  const getStore = (id: string) => {
    return useApi<Store>(
      async () => {
        const response = await fetch(`${API_BASE_URL}/store/${id}`)
        if (!response.ok) {
          throw new Error(`Erro ao buscar loja: ${response.statusText}`)
        }
        return response.json()
      },
      { immediate: false }
    )
  }

  return {
    getStore
  }
}

