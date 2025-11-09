<template>
  <div v-if="periodInfo" class="period-indicator">
    <span class="period-indicator__period">
      {{ periodInfo.startDate }} até {{ periodInfo.endDate }}
    </span>
    <span class="period-indicator__count">
      • {{ periodInfo.totalOrders }} pedidos
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Order } from '@/types/order'
import { formatDate } from '@/utils/format'

const props = defineProps<{
  orders: Order[]
}>()

const periodInfo = computed(() => {
  if (props.orders.length === 0) return null

  const dates = props.orders
    .map(order => new Date(order.createdAt))
    .sort((a, b) => a.getTime() - b.getTime())
  const startDate = formatDate(dates[0])
  const endDate = formatDate(dates[dates.length - 1])
  return {
    startDate,
    endDate,
    totalOrders: props.orders.length
  }
})
</script>

<style scoped>
.period-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--color-text-light);
  white-space: nowrap;
}

.period-indicator__period {
  font-weight: 500;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.period-indicator__count {
  color: var(--color-text-light);
}
</style>
