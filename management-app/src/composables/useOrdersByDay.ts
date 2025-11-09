import { computed, type ComputedRef } from 'vue'
import type { Order } from '@/types/order'
import type { ChartData } from 'chart.js'

export function useOrdersByDay(orders: ComputedRef<Order[]> | Order[]) {
  const ordersValue = computed(() => {
    return Array.isArray(orders) ? orders : orders.value
  })

  const chartData = computed<ChartData<'line'> | null>(() => {
    const ordersList = ordersValue.value
    if (ordersList.length === 0) return null

    // Agrupar pedidos por dia
    const ordersByDay = new Map<string, { count: number; revenue: number }>()
    
    ordersList.forEach(order => {
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

