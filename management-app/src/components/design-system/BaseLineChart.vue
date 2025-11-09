<template>
  <BaseCard>
    <div class="chart-container">
      <h3 v-if="title" class="chart-title">{{ title }}</h3>
      <div class="chart-wrapper">
        <Line
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
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import BaseCard from '@/components/design-system/BaseCard.vue'
import { formatCurrency } from '@/utils/format'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  title?: string
  data: ChartData<'line'> | null
  options?: ChartOptions<'line'>
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  options: undefined
})

const defaultOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top' as const
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          
          // Formatação padrão baseada no label
          if (label.includes('Receita') || label.includes('R$')) {
            return `${label}: ${formatCurrency(value * 100)}`
          }
          if (label.includes('Pedidos') || label.includes('Quantidade')) {
            return `${label}: ${value} pedidos`
          }
          return `${label}: ${value}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true
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
    },
    scales: {
      ...defaultOptions.scales,
      ...props.options.scales
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

