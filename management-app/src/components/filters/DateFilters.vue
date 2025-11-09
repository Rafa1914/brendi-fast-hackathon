<template>
  <BaseCard>
    <div class="date-filters">
      <h3 class="date-filters__title">Filtros de Data</h3>
      <div class="date-filters__content">
        <div class="date-filters__group">
          <label class="date-filters__label">Data Inicial</label>
          <input
            v-model="localStartDate"
            type="date"
            class="date-filters__input"
            @change="applyFilters"
          />
        </div>
        <div class="date-filters__group">
          <label class="date-filters__label">Data Final</label>
          <input
            v-model="localEndDate"
            type="date"
            class="date-filters__input"
            @change="applyFilters"
          />
        </div>
        <div class="date-filters__actions">
          <BaseButton variant="ghost" @click="clearFilters">
            Limpar
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseButton from '@/components/design-system/BaseButton.vue'
import type { OrderFilters } from '@/types/order'

const props = defineProps<{
  filters?: OrderFilters
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: OrderFilters): void
}>()

const localStartDate = ref(props.filters?.dateRange?.startDate || '')
const localEndDate = ref(props.filters?.dateRange?.endDate || '')

const applyFilters = () => {
  const filters: OrderFilters = {}
  
  if (localStartDate.value || localEndDate.value) {
    filters.dateRange = {}
    if (localStartDate.value) {
      filters.dateRange.startDate = localStartDate.value
    }
    if (localEndDate.value) {
      filters.dateRange.endDate = localEndDate.value
    }
  }
  
  emit('update:filters', filters)
}

const clearFilters = () => {
  localStartDate.value = ''
  localEndDate.value = ''
  emit('update:filters', {})
}

watch(() => props.filters, (newFilters) => {
  if (newFilters?.dateRange) {
    localStartDate.value = newFilters.dateRange.startDate || ''
    localEndDate.value = newFilters.dateRange.endDate || ''
  } else {
    localStartDate.value = ''
    localEndDate.value = ''
  }
}, { deep: true })
</script>

<style scoped>
.date-filters {
  padding: 1rem;
}

.date-filters__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
  transition: color 0.3s ease;
}

.date-filters__content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.date-filters__group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-filters__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.date-filters__input {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color 0.2s ease, background-color 0.3s ease, color 0.3s ease;
  font-family: inherit;
}

.date-filters__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.date-filters__actions {
  display: flex;
  align-items: center;
}
</style>

