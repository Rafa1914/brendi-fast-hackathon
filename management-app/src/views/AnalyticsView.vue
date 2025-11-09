<template>
  <AppLayout>
    <template #header-actions>
      <BaseButton @click="refreshData" :loading="orderStore.loading">
        Atualizar
      </BaseButton>
    </template>

    <div class="analytics">
      <div class="analytics__overview">
        <BaseStatCard
          title="Receita Total"
          :value="orderStore.totalRevenue"
          format="currency"
          variant="primary"
        >
          <template #icon>💰</template>
        </BaseStatCard>

        <BaseStatCard
          title="Total de Pedidos"
          :value="orderStore.totalOrders"
          format="number"
          variant="success"
        >
          <template #icon>🛒</template>
        </BaseStatCard>

        <BaseStatCard
          title="Ticket Médio"
          :value="orderStore.averageOrderValue"
          format="currency"
          variant="warning"
        >
          <template #icon>📊</template>
        </BaseStatCard>
      </div>

      <div class="analytics__content">
        <BaseCard>
          <h3 class="analytics__section-title">Análise de Produtos</h3>
          <div v-if="productAnalysis.length === 0" class="analytics__empty">
            <p>Nenhum dado disponível para análise</p>
          </div>
          <div v-else class="analytics__products">
            <div
              v-for="product in productAnalysis"
              :key="product.id"
              class="analytics__product-item"
            >
              <div class="analytics__product-info">
                <span class="analytics__product-name">{{ product.name }}</span>
                <span class="analytics__product-quantity">{{ product.totalQuantity }} vendidos</span>
              </div>
              <div class="analytics__product-revenue">
                {{ formatCurrency(product.totalRevenue) }}
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <h3 class="analytics__section-title">Distribuição por Período</h3>
          <div class="analytics__periods">
            <div
              v-for="period in periodDistribution"
              :key="period.label"
              class="analytics__period-item"
            >
              <div class="analytics__period-header">
                <span class="analytics__period-label">{{ period.label }}</span>
                <span class="analytics__period-count">{{ period.count }} pedidos</span>
              </div>
              <div class="analytics__period-revenue">
                {{ formatCurrency(period.revenue) }}
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseButton from '@/components/design-system/BaseButton.vue'
import BaseStatCard from '@/components/design-system/BaseStatCard.vue'

const orderStore = useOrderStore()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value/100)
}

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
    { label: 'Hoje', start: today, count: 0, revenue: 0 },
    { label: 'Ontem', start: yesterday, end: today, count: 0, revenue: 0 },
    { label: 'Última Semana', start: lastWeek, end: today, count: 0, revenue: 0 },
    { label: 'Último Mês', start: lastMonth, end: today, count: 0, revenue: 0 }
  ]
  
  orderStore.orders.forEach(order => {
    const orderDate = new Date(order.createdAt)
    
    periods.forEach(period => {
      if (orderDate >= period.start && (!period.end || orderDate < period.end)) {
        period.count++
        period.revenue += order.totalPrice
      }
    })
  })
  
  return periods
})

const refreshData = async () => {
  await orderStore.fetchOrders()
}

onMounted(async () => {
  await orderStore.fetchOrders()
})
</script>

<style scoped>
.analytics {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.analytics__overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.analytics__content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.analytics__section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1.5rem 0;
}

.analytics__empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-light);
}

.analytics__products {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analytics__product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.analytics__product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.analytics__product-name {
  font-weight: 600;
  color: var(--color-text);
}

.analytics__product-quantity {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.analytics__product-revenue {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}

.analytics__periods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analytics__period-item {
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.analytics__period-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.analytics__period-label {
  font-weight: 600;
  color: var(--color-text);
}

.analytics__period-count {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.analytics__period-revenue {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}
</style>

