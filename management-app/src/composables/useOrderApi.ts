import { useApi } from './useApi'
import type { Order, OrderFilters } from '@/types/order'

const API_BASE_URL = '/api'

export function useOrderApi() {
  const listOrders = (filters?: OrderFilters) => {
    return useApi<Order[]>(
      async () => {
        const params = new URLSearchParams()
        
        if (filters?.dateRange?.startDate) {
          params.append('startDate', filters.dateRange.startDate)
        }
        if (filters?.dateRange?.endDate) {
          params.append('endDate', filters.dateRange.endDate)
        }

        const queryString = params.toString()
        const url = `${API_BASE_URL}/order${queryString ? `?${queryString}` : ''}`
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Erro ao buscar pedidos: ${response.statusText}`)
        }
        return response.json()
      },
      { immediate: false }
    )
  }

  return {
    listOrders
  }
}

