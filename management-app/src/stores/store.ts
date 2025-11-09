import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Store } from '@/types/store'
import { useStoreApi } from '@/composables/useStoreApi'

export const useStoreStore = defineStore('store', () => {
  const currentStore = ref<Store | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const storeName = computed(() => currentStore.value?.name || 'Restaurante')

  const fetchStore = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { getStore } = useStoreApi()
      const { data, execute } = getStore(id)
      await execute()
      
      if (data.value) {
        currentStore.value = data.value
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Erro ao carregar loja')
    } finally {
      loading.value = false
    }
  }

  return {
    currentStore,
    loading,
    error,
    storeName,
    fetchStore
  }
})

