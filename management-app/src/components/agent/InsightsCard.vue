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

      <div v-if="insights && !loading" class="insights-card__content">
        <!-- Resumo Executivo -->
        <div v-if="insights.summary" class="insights-card__summary">
          <p class="insights-card__summary-text">{{ insights.summary }}</p>
        </div>

        <!-- Destaques -->
        <div v-if="insights.highlights && insights.highlights.length > 0" class="insights-card__highlights">
          <h4 class="insights-card__section-title">Destaques</h4>
          <ul class="insights-card__list">
            <li v-for="(highlight, index) in insights.highlights" :key="index" class="insights-card__list-item">
              {{ highlight }}
            </li>
          </ul>
        </div>

        <!-- Recomendações -->
        <div v-if="insights.recommendations && insights.recommendations.length > 0" class="insights-card__recommendations">
          <h4 class="insights-card__section-title">Recomendações</h4>
          <ul class="insights-card__list insights-card__list--recommendations">
            <li v-for="(recommendation, index) in insights.recommendations" :key="index" class="insights-card__list-item">
              {{ recommendation }}
            </li>
          </ul>
        </div>

        <!-- Seções Detalhadas -->
        <div v-if="insights.sections && insights.sections.length > 0" class="insights-card__sections">
          <div
            v-for="(section, index) in insights.sections"
            :key="index"
            class="insights-card__section"
          >
            <h4 class="insights-card__section-title">{{ section.title }}</h4>
            <p class="insights-card__section-content">{{ section.content }}</p>
          </div>
        </div>
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

import type { InsightsResponse } from '@/types/agent'

const analyticsStore = useAnalyticsStore()
const { generateInsights: generateInsightsApi } = useAgentApi()

const insights = ref<InsightsResponse | null>(null)
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
      insights.value = data.value
    }
  } catch (error) {
    console.error('Erro ao gerar insights:', error)
    insights.value = {
      summary: 'Desculpe, ocorreu um erro ao gerar os insights. Tente novamente.',
      highlights: [],
      recommendations: [],
      sections: []
    }
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.insights-card__summary {
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary);
}

.insights-card__summary-text {
  color: var(--color-text);
  line-height: 1.8;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.insights-card__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.insights-card__highlights,
.insights-card__recommendations {
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.insights-card__highlights {
  border-left: 3px solid var(--color-success);
}

.insights-card__recommendations {
  border-left: 3px solid var(--color-warning);
}

.insights-card__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insights-card__list-item {
  color: var(--color-text);
  line-height: 1.7;
  font-size: 0.9375rem;
  padding-left: 1.5rem;
  position: relative;
}

.insights-card__list-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
  font-size: 1.25rem;
}

.insights-card__list--recommendations .insights-card__list-item::before {
  color: var(--color-warning);
}

.insights-card__sections {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.insights-card__section {
  padding: 1rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.insights-card__section-content {
  color: var(--color-text);
  line-height: 1.8;
  font-size: 0.9375rem;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
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
