<template>
  <BaseCard>
    <div class="base-stat-card">
      <div class="base-stat-card__header">
        <h3 class="base-stat-card__title">{{ title }}</h3>
        <div v-if="icon" class="base-stat-card__icon" :class="`base-stat-card__icon--${variant}`">
          <slot name="icon">{{ icon }}</slot>
        </div>
      </div>
      <div class="base-stat-card__value">{{ formattedValue }}</div>
      <div v-if="subtitle" class="base-stat-card__subtitle">{{ subtitle }}</div>
      <div v-if="trend" class="base-stat-card__trend" :class="`base-stat-card__trend--${trend.type}`">
        <span>{{ trend.label }}</span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from './BaseCard.vue'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/format'

interface Trend {
  type: 'positive' | 'negative' | 'neutral'
  label: string
}

const props = defineProps<{
  title: string
  value: number | string
  subtitle?: string
  icon?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  trend?: Trend
  format?: 'currency' | 'number' | 'percentage'
}>()

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  if (props.format === 'currency') {
    return formatCurrency(props.value)
  }
  
  if (props.format === 'percentage') {
    return formatPercentage(props.value)
  }
  
  return formatNumber(props.value)
})
</script>

<style scoped>
.base-stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.base-stat-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.base-stat-card__title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-light);
  margin: 0;
}

.base-stat-card__icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.base-stat-card__icon--primary {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.base-stat-card__icon--success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.base-stat-card__icon--warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.base-stat-card__icon--danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.base-stat-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.base-stat-card__subtitle {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.base-stat-card__trend {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.base-stat-card__trend--positive {
  color: var(--color-success);
}

.base-stat-card__trend--negative {
  color: var(--color-danger);
}

.base-stat-card__trend--neutral {
  color: var(--color-text-light);
}
</style>

