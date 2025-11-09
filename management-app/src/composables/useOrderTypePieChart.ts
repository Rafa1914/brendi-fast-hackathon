import { computed, type Ref } from 'vue'
import type { ChartData } from 'chart.js'
import type { OrderTypeDistribution } from '@/types/analytics'

export function useOrderTypePieChart(orderTypeDistribution: Ref<OrderTypeDistribution[] | undefined>) {
  const chartData = computed<ChartData<'pie'> | null>(() => {
    if (!orderTypeDistribution.value || orderTypeDistribution.value.length === 0) {
      return null
    }

    const colors = [
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(255, 206, 86, 0.8)',
    ]

    return {
      labels: orderTypeDistribution.value.map((item) => item.label),
      datasets: [
        {
          label: 'Quantidade de Pedidos',
          data: orderTypeDistribution.value.map((item) => item.count),
          backgroundColor: colors.slice(0, orderTypeDistribution.value.length),
          borderColor: colors.slice(0, orderTypeDistribution.value.length).map((color) => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    }
  })

  return {
    chartData,
  }
}

