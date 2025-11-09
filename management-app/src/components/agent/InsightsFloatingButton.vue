<template>
  <div class="insights-wrapper">
    <!-- Botão minimizado -->
    <button
      v-if="!isExpanded"
      class="insights__toggle-button"
      @click="toggleInsights"
      aria-label="Gerar insights"
    >
      <span class="insights__toggle-icon">💡</span>
    </button>

    <!-- Card de Insights expandido -->
    <BaseCard v-else class="insights__card">
      <div class="insights">
        <div class="insights__header">
          <h3 class="insights__title">Insights do Período</h3>
          <div class="insights__header-actions">
            <BaseButton
              variant="ghost"
              @click="toggleInsights"
              aria-label="Fechar insights"
            >
              ✕
            </BaseButton>
          </div>
        </div>

        <div class="insights__content">
          <div v-if="insights && !loading" class="insights__content-inner">
            <!-- Resumo Executivo -->
            <div v-if="insights.summary" class="insights__summary">
              <p class="insights__summary-text">{{ insights.summary }}</p>
            </div>

            <!-- Destaques -->
            <div v-if="insights.highlights && insights.highlights.length > 0" class="insights__highlights">
              <h4 class="insights__section-title">Destaques</h4>
              <ul class="insights__list">
                <li v-for="(highlight, index) in insights.highlights" :key="index" class="insights__list-item">
                  {{ highlight }}
                </li>
              </ul>
            </div>

            <!-- Recomendações -->
            <div v-if="insights.recommendations && insights.recommendations.length > 0" class="insights__recommendations">
              <h4 class="insights__section-title">Recomendações</h4>
              <ul class="insights__list insights__list--recommendations">
                <li v-for="(recommendation, index) in insights.recommendations" :key="index" class="insights__list-item">
                  {{ recommendation }}
                </li>
              </ul>
            </div>

            <!-- Seções Detalhadas -->
            <div v-if="insights.sections && insights.sections.length > 0" class="insights__sections">
              <div
                v-for="(section, index) in insights.sections"
                :key="index"
                class="insights__section"
              >
                <h4 class="insights__section-title">{{ section.title }}</h4>
                <p class="insights__section-content">{{ section.content }}</p>
              </div>
            </div>
          </div>

          <div v-else-if="!loading" class="insights__empty">
            <p>Clique em "Gerar Insights" para obter uma análise detalhada do período atual.</p>
            <BaseButton
              :disabled="!analyticsStore.analytics"
              @click="generateInsights"
              style="margin-top: 1rem;"
            >
              Gerar Insights
            </BaseButton>
          </div>

          <div v-if="loading" class="insights__loading">
            <BaseLoading />
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
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

const isExpanded = ref(false)
const insights = ref<InsightsResponse | null>(null)
const loading = ref(false)

const toggleInsights = () => {
  isExpanded.value = !isExpanded.value
}

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
.insights-wrapper {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

.insights__toggle-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.insights__toggle-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.insights__toggle-button:active {
  transform: scale(0.95);
}

.insights__toggle-icon {
  font-size: 1.5rem;
}

.insights__card {
  width: 400px;
  max-width: calc(100vw - 3rem);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.insights {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-height: calc(100vh - 8rem);
}

.insights__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.insights__header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.insights__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.insights__content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.insights__content-inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insights__summary {
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  border-left: 2px solid var(--color-primary);
}

.insights__summary-text {
  color: var(--color-text);
  line-height: 1.6;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 400;
}

.insights__section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid var(--color-border);
}

.insights__highlights,
.insights__recommendations {
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.insights__highlights {
  border-left: 2px solid var(--color-success);
}

.insights__recommendations {
  border-left: 2px solid var(--color-warning);
}

.insights__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insights__list-item {
  color: var(--color-text);
  line-height: 1.5;
  font-size: 0.8125rem;
  padding-left: 1.25rem;
  position: relative;
}

.insights__list-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
  font-size: 1.25rem;
}

.insights__list--recommendations .insights__list-item::before {
  color: var(--color-warning);
}

.insights__sections {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insights__section {
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.insights__section-content {
  color: var(--color-text);
  line-height: 1.6;
  font-size: 0.8125rem;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.insights__empty {
  padding: 1.5rem;
  text-align: center;
  color: var(--color-text-light);
  font-size: 0.875rem;
}

.insights__loading {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

