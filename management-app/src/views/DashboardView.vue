<template>
  <AppLayout :store-name="storeStore.storeName">
    <div class="dashboard">
      <!-- Filtros de Data e Período -->
      <div class="dashboard__filters-row">
        <DateFilters
          :filters="analyticsStore.filters"
          @update:filters="handleFiltersUpdate"
        />
        <PeriodIndicator
          v-if="analyticsStore.analytics"
          :period-info="analyticsStore.analytics.periodInfo"
        />
      </div>

      <!-- Estatísticas Principais -->
      <div class="dashboard__stats">
        <BaseStatCard
          v-if="analyticsStore.analytics"
          title="Receita Total"
          :value="analyticsStore.analytics.stats.totalRevenue / 100"
          format="currency"
          variant="primary"
          icon="💰"
        >
          <template #icon>💰</template>
        </BaseStatCard>

        <BaseStatCard
          v-if="analyticsStore.analytics"
          title="Total de Pedidos"
          :value="analyticsStore.analytics.stats.totalOrders"
          format="number"
          variant="success"
          icon="🛒"
        >
          <template #icon>🛒</template>
        </BaseStatCard>

        <BaseStatCard
          v-if="analyticsStore.analytics"
          title="Ticket Médio"
          :value="analyticsStore.analytics.stats.averageOrderValue / 100"
          format="currency"
          variant="warning"
          icon="📊"
        >
          <template #icon>📊</template>
        </BaseStatCard>
      </div>

      <!-- Gráficos -->
      <div class="dashboard__charts">
        <BaseLineChart
          v-if="ordersByDayChartData"
          title="Pedidos por Dia"
          :data="ordersByDayChartData"
          :options="lineChartOptions"
        />
        <BaseBarChart
          v-if="ordersByWeekChartData"
          title="Pedidos por Semana"
          :data="ordersByWeekChartData"
        />
      </div>

      <!-- Análise de Produtos -->
      <div class="dashboard__content">
        <BaseCard>
          <h3 class="dashboard__section-title">Top Produtos</h3>
          <div v-if="!analyticsStore.analytics || analyticsStore.analytics.topProducts.length === 0" class="dashboard__empty">
            <p>Nenhum dado disponível para análise</p>
          </div>
          <div v-else class="dashboard__products">
            <div
              v-for="product in analyticsStore.analytics.topProducts"
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
              v-for="period in analyticsStore.analytics?.periodDistribution || []"
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
            :orders="analyticsStore.analytics?.recentOrders || []"
            :loading="analyticsStore.loading"
            :error="analyticsStore.error"
          />
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { useStoreStore } from '@/stores/store'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseStatCard from '@/components/design-system/BaseStatCard.vue'
import BaseBarChart from '@/components/design-system/BaseBarChart.vue'
import BaseLineChart from '@/components/design-system/BaseLineChart.vue'
import OrderList from '@/components/orders/OrderList.vue'
import PeriodIndicator from '@/components/analytics/PeriodIndicator.vue'
import DateFilters from '@/components/filters/DateFilters.vue'
import { formatCurrency } from '@/utils/format'
import { useOrdersByDayChart } from '@/composables/useOrdersByDayChart'
import { useOrdersByWeekChart } from '@/composables/useOrdersByWeekChart'
import type { AnalyticsFilters } from '@/types/analytics'
import type { ChartOptions } from 'chart.js'

const analyticsStore = useAnalyticsStore()
const storeStore = useStoreStore()

const ordersByDay = computed(() => analyticsStore.analytics?.ordersByDay || [])
const ordersByWeek = computed(() => analyticsStore.analytics?.ordersByWeek || [])

const { chartData: ordersByDayChartData } = useOrdersByDayChart(ordersByDay)
const { chartData: ordersByWeekChartData } = useOrdersByWeekChart(ordersByWeek)

const lineChartOptions: ChartOptions<'line'> = {
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Quantidade de Pedidos'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Receita (R$)'
      },
      grid: {
        drawOnChartArea: false
      }
    }
  }
}

const handleFiltersUpdate = async (filters: AnalyticsFilters) => {
  await analyticsStore.fetchAnalytics(filters)
}

onMounted(async () => {
  await analyticsStore.fetchAnalytics()
  await storeStore.fetchStore('J9UBYRwCqHDlhyhLeY28')
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard__filters-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
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
