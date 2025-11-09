import { computed, type Ref } from 'vue'
import type { ChartData } from 'chart.js'
import type { ProductAnalysis } from '@/types/analytics'

export function useTopProductsPieChart(topProducts: Ref<ProductAnalysis[] | undefined>) {
  const chartData = computed<ChartData<'pie'> | null>(() => {
    if (!topProducts.value || topProducts.value.length === 0) {
      return null
    }

    const colors = [
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
    ]

    return {
      labels: topProducts.value.map((product) => product.name),
      datasets: [
        {
          label: '% de Receita',
          data: topProducts.value.map((product) => product.revenuePercentage || 0),
          backgroundColor: colors.slice(0, topProducts.value.length),
          borderColor: colors.slice(0, topProducts.value.length).map((color) => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    }
  })

  return {
    chartData,
  }
}

