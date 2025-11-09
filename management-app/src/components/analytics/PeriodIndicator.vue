<template>
  <BaseCard v-if="periodInfo">
    <div class="period-indicator">
      <div class="period-indicator__icon">📅</div>
      <div class="period-indicator__content">
        <h3 class="period-indicator__title">Período Analisado</h3>
        <p class="period-indicator__period">
          {{ periodInfo.startDate }} até {{ periodInfo.endDate }}
        </p>
        <p class="period-indicator__count">
          {{ periodInfo.totalOrders }} pedidos analisados
        </p>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Order } from '@/types/order'
import BaseCard from '@/components/design-system/BaseCard.vue'
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
  gap: 1rem;
  padding: 1rem;
}

.period-indicator__icon {
  font-size: 2rem;
}

.period-indicator__content {
  flex: 1;
}

.period-indicator__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-light);
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.period-indicator__period {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
  transition: color 0.3s ease;
}

.period-indicator__count {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin: 0;
}
</style>
