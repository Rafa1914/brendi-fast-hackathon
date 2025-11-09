<template>
  <BaseCard>
    <div class="chart-container">
      <h3 class="chart-title">Pedidos por Dia</h3>
      <div class="chart-wrapper">
        <Line
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
import type { Order } from '@/types/order'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  orders: Order[]
}>()

const chartData = computed(() => {
  if (props.orders.length === 0) return null

  // Agrupar pedidos por dia
  const ordersByDay = new Map<string, { count: number; revenue: number }>()
  
  props.orders.forEach(order => {
    const date = new Date(order.createdAt)
    // Formatar apenas a data (sem hora) para agrupar por dia
    const dayKey = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    
    const existing = ordersByDay.get(dayKey) || { count: 0, revenue: 0 }
    existing.count++
    existing.revenue += order.totalPrice
    
    ordersByDay.set(dayKey, existing)
  })

  // Ordenar por data
  const sortedDays = Array.from(ordersByDay.entries())
    .sort((a, b) => new Date(a[0].split('/').reverse().join('-')).getTime() - new Date(b[0].split('/').reverse().join('-')).getTime())

  const labels = sortedDays.map(([day]) => day)
  const counts = sortedDays.map(([, data]) => data.count)
  const revenues = sortedDays.map(([, data]) => data.revenue / 100)

  return {
    labels,
    datasets: [
      {
        label: 'Quantidade de Pedidos',
        data: counts,
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Receita (R$)',
        data: revenues,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
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
            return `${context.dataset.label}: R$ ${context.parsed.y.toFixed(2)}`
          }
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Quantidade de Pedidos'
      }
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Receita (R$)'
      },
      grid: {
        drawOnChartArea: false
      }
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

