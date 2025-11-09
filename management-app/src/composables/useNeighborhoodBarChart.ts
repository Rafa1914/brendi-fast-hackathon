import { computed, type Ref } from 'vue'
import type { ChartData } from 'chart.js'
import type { NeighborhoodDistribution } from '@/types/analytics'

export function useNeighborhoodBarChart(neighborhoodDistribution: Ref<NeighborhoodDistribution[] | undefined>) {
  const chartData = computed<ChartData<'bar'> | null>(() => {
    if (!neighborhoodDistribution.value || neighborhoodDistribution.value.length === 0) {
      return null
    }

    // Limitar aos top 10 bairros para melhor visualização
    const topNeighborhoods = neighborhoodDistribution.value.slice(0, 10)

    // Cores gradientes para o gráfico
    const colors = [
      'rgba(54, 162, 235, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(201, 203, 207, 0.8)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
    ]

    return {
      labels: topNeighborhoods.map((item) => item.neighborhood),
      datasets: [
        {
          label: 'Pedidos Entregues',
          data: topNeighborhoods.map((item) => item.count),
          backgroundColor: colors.slice(0, topNeighborhoods.length),
          borderColor: colors.slice(0, topNeighborhoods.length).map((color) => color.replace('0.8', '1').replace('0.6', '1')),
          borderWidth: 2,
        },
      ],
    }
  })

  return {
    chartData,
  }
}

