<template>
  <AppLayout>
    <div class="dashboard">
      <!-- Filtros de Data -->
      <DateFilters
        :filters="orderStore.filters"
        @update:filters="handleFiltersUpdate"
      />

      <!-- Indicador de Período -->
      <PeriodIndicator :orders="orderStore.orders" />

      <!-- Estatísticas Principais -->
      <div class="dashboard__stats">
        <BaseStatCard
          title="Receita Total"
          :value="orderStore.totalRevenue"
          format="currency"
          variant="primary"
          icon="💰"
        >
          <template #icon>💰</template>
        </BaseStatCard>

        <BaseStatCard
          title="Total de Pedidos"
          :value="orderStore.totalOrders"
          format="number"
          variant="success"
          icon="🛒"
        >
          <template #icon>🛒</template>
        </BaseStatCard>

        <BaseStatCard
          title="Ticket Médio"
          :value="orderStore.averageOrderValue"
          format="currency"
          variant="warning"
          icon="📊"
        >
          <template #icon>📊</template>
        </BaseStatCard>

        <BaseStatCard
          title="Loja"
          :value="storeStore.storeName"
          variant="primary"
          icon="🏪"
        >
          <template #icon>🏪</template>
        </BaseStatCard>
      </div>

      <!-- Gráficos -->
      <div class="dashboard__charts">
        <OrdersByDayChart :orders="orderStore.orders" />
        <OrdersByWeekChart :orders="orderStore.orders" />
      </div>

      <!-- Análise de Produtos -->
      <div class="dashboard__content">
        <BaseCard>
          <h3 class="dashboard__section-title">Top Produtos</h3>
          <div v-if="productAnalysis.length === 0" class="dashboard__empty">
            <p>Nenhum dado disponível para análise</p>
          </div>
          <div v-else class="dashboard__products">
            <div
              v-for="product in productAnalysis"
              :key="product.id"
              class="dashboard__product-item"
            >
              <div class="dashboard__product-info">
                <span class="dashboard__product-name">{{ product.name }}</span>
                <span class="dashboard__product-quantity">{{ product.totalQuantity }} vendidos</span>
              </div>
              <div class="dashboard__product-revenue">
                {{ formatCurrency(product.totalRevenue) }}
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Distribuição por Período -->
        <BaseCard>
          <h3 class="dashboard__section-title">Distribuição por Período</h3>
          <div class="dashboard__periods">
            <div
              v-for="period in periodDistribution"
              :key="period.label"
              class="dashboard__period-item"
            >
              <div class="dashboard__period-header">
                <span class="dashboard__period-label">{{ period.label }}</span>
                <span class="dashboard__period-count">{{ period.count }} pedidos</span>
              </div>
              <div class="dashboard__period-revenue">
                {{ formatCurrency(period.revenue) }}
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Pedidos Recentes -->
      <div class="dashboard__content">
        <BaseCard>
          <h3 class="dashboard__section-title">Pedidos Recentes</h3>
          <OrderList
            :orders="recentOrders"
            :loading="orderStore.loading"
            :error="orderStore.error"
          />
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useStoreStore } from '@/stores/store'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseStatCard from '@/components/design-system/BaseStatCard.vue'
import OrderList from '@/components/orders/OrderList.vue'
import OrdersByDayChart from '@/components/charts/OrdersByDayChart.vue'
import OrdersByWeekChart from '@/components/charts/OrdersByWeekChart.vue'
import PeriodIndicator from '@/components/analytics/PeriodIndicator.vue'
import DateFilters from '@/components/filters/DateFilters.vue'
import { formatCurrency } from '@/utils/format'
import type { OrderFilters } from '@/types/order'

const orderStore = useOrderStore()
const storeStore = useStoreStore()

const recentOrders = computed(() => {
  return orderStore.orders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
})

const productAnalysis = computed(() => {
  const productMap = new Map<string, { id: string; name: string; totalQuantity: number; totalRevenue: number }>()
  
  orderStore.orders.forEach(order => {
    order.products.forEach(product => {
      const existing = productMap.get(product.id) || {
        id: product.id,
        name: product.name,
        totalQuantity: 0,
        totalRevenue: 0
      }
      
      existing.totalQuantity += product.quantity
      existing.totalRevenue += product.price * product.quantity
      
      productMap.set(product.id, existing)
    })
  })
  
  return Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)
})

const periodDistribution = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  const periods = [
    { label: 'Hoje', start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000), count: 0, revenue: 0 },
    { label: 'Ontem', start: yesterday, end: today, count: 0, revenue: 0 },
    { label: 'Última Semana', start: lastWeek, end: today, count: 0, revenue: 0 },
    { label: 'Último Mês', start: lastMonth, end: today, count: 0, revenue: 0 }
  ]
  
  orderStore.orders.forEach(order => {
    const orderDate = new Date(order.createdAt)
    
    periods.forEach(period => {
      if (orderDate >= period.start && orderDate < period.end) {
        period.count++
        period.revenue += order.totalPrice
      }
    })
  })
  
  return periods
})

const handleFiltersUpdate = async (filters: OrderFilters) => {
  await orderStore.fetchOrders(filters)
}

onMounted(async () => {
  await orderStore.fetchOrders()
  await storeStore.fetchStore('J9UBYRwCqHDlhyhLeY28')
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.dashboard__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
}

.dashboard__content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.dashboard__section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1.5rem 0;
  transition: color 0.3s ease;
}

.dashboard__empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-light);
}

.dashboard__products {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard__product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
}

.dashboard__product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dashboard__product-name {
  font-weight: 600;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.dashboard__product-quantity {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.dashboard__product-revenue {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}

.dashboard__periods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard__period-item {
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
}

.dashboard__period-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.dashboard__period-label {
  font-weight: 600;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.dashboard__period-count {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.dashboard__period-revenue {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
