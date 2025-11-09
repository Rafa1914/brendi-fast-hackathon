<template>
  <div class="customers-tab">
    <!-- Estatísticas de Feedbacks -->
    <div class="customers-tab__stats">
      <BaseStatCard
        v-if="!feedbackStore.loading && feedbackStore.analytics"
        title="Total de Feedbacks"
        :value="feedbackStore.analytics.stats.totalFeedbacks"
        format="number"
        variant="primary"
      >
        <template #icon>💬</template>
      </BaseStatCard>
      <BaseCard v-else class="customers-tab__stat-skeleton">
        <div class="customers-tab__skeleton-content">
          <BaseSkeleton width="60%" height="0.875rem" />
          <BaseSkeleton width="80%" height="2rem" style="margin-top: 0.5rem;" />
        </div>
      </BaseCard>

      <BaseStatCard
        v-if="!feedbackStore.loading && feedbackStore.analytics"
        title="Avaliação Média"
        :value="feedbackStore.analytics.stats.averageRating"
        format="decimal"
        variant="success"
      >
        <template #icon>⭐</template>
      </BaseStatCard>
      <BaseCard v-else-if="feedbackStore.loading" class="customers-tab__stat-skeleton">
        <div class="customers-tab__skeleton-content">
          <BaseSkeleton width="60%" height="0.875rem" />
          <BaseSkeleton width="80%" height="2rem" style="margin-top: 0.5rem;" />
        </div>
      </BaseCard>

      <BaseStatCard
        v-if="!feedbackStore.loading && feedbackStore.analytics"
        title="Feedbacks Positivos (4-5)"
        :value="feedbackStore.analytics.stats.positiveFeedbacks"
        format="number"
        variant="warning"
      >
        <template #icon>👍</template>
      </BaseStatCard>
      <BaseCard v-else-if="feedbackStore.loading" class="customers-tab__stat-skeleton">
        <div class="customers-tab__skeleton-content">
          <BaseSkeleton width="60%" height="0.875rem" />
          <BaseSkeleton width="80%" height="2rem" style="margin-top: 0.5rem;" />
        </div>
      </BaseCard>
    </div>

    <!-- Gráficos de Distribuição -->
    <div class="customers-tab__charts">
      <BaseBarChart
        v-if="!feedbackStore.loading && ratingChartData"
        title="Distribuição por Avaliação"
        :data="ratingChartData"
        :options="ratingChartOptions"
      />
      <BaseCard v-else>
        <div class="customers-tab__chart-skeleton">
          <BaseSkeleton width="40%" height="1.25rem" style="margin-bottom: 1.5rem;" />
          <BaseSkeleton width="100%" height="300px" />
        </div>
      </BaseCard>

      <BasePieChart
        v-if="!feedbackStore.loading && categoryChartData"
        title="Distribuição por Categoria"
        :data="categoryChartData"
      />
      <BaseCard v-else-if="feedbackStore.loading">
        <div class="customers-tab__chart-skeleton">
          <BaseSkeleton width="40%" height="1.25rem" style="margin-bottom: 1.5rem;" />
          <BaseSkeleton width="100%" height="300px" />
        </div>
      </BaseCard>
    </div>

    <!-- Top Clientes e Lista de Feedbacks -->
    <div class="customers-tab__content-row">
      <!-- Top Clientes -->
      <BaseCard class="customers-tab__card">
        <h3 class="customers-tab__section-title">Top Clientes</h3>
        <div v-if="feedbackStore.loading" class="customers-tab__loading-content">
          <div v-for="i in 5" :key="i" class="customers-tab__skeleton-item">
            <BaseSkeleton width="40%" height="1rem" />
            <BaseSkeleton width="30%" height="0.875rem" style="margin-top: 0.5rem;" />
            <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
              <BaseSkeleton width="60px" height="0.75rem" />
              <BaseSkeleton width="80px" height="0.75rem" />
            </div>
          </div>
        </div>
        <div v-else-if="!feedbackStore.analytics || feedbackStore.analytics.topCustomers.length === 0" class="customers-tab__empty">
          <p>Nenhum cliente encontrado</p>
        </div>
        <div v-else class="customers-tab__top-customers">
          <div
            v-for="(customer, index) in feedbackStore.analytics.topCustomers"
            :key="customer.storeConsumerId"
            class="customers-tab__customer-item"
          >
            <div class="customers-tab__customer-rank">#{{ index + 1 }}</div>
            <div class="customers-tab__customer-info">
              <span class="customers-tab__customer-name">{{ customer.customerName }}</span>
              <span class="customers-tab__customer-phone">{{ customer.customerPhone || 'N/A' }}</span>
            </div>
            <div class="customers-tab__customer-stats">
              <div class="customers-tab__customer-stat">
                <span class="customers-tab__stat-label">Feedbacks:</span>
                <span class="customers-tab__stat-value">{{ customer.totalFeedbacks }}</span>
              </div>
              <div class="customers-tab__customer-stat">
                <span class="customers-tab__stat-label">Avaliação:</span>
                <span class="customers-tab__stat-value">{{ customer.averageRating.toFixed(1) }} ⭐</span>
              </div>
              <div class="customers-tab__customer-stat">
                <span class="customers-tab__stat-label">Pedidos:</span>
                <span class="customers-tab__stat-value">{{ customer.totalOrders }}</span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Lista de Feedbacks -->
      <BaseCard class="customers-tab__card">
        <h3 class="customers-tab__section-title">Feedbacks Recentes</h3>
        <div v-if="feedbackStore.loading" class="customers-tab__loading-content">
          <div v-for="i in 5" :key="i" class="customers-tab__skeleton-item">
            <BaseSkeleton width="50%" height="1rem" />
            <BaseSkeleton width="30%" height="0.875rem" style="margin-top: 0.5rem;" />
            <BaseSkeleton width="100%" height="2rem" style="margin-top: 0.5rem;" />
          </div>
        </div>
        <div v-else-if="!feedbackStore.analytics || feedbackStore.analytics.recentFeedbacks.length === 0" class="customers-tab__empty">
          <p>Nenhum feedback encontrado para o período selecionado</p>
        </div>
        <div v-else class="customers-tab__feedbacks">
          <div
            v-for="feedback in feedbackStore.analytics.recentFeedbacks"
            :key="feedback.id"
            class="customers-tab__feedback-item"
            @click="openOrderModal(feedback.orderId)"
          >
            <div class="customers-tab__feedback-header">
              <div class="customers-tab__feedback-rating">
                <span class="customers-tab__rating-value">{{ feedback.rating }}</span>
                <span class="customers-tab__rating-stars">⭐</span>
              </div>
              <div class="customers-tab__feedback-meta">
                <span class="customers-tab__feedback-category">{{ formatCategory(feedback.category) }}</span>
                <span class="customers-tab__feedback-date">{{ formatDate(feedback.createdAt) }}</span>
              </div>
            </div>
            <div class="customers-tab__feedback-content">
              <p class="customers-tab__feedback-text">{{ feedback.ratedResponse }}</p>
            </div>
            <div class="customers-tab__feedback-footer">
              <span class="customers-tab__feedback-order">Pedido: {{ feedback.orderId }}</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Modal de Detalhes do Pedido -->
    <BaseModal
      v-model="isOrderModalOpen"
      title="Detalhes do Pedido"
    >
      <div v-if="orderLoading" class="customers-tab__modal-loading">
        <BaseSkeleton width="100%" height="2rem" style="margin-bottom: 1rem;" />
        <BaseSkeleton width="80%" height="1.5rem" style="margin-bottom: 1rem;" />
        <BaseSkeleton width="100%" height="1.5rem" style="margin-bottom: 0.5rem;" />
        <BaseSkeleton width="100%" height="1.5rem" style="margin-bottom: 0.5rem;" />
        <BaseSkeleton width="100%" height="1.5rem" />
      </div>
      <div v-else-if="orderError" class="customers-tab__modal-error">
        <p>Erro ao carregar os dados do pedido: {{ orderError }}</p>
      </div>
      <div v-else-if="!selectedOrder" class="customers-tab__modal-error">
        <p>Pedido não encontrado</p>
      </div>
      <div v-else class="customers-tab__order-details">
        <div class="customers-tab__order-section">
          <h3 class="customers-tab__order-section-title">Informações do Pedido</h3>
          <div class="customers-tab__order-info">
            <div class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">ID:</span>
              <span class="customers-tab__order-info-value">{{ selectedOrder.id }}</span>
            </div>
            <div class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">Tipo:</span>
              <span class="customers-tab__order-info-value">{{ formatOrderType(selectedOrder.type) }}</span>
            </div>
            <div class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">Data:</span>
              <span class="customers-tab__order-info-value">{{ formatDateTime(selectedOrder.createdAt) }}</span>
            </div>
            <div class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">Total:</span>
              <span class="customers-tab__order-info-value customers-tab__order-info-value--price">
                {{ formatCurrency(selectedOrder.totalPrice) }}
              </span>
            </div>
          </div>
        </div>

        <div class="customers-tab__order-section">
          <h3 class="customers-tab__order-section-title">Cliente</h3>
          <div class="customers-tab__order-info">
            <div class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">Nome:</span>
              <span class="customers-tab__order-info-value">{{ selectedOrder.customer.name }}</span>
            </div>
            <div class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">Telefone:</span>
              <span class="customers-tab__order-info-value">{{ selectedOrder.customer.phone }}</span>
            </div>
          </div>
        </div>

        <div class="customers-tab__order-section">
          <h3 class="customers-tab__order-section-title">Produtos</h3>
          <div class="customers-tab__order-products">
            <div
              v-for="product in selectedOrder.products"
              :key="product.id"
              class="customers-tab__order-product"
            >
              <div class="customers-tab__order-product-info">
                <span class="customers-tab__order-product-name">{{ product.name }}</span>
                <span class="customers-tab__order-product-quantity">Qtd: {{ product.quantity }}</span>
              </div>
              <span class="customers-tab__order-product-price">
                {{ formatCurrency(product.price * product.quantity) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.elapsedTimes" class="customers-tab__order-section">
          <h3 class="customers-tab__order-section-title">Tempos</h3>
          <div class="customers-tab__order-info">
            <div v-if="selectedOrder.elapsedTimes.timeToConfirm" class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">Até Confirmação:</span>
              <span class="customers-tab__order-info-value">
                {{ formatTime(selectedOrder.elapsedTimes.timeToConfirm) }}
              </span>
            </div>
            <div v-if="selectedOrder.elapsedTimes.timeToReady" class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">Até Pronto:</span>
              <span class="customers-tab__order-info-value">
                {{ formatTime(selectedOrder.elapsedTimes.timeToReady) }}
              </span>
            </div>
            <div v-if="selectedOrder.elapsedTimes.timeToTransit" class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">Em Trânsito:</span>
              <span class="customers-tab__order-info-value">
                {{ formatTime(selectedOrder.elapsedTimes.timeToTransit) }}
              </span>
            </div>
            <div v-if="selectedOrder.elapsedTimes.timeToDelivered" class="customers-tab__order-info-item">
              <span class="customers-tab__order-info-label">Até Entrega:</span>
              <span class="customers-tab__order-info-value">
                {{ formatTime(selectedOrder.elapsedTimes.timeToDelivered) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'
import { useOrderApi } from '@/composables/useOrderApi'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseStatCard from '@/components/design-system/BaseStatCard.vue'
import BaseSkeleton from '@/components/design-system/BaseSkeleton.vue'
import BaseBarChart from '@/components/design-system/BaseBarChart.vue'
import BasePieChart from '@/components/design-system/BasePieChart.vue'
import BaseModal from '@/components/design-system/BaseModal.vue'
import type { ChartOptions, ChartData } from 'chart.js'
import type { Order } from '@/types/order'
import { OrderType } from '@/types/order'
import { formatCurrency, formatDateTime, formatTime } from '@/utils/format'

const feedbackStore = useFeedbackStore()
const { getOrderById } = useOrderApi()

const isOrderModalOpen = ref(false)
const selectedOrderId = ref<string | null>(null)
const selectedOrder = ref<Order | null>(null)
const orderLoading = ref(false)
const orderError = ref<string | null>(null)

const openOrderModal = async (orderId: string) => {
  selectedOrderId.value = orderId
  selectedOrder.value = null
  orderError.value = null
  isOrderModalOpen.value = true
}

watch(isOrderModalOpen, async (isOpen) => {
  if (isOpen && selectedOrderId.value) {
    orderLoading.value = true
    orderError.value = null
    
    try {
      const { data, execute } = getOrderById(selectedOrderId.value)
      await execute()
      
      if (data.value) {
        selectedOrder.value = data.value
      } else {
        orderError.value = 'Pedido não encontrado'
      }
    } catch (err) {
      orderError.value = err instanceof Error ? err.message : 'Erro ao carregar pedido'
    } finally {
      orderLoading.value = false
    }
  }
})

const formatOrderType = (type: OrderType): string => {
  const typeMap: Record<OrderType, string> = {
    [OrderType.DELIVERY]: 'Entrega',
    [OrderType.PICKUP]: 'Retirada',
    [OrderType.OTHER]: 'Outro'
  }
  return typeMap[type] || type
}

const ratingChartData = computed<ChartData<'bar'> | null>(() => {
  if (!feedbackStore.analytics || feedbackStore.analytics.ratingDistribution.length === 0) {
    return null
  }

  return {
    labels: feedbackStore.analytics.ratingDistribution.map(r => `${r.rating} ⭐`),
    datasets: [
      {
        label: 'Quantidade de Feedbacks',
        data: feedbackStore.analytics.ratingDistribution.map(r => r.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)', // 1 - vermelho
          'rgba(245, 158, 11, 0.8)', // 2 - laranja
          'rgba(234, 179, 8, 0.8)',  // 3 - amarelo
          'rgba(34, 197, 94, 0.8)',  // 4 - verde
          'rgba(34, 197, 94, 0.8)',  // 5 - verde
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1
      }
    ]
  }
})

const categoryChartData = computed(() => {
  if (!feedbackStore.analytics || feedbackStore.analytics.categoryDistribution.length === 0) {
    return null
  }

  return {
    labels: feedbackStore.analytics.categoryDistribution.map(c => c.categoryLabel),
    datasets: [
      {
        data: feedbackStore.analytics.categoryDistribution.map(c => c.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ]
      }
    ]
  }
})

const ratingChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}

const formatCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'delivery-speed': 'Velocidade de Entrega',
    'delivery-experience': 'Experiência de Entrega',
    'overall-experience': 'Experiência Geral',
    'food-quality': 'Qualidade da Comida',
    'service': 'Atendimento'
  }
  return categoryMap[category] || category
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.customers-tab {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.customers-tab__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.customers-tab__stat-skeleton {
  min-height: 120px;
}

.customers-tab__skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}

.customers-tab__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .customers-tab__charts {
    grid-template-columns: 1fr;
  }
}

.customers-tab__chart-skeleton {
  padding: 1rem;
}

.customers-tab__content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .customers-tab__content-row {
    grid-template-columns: 1fr;
  }
}

.customers-tab__section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
}

.customers-tab__loading-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.customers-tab__skeleton-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.customers-tab__card {
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow: hidden;
  padding: 0;
}

.customers-tab__card > .customers-tab__section-title {
  flex-shrink: 0;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.customers-tab__card > .customers-tab__top-customers,
.customers-tab__card > .customers-tab__feedbacks,
.customers-tab__card > .customers-tab__loading-content,
.customers-tab__card > .customers-tab__empty {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.customers-tab__card > .customers-tab__loading-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.customers-tab__card > .customers-tab__empty {
  padding: 2rem 1.5rem;
}

.customers-tab__empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-light);
}

.customers-tab__top-customers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  margin: 0;
}

.customers-tab__customer-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
}

.customers-tab__customer-rank {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
  min-width: 35px;
  text-align: center;
}

.customers-tab__customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.customers-tab__customer-name {
  font-weight: 600;
  color: var(--color-text);
}

.customers-tab__customer-phone {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.customers-tab__customer-stats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.8125rem;
}

.customers-tab__customer-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.customers-tab__stat-label {
  font-size: 0.75rem;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.customers-tab__stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.customers-tab__feedbacks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  margin: 0;
}

.customers-tab__feedback-item {
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.customers-tab__feedback-item:hover {
  background: var(--color-surface);
}

.customers-tab__feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.customers-tab__feedback-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.customers-tab__rating-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}

.customers-tab__rating-stars {
  font-size: 1rem;
}

.customers-tab__feedback-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.customers-tab__feedback-category {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.customers-tab__feedback-date {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.customers-tab__feedback-content {
  margin-bottom: 0.5rem;
}

.customers-tab__feedback-text {
  color: var(--color-text);
  line-height: 1.4;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.customers-tab__feedback-footer {
  display: flex;
  justify-content: flex-end;
}

.customers-tab__feedback-order {
  font-size: 0.75rem;
  color: var(--color-text-light);
  font-family: monospace;
}

/* Modal Styles */
.customers-tab__modal-loading,
.customers-tab__modal-error {
  padding: 2rem;
  text-align: center;
}

.customers-tab__modal-error {
  color: var(--color-danger);
}

.customers-tab__order-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.customers-tab__order-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.customers-tab__order-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.customers-tab__order-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.customers-tab__order-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.customers-tab__order-info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.customers-tab__order-info-value {
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 500;
}

.customers-tab__order-info-value--price {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.customers-tab__order-products {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.customers-tab__order-product {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.customers-tab__order-product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.customers-tab__order-product-name {
  font-weight: 600;
  color: var(--color-text);
}

.customers-tab__order-product-quantity {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.customers-tab__order-product-price {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
}
</style>

