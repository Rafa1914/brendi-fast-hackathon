import { computed, type ComputedRef } from 'vue'
import type { Order } from '@/types/order'
import type { ChartData } from 'chart.js'

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

export function useOrdersByWeek(orders: ComputedRef<Order[]> | Order[]) {
  const ordersValue = computed(() => {
    return Array.isArray(orders) ? orders : orders.value
  })

  const chartData = computed<ChartData<'bar'> | null>(() => {
    const ordersList = ordersValue.value
    if (ordersList.length === 0) return null

    // Agrupar pedidos por semana
    const ordersByWeek = new Map<string, { count: number; revenue: number }>()
    
    ordersList.forEach(order => {
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

  return {
    chartData
  }
}

