import { computed, type ComputedRef } from 'vue'
import type { OrdersByDay } from '@/types/analytics'
import type { ChartData } from 'chart.js'

export function useOrdersByDayChart(ordersByDay: ComputedRef<OrdersByDay[]> | OrdersByDay[]) {
  const ordersByDayValue = computed(() => {
    return Array.isArray(ordersByDay) ? ordersByDay : ordersByDay.value
  })

  const chartData = computed<ChartData<'line'> | null>(() => {
    const data = ordersByDayValue.value
    if (data.length === 0) return null

    const labels = data.map((item) => item.date)
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

