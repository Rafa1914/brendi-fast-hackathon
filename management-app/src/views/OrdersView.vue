<template>
  <AppLayout>
    <template #header-actions>
      <BaseButton @click="refreshOrders" :loading="orderStore.loading">
        Atualizar
      </BaseButton>
    </template>

    <div class="orders">
      <div class="orders__filters">
        <BaseCard>
          <h3 class="orders__filters-title">Filtros</h3>
          <div class="orders__filters-content">
            <div class="orders__filter-group">
              <label class="orders__filter-label">Data Inicial</label>
              <input
                v-model="filters.startDate"
                type="date"
                class="orders__filter-input"
                @change="applyFilters"
              />
            </div>
            <div class="orders__filter-group">
              <label class="orders__filter-label">Data Final</label>
              <input
                v-model="filters.endDate"
                type="date"
                class="orders__filter-input"
                @change="applyFilters"
              />
            </div>
          </div>
        </BaseCard>
      </div>

      <div class="orders__list">
        <BaseCard>
          <div class="orders__header">
            <h3 class="orders__title">Todos os Pedidos</h3>
            <p class="orders__count">{{ orderStore.totalOrders }} pedidos encontrados</p>
          </div>
          <OrderList
            :orders="orderStore.orders"
            :loading="orderStore.loading"
            :error="orderStore.error"
          />
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseButton from '@/components/design-system/BaseButton.vue'
import OrderList from '@/components/orders/OrderList.vue'
import { OrderFilters } from '@/types/order'

const orderStore = useOrderStore()

const filters = ref({
  startDate: '',
  endDate: '',
})

const applyFilters = async () => {
  const orderFilters: OrderFilters = {}
  
  if (filters.value.startDate || filters.value.endDate) {
    orderFilters.dateRange = {}
    if (filters.value.startDate) {
      orderFilters.dateRange.startDate = filters.value.startDate
    }
    if (filters.value.endDate) {
      orderFilters.dateRange.endDate = filters.value.endDate
    }
  }
  
  await orderStore.fetchOrders(orderFilters)
}

const refreshOrders = async () => {
  await applyFilters()
}

onMounted(async () => {
  await orderStore.fetchOrders()
})
</script>

<style scoped>
.orders {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.orders__filters {
  max-width: 100%;
}

.orders__filters-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
}

.orders__filters-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.orders__filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.orders__filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.orders__filter-input {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color 0.2s ease;
}

.orders__filter-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.orders__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.orders__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.orders__count {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin: 0;
}
</style>

