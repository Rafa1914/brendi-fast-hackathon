import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, OrderFilters } from '@/types/order'
import { useOrderApi } from '@/composables/useOrderApi'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const filters = ref<OrderFilters>({})

  const fetchOrders = async (newFilters?: OrderFilters) => {
    loading.value = true
    error.value = null
    
    if (newFilters) {
      filters.value = newFilters
    }

    try {
      const { listOrders } = useOrderApi()
      const { data, execute } = listOrders(filters.value)
      await execute()
      
      if (data.value) {
        orders.value = data.value
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Erro ao carregar pedidos')
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    loading,
    error,
    filters,
    fetchOrders
  }
})

