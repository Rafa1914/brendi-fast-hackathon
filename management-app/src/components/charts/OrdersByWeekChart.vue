<template>
  <BaseCard>
    <div class="chart-container">
      <h3 class="chart-title">Pedidos por Semana</h3>
      <div class="chart-wrapper">
        <Bar
          v-if="chartData"
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import BaseCard from '@/components/design-system/BaseCard.vue'
import type { Order } from '@/types/order'
import { formatCurrency } from '@/utils/format'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  orders: Order[]
}>()

const getWeekLabel = (date: Date): string => {
  const startOfWeek = new Date(date)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
  startOfWeek.setDate(diff)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  
  const startStr = startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const endStr = endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  
  return `${startStr} - ${endStr}`
}

const chartData = computed(() => {
  if (props.orders.length === 0) return null

  // Agrupar pedidos por semana
  const ordersByWeek = new Map<string, { count: number; revenue: number }>()
  
  props.orders.forEach(order => {
    const date = new Date(order.createdAt)
    const weekKey = getWeekLabel(date)
    
    const existing = ordersByWeek.get(weekKey) || { count: 0, revenue: 0 }
    existing.count++
    existing.revenue += order.totalPrice
    
    ordersByWeek.set(weekKey, existing)
  })

  // Ordenar por data da semana
  const sortedWeeks = Array.from(ordersByWeek.entries())
    .sort((a, b) => {
      const dateA = new Date(a[0].split(' - ')[0].split('/').reverse().join('-'))
      const dateB = new Date(b[0].split(' - ')[0].split('/').reverse().join('-'))
      return dateA.getTime() - dateB.getTime()
    })

  const labels = sortedWeeks.map(([week]) => week)
  const counts = sortedWeeks.map(([, data]) => data.count)
  const revenues = sortedWeeks.map(([, data]) => data.revenue / 100)

  return {
    labels,
    datasets: [
      {
        label: 'Quantidade de Pedidos',
        data: counts,
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 1
      },
      {
        label: 'Receita (R$)',
        data: revenues,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      }
    ]
  }
})

const chartOptions = computed(() => ({
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
          if (context.datasetIndex === 0) {
            return `${context.dataset.label}: ${context.parsed.y} pedidos`
          } else {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y * 100)}`
          }
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}))
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
}

.chart-wrapper {
  height: 300px;
  position: relative;
}
</style>

