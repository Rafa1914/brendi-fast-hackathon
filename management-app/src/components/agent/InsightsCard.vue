<template>
  <BaseCard>
    <div class="insights-card">
      <div class="insights-card__header">
        <h3 class="insights-card__title">Insights do Período</h3>
        <BaseButton
          :disabled="loading"
          @click="generateInsights"
        >
          {{ loading ? 'Gerando...' : 'Gerar Insights' }}
        </BaseButton>
      </div>

      <div v-if="insights" class="insights-card__content">
        <div class="insights-card__text">{{ insights }}</div>
      </div>

      <div v-else-if="!loading" class="insights-card__empty">
        <p>Clique em "Gerar Insights" para obter uma análise detalhada do período atual.</p>
      </div>

      <div v-if="loading" class="insights-card__loading">
        <BaseLoading />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseButton from '@/components/design-system/BaseButton.vue'
import BaseLoading from '@/components/design-system/BaseLoading.vue'
import { useAgentApi } from '@/composables/useAgentApi'
import { useAnalyticsStore } from '@/stores/analytics'

const analyticsStore = useAnalyticsStore()
const { generateInsights: generateInsightsApi } = useAgentApi()

const insights = ref<string | null>(null)
const loading = ref(false)

const generateInsights = async () => {
  if (!analyticsStore.analytics || loading.value) return

  loading.value = true
  insights.value = null

  try {
    const { execute, data } = generateInsightsApi(
      analyticsStore.analytics,
      `${analyticsStore.analytics.periodInfo.startDate} até ${analyticsStore.analytics.periodInfo.endDate}`
    )
    await execute()

    if (data.value) {
      insights.value = data.value.insights
    }
  } catch (error) {
    console.error('Erro ao gerar insights:', error)
    insights.value = 'Desculpe, ocorreu um erro ao gerar os insights. Tente novamente.'
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.insights-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insights-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.insights-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.insights-card__content {
  padding: 1rem 0;
}

.insights-card__text {
  color: var(--color-text);
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.9375rem;
}

.insights-card__empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-light);
}

.insights-card__loading {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
