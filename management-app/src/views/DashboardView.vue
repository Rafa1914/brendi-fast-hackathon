<template>
  <AppLayout :store-name="storeStore.storeName">
    <div class="dashboard">
      <!-- Filtros de Data e Período -->
      <div class="dashboard__filters-row">
        <DateFilters
          :filters="analyticsStore.filters"
          @update:filters="handleFiltersUpdate"
          :disabled="analyticsStore.loading || feedbackStore.loading"
        />
        <PeriodIndicator
          v-if="analyticsStore.analytics && !analyticsStore.loading"
          :period-info="analyticsStore.analytics.periodInfo"
        />
      </div>

      <!-- Abas -->
      <BaseTabs
        :tabs="tabs"
        :activeTab="activeTab"
        @update:activeTab="activeTab = $event"
      >
        <template #default="{ activeTab: currentTab }">
          <!-- Aba Dashboard -->
          <div v-if="currentTab === 'dashboard'" class="dashboard__tab-content">

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
        <!-- Primeira Linha: Pedidos por Dia + Top 5 Produtos -->
        <div class="dashboard__charts-row dashboard__charts-row--split">
          <!-- Gráfico de Pedidos com Toggle Dia/Semana -->
          <BaseCard>
            <div class="dashboard__chart-header">
              <h3 class="dashboard__chart-title">Pedidos por {{ chartView === 'day' ? 'Dia' : 'Semana' }}</h3>
              <div class="dashboard__chart-toggle">
                <button
                  :class="['dashboard__toggle-button', { 'dashboard__toggle-button--active': chartView === 'day' }]"
                  @click="chartView = 'day'"
                >
                  Dia
                </button>
                <button
                  :class="['dashboard__toggle-button', { 'dashboard__toggle-button--active': chartView === 'week' }]"
                  @click="chartView = 'week'"
                >
                  Semana
                </button>
              </div>
            </div>
            <div class="dashboard__chart-wrapper">
              <Line
                v-if="!analyticsStore.loading && currentChartData"
                :data="currentChartData"
                :options="lineChartOptions"
              />
              <BaseSkeleton v-else-if="analyticsStore.loading" width="100%" height="300px" />
            </div>
          </BaseCard>

          <!-- Top 5 Produtos -->
          <BasePieChart
            v-if="!analyticsStore.loading && topProductsPieChartData"
            title="Top 5 Produtos - % de Receita"
            :data="topProductsPieChartData"
          />
          <BaseCard v-else-if="analyticsStore.loading" class="dashboard__chart-skeleton">
            <BaseSkeleton width="50%" height="1.25rem" style="margin-bottom: 1.5rem;" />
            <BaseSkeleton width="300px" height="300px" variant="circular" style="margin: 0 auto;" />
          </BaseCard>
        </div>

        <!-- Segunda Linha: Distribuição por Tipo + Distribuição por Bairro -->
        <div class="dashboard__charts-row dashboard__charts-row--split">
          <!-- Distribuição de Pedidos por Tipo -->
          <BasePieChart
            v-if="!analyticsStore.loading && orderTypePieChartData"
            title="Distribuição de Pedidos por Tipo"
            :data="orderTypePieChartData"
          />
          <BaseCard v-else-if="analyticsStore.loading" class="dashboard__chart-skeleton">
            <BaseSkeleton width="50%" height="1.25rem" style="margin-bottom: 1.5rem;" />
            <BaseSkeleton width="300px" height="300px" variant="circular" style="margin: 0 auto;" />
          </BaseCard>

          <!-- Gráfico de Distribuição por Bairro -->
          <BaseBarChart
            v-if="!analyticsStore.loading && neighborhoodBarChartData"
            title="Distribuição de Pedidos Entregues por Bairro"
            :data="neighborhoodBarChartData"
            :options="neighborhoodChartOptions"
          />
          <BaseCard v-else-if="analyticsStore.loading" class="dashboard__chart-skeleton">
            <BaseSkeleton width="50%" height="1.25rem" style="margin-bottom: 1.5rem;" />
            <BaseSkeleton width="100%" height="300px" />
          </BaseCard>
        </div>
      </div>


      <!-- Tempos de Preparação e Clientes Fiéis -->
      <div class="dashboard__content-row dashboard__content-row--split">
        <BaseCard>
          <h3 class="dashboard__section-title">Tempos de Preparação</h3>
          <div v-if="analyticsStore.loading" class="dashboard__loading-content">
            <div v-for="i in 5" :key="i" class="dashboard__skeleton-item">
              <BaseSkeleton width="50%" height="1rem" />
              <BaseSkeleton width="30%" height="0.875rem" style="margin-top: 0.5rem;" />
              <BaseSkeleton width="35%" height="1.25rem" style="margin-top: 0.5rem; margin-left: auto;" />
            </div>
          </div>
          <div v-else-if="!analyticsStore.analytics?.preparationTimeStats" class="dashboard__empty">
            <p>Nenhum dado de tempo de preparação disponível</p>
          </div>
          <div v-else class="dashboard__preparation-times">
            <p class="dashboard__preparation-note">
              ℹ️ Nem todos os pedidos possuem dados de tempo de preparação disponíveis.
            </p>
            <div class="dashboard__preparation-times-list">
              <div class="dashboard__preparation-time-item">
                <div class="dashboard__preparation-time-header">
                  <span class="dashboard__preparation-time-label">⏱️ Tempo até Confirmação</span>
                </div>
                <div class="dashboard__preparation-time-value">
                  {{ formatTime(analyticsStore.analytics.preparationTimeStats.averageTimeToConfirm) }}
                </div>
              </div>
              <div class="dashboard__preparation-time-item">
                <div class="dashboard__preparation-time-header">
                  <span class="dashboard__preparation-time-label">🍕 Tempo até Pronto</span>
                </div>
                <div class="dashboard__preparation-time-value">
                  {{ formatTime(analyticsStore.analytics.preparationTimeStats.averageTimeToReady) }}
                </div>
              </div>
              <div class="dashboard__preparation-time-item">
                <div class="dashboard__preparation-time-header">
                  <span class="dashboard__preparation-time-label">🚚 Tempo em Trânsito</span>
                </div>
                <div class="dashboard__preparation-time-value">
                  {{ formatTime(analyticsStore.analytics.preparationTimeStats.averageTimeToTransit) }}
                </div>
              </div>
              <div class="dashboard__preparation-time-item">
                <div class="dashboard__preparation-time-header">
                  <span class="dashboard__preparation-time-label">✅ Tempo até Entrega</span>
                </div>
                <div class="dashboard__preparation-time-value">
                  {{ formatTime(analyticsStore.analytics.preparationTimeStats.averageTimeToDelivered) }}
                </div>
              </div>
              <div class="dashboard__preparation-time-item dashboard__preparation-time-item--total">
                <div class="dashboard__preparation-time-header">
                  <span class="dashboard__preparation-time-label">⏳ Tempo Total Médio</span>
                </div>
                <div class="dashboard__preparation-time-value dashboard__preparation-time-value--total">
                  {{ formatTime(analyticsStore.analytics.preparationTimeStats.totalTimeAverage) }}
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

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
      </div>

          </div>

          <!-- Aba Clientes -->
          <div v-if="currentTab === 'customers'" class="dashboard__tab-content">
            <CustomersTab />
          </div>
        </template>
      </BaseTabs>

      <!-- Botão Flutuante de Insights -->
      <InsightsFloatingButton />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import { useStoreStore } from '@/stores/store'
import { useFeedbackStore } from '@/stores/feedback'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseStatCard from '@/components/design-system/BaseStatCard.vue'
import BaseTabs from '@/components/layout/BaseTabs.vue'
import CustomersTab from '@/components/customers/CustomersTab.vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)
import BasePieChart from '@/components/design-system/BasePieChart.vue'
import BaseBarChart from '@/components/design-system/BaseBarChart.vue'
import BaseSkeleton from '@/components/design-system/BaseSkeleton.vue'
import PeriodIndicator from '@/components/analytics/PeriodIndicator.vue'
import DateFilters from '@/components/filters/DateFilters.vue'
import InsightsFloatingButton from '@/components/agent/InsightsFloatingButton.vue'
import { formatCurrency, formatTime } from '@/utils/format'
import { useOrdersByDayChart } from '@/composables/useOrdersByDayChart'
import { useOrdersByWeekChart } from '@/composables/useOrdersByWeekChart'
import { useTopProductsPieChart } from '@/composables/useTopProductsPieChart'
import { useOrderTypePieChart } from '@/composables/useOrderTypePieChart'
import { useNeighborhoodBarChart } from '@/composables/useNeighborhoodBarChart'
import type { AnalyticsFilters } from '@/types/analytics'
import type { ChartOptions, ChartData } from 'chart.js'

const analyticsStore = useAnalyticsStore()
const storeStore = useStoreStore()
const feedbackStore = useFeedbackStore()

const activeTab = ref('dashboard')

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'customers', label: 'Clientes' }
]

const chartView = ref<'day' | 'week'>('day')

const ordersByDay = computed(() => analyticsStore.analytics?.ordersByDay || [])
const ordersByWeek = computed(() => analyticsStore.analytics?.ordersByWeek || [])
const topProducts = computed(() => analyticsStore.analytics?.topProducts)
const orderTypeDistribution = computed(() => analyticsStore.analytics?.orderTypeDistribution)
const neighborhoodDistribution = computed(() => analyticsStore.analytics?.neighborhoodDistribution)

const { chartData: ordersByDayChartData } = useOrdersByDayChart(ordersByDay)
const { chartData: ordersByWeekChartData } = useOrdersByWeekChart(ordersByWeek)
const { chartData: topProductsPieChartData } = useTopProductsPieChart(topProducts)
const { chartData: orderTypePieChartData } = useOrderTypePieChart(orderTypeDistribution)
const { chartData: neighborhoodBarChartData } = useNeighborhoodBarChart(neighborhoodDistribution)

const currentChartData = computed<ChartData<'line'> | null>(() => {
  if (chartView.value === 'day') {
    return ordersByDayChartData.value
  } else {
    return ordersByWeekChartData.value
  }
})

const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top' as const
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          
          if (label.includes('Receita') || label.includes('R$')) {
            return `${label}: ${formatCurrency(value * 100)}`
          }
          if (label.includes('Pedidos') || label.includes('Quantidade')) {
            return `${label}: ${value} pedidos`
          }
          return `${label}: ${value}`
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      title: {
        display: true,
        text: 'Quantidade de Pedidos'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
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

const neighborhoodChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed.y
          const neighborhood = neighborhoodDistribution.value?.[context.dataIndex]
          if (neighborhood) {
            return [
              `Pedidos: ${value}`,
              `Receita: ${formatCurrency(neighborhood.revenue / 100)}`,
              `Percentual: ${neighborhood.percentage.toFixed(1)}%`
            ]
          }
          return `Pedidos: ${value}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Quantidade de Pedidos'
      }
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
}

const handleFiltersUpdate = async (filters: AnalyticsFilters) => {
  await analyticsStore.fetchAnalytics(filters)
  // Atualizar feedbacks quando os filtros mudarem
  if (filters.dateRange) {
    await feedbackStore.fetchFeedbackAnalytics({
      dateRange: {
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate
      }
    })
  }
}

// Observar mudanças na aba para carregar feedbacks quando necessário
watch(activeTab, async (newTab) => {
  if (newTab === 'customers' && !feedbackStore.analytics) {
    await feedbackStore.fetchFeedbackAnalytics(analyticsStore.filters)
  }
})

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
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.dashboard__charts-row--split {
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 1024px) {
  .dashboard__charts-row--split {
    grid-template-columns: 1fr;
  }
}

.dashboard__chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  padding-top: 1rem;
}

.dashboard__chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  transition: color 0.3s ease;
}

.dashboard__chart-toggle {
  display: flex;
  gap: 0.5rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  padding: 0.25rem;
  border: 1px solid var(--color-border);
}

.dashboard__toggle-button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-light);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dashboard__toggle-button:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.dashboard__toggle-button--active {
  background: var(--color-primary);
  color: white;
}

.dashboard__toggle-button--active:hover {
  background: var(--color-primary-dark);
}

.dashboard__chart-wrapper {
  padding: 0 1rem 1rem 1rem;
  height: 300px;
  position: relative;
  overflow: hidden;
}

.dashboard__preparation-note {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin: 0 0 1rem 0;
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-warning);
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

.dashboard__content-row--split {
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 1024px) {
  .dashboard__content-row--split {
    grid-template-columns: 1fr;
  }
}

.dashboard__content-row--with-insights {
  grid-template-columns: 2fr 1fr;
}

@media (max-width: 1024px) {
  .dashboard__content-row--with-insights {
    grid-template-columns: 1fr;
  }
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

.dashboard__insights-wrapper {
  display: flex;
  flex-direction: column;
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

.dashboard__preparation-times {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard__preparation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
}

.dashboard__preparation-label {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.dashboard__preparation-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.dashboard__preparation-times-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard__preparation-time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
}

.dashboard__preparation-time-item--total {
  border: 2px solid var(--color-primary);
  background: var(--color-background);
}

.dashboard__preparation-time-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard__preparation-time-label {
  font-weight: 600;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.dashboard__preparation-time-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}

.dashboard__preparation-time-value--total {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.dashboard__tab-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
