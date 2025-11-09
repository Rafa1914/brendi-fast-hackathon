import { computed, type ComputedRef } from 'vue'
import type { OrdersByWeek } from '@/types/analytics'
import type { ChartData } from 'chart.js'

export function useOrdersByWeekChart(ordersByWeek: ComputedRef<OrdersByWeek[]> | OrdersByWeek[]) {
  const ordersByWeekValue = computed(() => {
    return Array.isArray(ordersByWeek) ? ordersByWeek : ordersByWeek.value
  })

  const chartData = computed<ChartData<'bar'> | null>(() => {
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

  return {
    chartData
  }
}

