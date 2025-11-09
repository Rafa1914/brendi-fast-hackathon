<template>
  <div class="order-list">
    <div v-if="loading" class="order-list__loading">
      <BaseLoading message="Carregando pedidos..." />
    </div>
    <div v-else-if="error" class="order-list__error">
      <p>Erro ao carregar pedidos: {{ error.message }}</p>
    </div>
    <div v-else-if="orders.length === 0" class="order-list__empty">
      <p>Nenhum pedido encontrado</p>
    </div>
    <div v-else class="order-list__grid">
      <BaseCard
        v-for="order in orders"
        :key="order.id"
        hover
        class="order-list__item"
      >
        <div class="order-item">
          <div class="order-item__header">
            <div class="order-item__info">
              <h3 class="order-item__id">Pedido #{{ order.id.slice(0, 8) }}</h3>
              <p class="order-item__date">{{ formatDateTime(order.createdAt) }}</p>
            </div>
            <div class="order-item__total">
              {{ formatCurrency(order.totalPrice) }}
            </div>
          </div>
          <div class="order-item__products">
            <div
              v-for="product in order.products"
              :key="product.id"
              class="order-item__product"
            >
              <span class="order-item__product-name">{{ product.name }}</span>
              <span class="order-item__product-quantity">x{{ product.quantity }}</span>
              <span class="order-item__product-price">{{ formatCurrency(product.price * product.quantity) }}</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '@/types/order'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseLoading from '@/components/design-system/BaseLoading.vue'
import { formatCurrency, formatDateTime } from '@/utils/format'

defineProps<{
  orders: Order[]
  loading?: boolean
  error?: Error | null
}>()
</script>

<style scoped>
.order-list__loading,
.order-list__error,
.order-list__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.order-list__error p,
.order-list__empty p {
  color: var(--color-text-light);
  font-size: 1rem;
}

.order-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.order-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.order-item__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-item__id {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.order-item__date {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin: 0;
}

.order-item__total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.order-item__products {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item__product {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.order-item__product-name {
  flex: 1;
  color: var(--color-text);
}

.order-item__product-quantity {
  color: var(--color-text-light);
  margin: 0 0.5rem;
}

.order-item__product-price {
  font-weight: 500;
  color: var(--color-text);
}
</style>

