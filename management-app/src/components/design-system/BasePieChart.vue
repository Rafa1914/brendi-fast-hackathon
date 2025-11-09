<template>
  <BaseCard>
    <div class="chart-container">
      <h3 v-if="title" class="chart-title">{{ title }}</h3>
      <div class="chart-wrapper">
        <Pie
          v-if="data"
          :data="data"
          :options="mergedOptions"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import BaseCard from '@/components/design-system/BaseCard.vue'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

interface Props {
  title?: string
  data: ChartData<'pie'> | null
  options?: ChartOptions<'pie'>
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  options: undefined
})

const defaultOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
          
          // Para gráficos de porcentagem, apenas mostrar a porcentagem
          if (context.dataset.label?.includes('%') || context.dataset.label?.includes('Receita')) {
            return `${label}: ${percentage}%`
          }
          
          // Para outros tipos, mostrar valor e porcentagem
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  }
}

const mergedOptions = computed(() => {
  if (!props.options) return defaultOptions
  
  return {
    ...defaultOptions,
    ...props.options,
    plugins: {
      ...defaultOptions.plugins,
      ...props.options.plugins
    }
  }
})
</script>

<style scoped>
.chart-container {
  padding: 1rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1.5rem 0;
  transition: color 0.3s ease;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}
</style>

