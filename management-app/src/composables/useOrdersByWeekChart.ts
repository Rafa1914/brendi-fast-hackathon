import { computed, type ComputedRef } from 'vue'
import type { OrdersByWeek } from '@/types/analytics'
import type { ChartData } from 'chart.js'

export function useOrdersByWeekChart(ordersByWeek: ComputedRef<OrdersByWeek[]> | OrdersByWeek[]) {
  const ordersByWeekValue = computed(() => {
    return Array.isArray(ordersByWeek) ? ordersByWeek : ordersByWeek.value
  })

  const chartData = computed<ChartData<'line'> | null>(() => {
    const data = ordersByWeekValue.value
    if (data.length === 0) return null

    const labels = data.map((item) => item.week)
    const counts = data.map((item) => item.count)
    const revenues = data.map((item) => item.revenue / 100)

    return {
      labels,
      datasets: [
        {
          label: 'Quantidade de Pedidos',
          data: counts,
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4,
          fill: false,
          yAxisID: 'y'
        },
        {
          label: 'Receita (R$)',
          data: revenues,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    }
  })

  return {
    chartData
  }
}

