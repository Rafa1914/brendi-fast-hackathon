<template>
  <AppLayout :store-name="storeStore.storeName">
    <div class="dashboard">
      <!-- Filtros de Data e Período -->
      <div class="dashboard__filters-row">
        <DateFilters
          :filters="analyticsStore.filters"
          @update:filters="handleFiltersUpdate"
          :disabled="analyticsStore.loading"
        />
        <PeriodIndicator
          v-if="analyticsStore.analytics && !analyticsStore.loading"
          :period-info="analyticsStore.analytics.periodInfo"
        />
      </div>

      <!-- Estatísticas Principais -->
      <div class="dashboard__stats">
        <BaseStatCard
          v-if="!analyticsStore.loading && analyticsStore.analytics"
          title="Receita Total"
          :value="analyticsStore.analytics.stats.totalRevenue / 100"
          format="currency"
          variant="primary"
          icon="💰"
        >
          <template #icon>💰</template>
        </BaseStatCard>
        <BaseCard v-else class="dashboard__stat-skeleton">
          <div class="dashboard__skeleton-content">
            <BaseSkeleton width="60%" height="0.875rem" />
            <BaseSkeleton width="80%" height="2rem" style="margin-top: 0.5rem;" />
          </div>
        </BaseCard>

        <BaseStatCard
          v-if="!analyticsStore.loading && analyticsStore.analytics"
          title="Total de Pedidos"
          :value="analyticsStore.analytics.stats.totalOrders"
          format="number"
          variant="success"
          icon="🛒"
        >
          <template #icon>🛒</template>
        </BaseStatCard>
        <BaseCard v-else-if="analyticsStore.loading" class="dashboard__stat-skeleton">
          <div class="dashboard__skeleton-content">
            <BaseSkeleton width="60%" height="0.875rem" />
            <BaseSkeleton width="80%" height="2rem" style="margin-top: 0.5rem;" />
          </div>
        </BaseCard>

        <BaseStatCard
          v-if="!analyticsStore.loading && analyticsStore.analytics"
          title="Ticket Médio"
          :value="analyticsStore.analytics.stats.averageOrderValue / 100"
          format="currency"
          variant="warning"
          icon="📊"
        >
          <template #icon>📊</template>
        </BaseStatCard>
        <BaseCard v-else-if="analyticsStore.loading" class="dashboard__stat-skeleton">
          <div class="dashboard__skeleton-content">
            <BaseSkeleton width="60%" height="0.875rem" />
            <BaseSkeleton width="80%" height="2rem" style="margin-top: 0.5rem;" />
          </div>
        </BaseCard>
      </div>

      <!-- Gráficos e Análises -->
      <div class="dashboard__main-content">
        <!-- Gráficos de Linha e Barra -->
        <div class="dashboard__charts-row">
          <BaseLineChart
            v-if="!analyticsStore.loading && ordersByDayChartData"
            title="Pedidos por Dia"
            :data="ordersByDayChartData"
            :options="lineChartOptions"
          />
          <BaseCard v-else-if="analyticsStore.loading" class="dashboard__chart-skeleton">
            <BaseSkeleton width="40%" height="1.25rem" style="margin-bottom: 1.5rem;" />
            <BaseSkeleton width="100%" height="300px" />
          </BaseCard>

          <BaseBarChart
            v-if="!analyticsStore.loading && ordersByWeekChartData"
            title="Pedidos por Semana"
            :data="ordersByWeekChartData"
          />
          <BaseCard v-else-if="analyticsStore.loading" class="dashboard__chart-skeleton">
            <BaseSkeleton width="40%" height="1.25rem" style="margin-bottom: 1.5rem;" />
            <BaseSkeleton width="100%" height="300px" />
          </BaseCard>
        </div>

        <!-- Gráficos de Pizza -->
        <div class="dashboard__pie-charts-row">
          <BasePieChart
            v-if="!analyticsStore.loading && topProductsPieChartData"
            title="Top 5 Produtos - % de Receita"
            :data="topProductsPieChartData"
          />
          <BaseCard v-else-if="analyticsStore.loading" class="dashboard__chart-skeleton">
            <BaseSkeleton width="50%" height="1.25rem" style="margin-bottom: 1.5rem;" />
            <BaseSkeleton width="300px" height="300px" variant="circular" style="margin: 0 auto;" />
          </BaseCard>

          <BasePieChart
            v-if="!analyticsStore.loading && orderTypePieChartData"
            title="Distribuição de Pedidos por Tipo"
            :data="orderTypePieChartData"
          />
          <BaseCard v-else-if="analyticsStore.loading" class="dashboard__chart-skeleton">
            <BaseSkeleton width="50%" height="1.25rem" style="margin-bottom: 1.5rem;" />
            <BaseSkeleton width="300px" height="300px" variant="circular" style="margin: 0 auto;" />
          </BaseCard>
        </div>
      </div>

      <!-- Análise de Produtos e Distribuição -->
      <div class="dashboard__content-row">
        <BaseCard>
          <h3 class="dashboard__section-title">Top 5 Produtos</h3>
          <div v-if="analyticsStore.loading" class="dashboard__loading-content">
            <div v-for="i in 5" :key="i" class="dashboard__skeleton-item">
              <BaseSkeleton width="60%" height="1rem" />
              <BaseSkeleton width="30%" height="0.875rem" style="margin-top: 0.5rem;" />
              <BaseSkeleton width="25%" height="1.125rem" style="margin-top: 0.5rem; margin-left: auto;" />
            </div>
          </div>
          <div v-else-if="!analyticsStore.analytics || analyticsStore.analytics.topProducts.length === 0" class="dashboard__empty">
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
                <span class="dashboard__product-quantity">
                  {{ product.totalQuantity }} vendidos
                  <span v-if="product.revenuePercentage" class="dashboard__product-percentage">
                    • {{ product.revenuePercentage.toFixed(1) }}% da receita
                  </span>
                </span>
              </div>
              <div class="dashboard__product-revenue">
                {{ formatCurrency(product.totalRevenue / 100) }}
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Distribuição por Período -->
        <BaseCard>
          <h3 class="dashboard__section-title">Distribuição por Período</h3>
          <div v-if="analyticsStore.loading" class="dashboard__loading-content">
            <div v-for="i in 4" :key="i" class="dashboard__skeleton-item">
              <BaseSkeleton width="50%" height="1rem" />
              <BaseSkeleton width="30%" height="0.875rem" style="margin-top: 0.5rem;" />
              <BaseSkeleton width="35%" height="1.25rem" style="margin-top: 0.5rem; margin-left: auto;" />
            </div>
          </div>
          <div v-else class="dashboard__periods">
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
                {{ formatCurrency(period.revenue / 100) }}
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Insights do Período -->
      <div class="dashboard__insights">
        <InsightsCard />
      </div>

      <!-- Clientes Fiéis e Pedidos Recentes -->
      <div class="dashboard__content-row">
        <BaseCard>
          <h3 class="dashboard__section-title">Clientes Mais Fiéis</h3>
          <div v-if="analyticsStore.loading" class="dashboard__loading-content">
            <div v-for="i in 5" :key="i" class="dashboard__skeleton-item">
              <BaseSkeleton width="40%" height="1rem" />
              <BaseSkeleton width="30%" height="0.875rem" style="margin-top: 0.5rem;" />
              <div style="display: flex; gap: 1rem; margin-top: 0.5rem; margin-left: auto;">
                <BaseSkeleton width="60px" height="0.75rem" />
                <BaseSkeleton width="80px" height="0.75rem" />
                <BaseSkeleton width="90px" height="1rem" />
              </div>
            </div>
          </div>
          <div v-else-if="!analyticsStore.analytics || analyticsStore.analytics.loyalCustomers.length === 0" class="dashboard__empty">
            <p>Nenhum dado disponível para análise</p>
          </div>
          <div v-else class="dashboard__loyal-customers">
            <div
              v-for="(customer, index) in analyticsStore.analytics.loyalCustomers"
              :key="`${customer.customer.phone}-${index}`"
              class="dashboard__customer-item"
            >
              <div class="dashboard__customer-info">
                <span class="dashboard__customer-name">{{ customer.customer.name }}</span>
                <span class="dashboard__customer-phone">{{ customer.customer.phone }}</span>
              </div>
              <div class="dashboard__customer-stats">
                <div class="dashboard__customer-stat">
                  <span class="dashboard__stat-label">Pedidos:</span>
                  <span class="dashboard__stat-value">{{ customer.totalOrders }}</span>
                </div>
                <div class="dashboard__customer-stat">
                  <span class="dashboard__stat-label">Ticket Médio:</span>
                  <span class="dashboard__stat-value">{{ formatCurrency(customer.averageTicket / 100) }}</span>
                </div>
                <div class="dashboard__customer-stat">
                  <span class="dashboard__stat-label">Total:</span>
                  <span class="dashboard__stat-value dashboard__stat-value--primary">{{ formatCurrency(customer.totalRevenue / 100) }}</span>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Pedidos Recentes -->
        <BaseCard>
          <h3 class="dashboard__section-title">Pedidos Recentes</h3>
          <OrderList
            :orders="analyticsStore.analytics?.recentOrders || []"
            :loading="analyticsStore.loading"
            :error="analyticsStore.error"
          />
        </BaseCard>
      </div>

      <!-- Chat com Agent (flutuante) -->
      <Chat />
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
import BasePieChart from '@/components/design-system/BasePieChart.vue'
import BaseSkeleton from '@/components/design-system/BaseSkeleton.vue'
import OrderList from '@/components/orders/OrderList.vue'
import PeriodIndicator from '@/components/analytics/PeriodIndicator.vue'
import DateFilters from '@/components/filters/DateFilters.vue'
import Chat from '@/components/agent/Chat.vue'
import InsightsCard from '@/components/agent/InsightsCard.vue'
import { formatCurrency } from '@/utils/format'
import { useOrdersByDayChart } from '@/composables/useOrdersByDayChart'
import { useOrdersByWeekChart } from '@/composables/useOrdersByWeekChart'
import { useTopProductsPieChart } from '@/composables/useTopProductsPieChart'
import { useOrderTypePieChart } from '@/composables/useOrderTypePieChart'
import type { AnalyticsFilters } from '@/types/analytics'
import type { ChartOptions } from 'chart.js'

const analyticsStore = useAnalyticsStore()
const storeStore = useStoreStore()

const ordersByDay = computed(() => analyticsStore.analytics?.ordersByDay || [])
const ordersByWeek = computed(() => analyticsStore.analytics?.ordersByWeek || [])
const topProducts = computed(() => analyticsStore.analytics?.topProducts)
const orderTypeDistribution = computed(() => analyticsStore.analytics?.orderTypeDistribution)

const { chartData: ordersByDayChartData } = useOrdersByDayChart(ordersByDay)
const { chartData: ordersByWeekChartData } = useOrdersByWeekChart(ordersByWeek)
const { chartData: topProductsPieChartData } = useTopProductsPieChart(topProducts)
const { chartData: orderTypePieChartData } = useOrderTypePieChart(orderTypeDistribution)

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

.dashboard__main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard__charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
}

.dashboard__pie-charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.dashboard__content-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.dashboard__stat-skeleton {
  min-height: 120px;
}

.dashboard__chart-skeleton {
  min-height: 350px;
}

.dashboard__skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dashboard__loading-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard__skeleton-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.dashboard__insights {
  margin-top: 2rem;
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

.dashboard__product-percentage {
  color: var(--color-primary);
  font-weight: 600;
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

.dashboard__loyal-customers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard__customer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard__customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 200px;
}

.dashboard__customer-name {
  font-weight: 600;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.dashboard__customer-phone {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.dashboard__customer-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.dashboard__customer-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.dashboard__stat-label {
  font-size: 0.75rem;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dashboard__stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.dashboard__stat-value--primary {
  color: var(--color-primary);
  font-size: 1.125rem;
}
</style>
