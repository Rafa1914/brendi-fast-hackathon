<template>
  <AppLayout>
    <template #header-actions>
      <BaseButton @click="refreshData" :loading="orderStore.loading">
        Atualizar
      </BaseButton>
    </template>

    <div class="dashboard">
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
import BaseButton from '@/components/design-system/BaseButton.vue'
import BaseStatCard from '@/components/design-system/BaseStatCard.vue'
import OrderList from '@/components/orders/OrderList.vue'

const orderStore = useOrderStore()
const storeStore = useStoreStore()

const recentOrders = computed(() => {
  return orderStore.orders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
})

const refreshData = async () => {
  await orderStore.fetchOrders()
}

onMounted(async () => {
  await orderStore.fetchOrders()
  // Assumindo que há uma loja padrão com ID '1' - pode ser ajustado
  await storeStore.fetchStore('1')
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

.dashboard__content {
  margin-top: 1rem;
}

.dashboard__section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1.5rem 0;
}
</style>

