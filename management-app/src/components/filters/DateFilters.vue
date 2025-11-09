<template>
  <div class="date-filters">
    <div class="date-filters__presets">
      <button
        v-for="preset in presets"
        :key="preset.id"
        class="date-filters__preset"
        :class="{ 'date-filters__preset--active': selectedPreset === preset.id }"
        @click="applyPreset(preset)"
      >
        {{ preset.label }}
      </button>
      <button
        class="date-filters__preset date-filters__preset--custom"
        :class="{ 'date-filters__preset--active': showCustomRange }"
        @click="toggleCustomRange"
      >
        Personalizado
        <span class="date-filters__toggle-icon" :class="{ 'date-filters__toggle-icon--expanded': showCustomRange }">
          ▼
        </span>
      </button>
    </div>
    <div v-show="showCustomRange" class="date-filters__custom">
      <div class="date-filters__custom-content">
        <div class="date-filters__group">
          <label class="date-filters__label">Data Inicial</label>
          <input
            v-model="localStartDate"
            type="date"
            class="date-filters__input"
          />
        </div>
        <div class="date-filters__group">
          <label class="date-filters__label">Data Final</label>
          <input
            v-model="localEndDate"
            type="date"
            class="date-filters__input"
          />
        </div>
        <div class="date-filters__actions">
          <BaseButton variant="ghost" @click="clearFilters">
            Limpar
          </BaseButton>
          <BaseButton @click="applyCustomFilters">
            Filtrar
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/design-system/BaseButton.vue'
import type { AnalyticsFilters } from '@/types/analytics'

const props = defineProps<{
  filters?: AnalyticsFilters
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: AnalyticsFilters): void
}>()

const selectedPreset = ref<string | null>(null)
const showCustomRange = ref(false)
const localStartDate = ref('')
const localEndDate = ref('')

interface Preset {
  id: string
  label: string
  getDates: () => { startDate: Date; endDate: Date }
}

const presets: Preset[] = [
  {
    id: 'last7days',
    label: 'Últimos 7 dias',
    getDates: () => {
      const endDate = new Date()
      endDate.setHours(23, 59, 59, 999)
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 6)
      startDate.setHours(0, 0, 0, 0)
      return { startDate, endDate }
    }
  },
  {
    id: 'last30days',
    label: 'Últimos 30 dias',
    getDates: () => {
      const endDate = new Date()
      endDate.setHours(23, 59, 59, 999)
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 29)
      startDate.setHours(0, 0, 0, 0)
      return { startDate, endDate }
    }
  },
  {
    id: 'currentMonth',
    label: 'Mês atual',
    getDates: () => {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { startDate, endDate }
    }
  },
  {
    id: 'lastMonth',
    label: 'Mês anterior',
    getDates: () => {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { startDate, endDate }
    }
  },
  {
    id: 'today',
    label: 'Hoje',
    getDates: () => {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      return { startDate, endDate }
    }
  }
]

const applyPreset = (preset: Preset) => {
  selectedPreset.value = preset.id
  showCustomRange.value = false
  const { startDate, endDate } = preset.getDates()
  
  const filters: AnalyticsFilters = {
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }
  }
  
  emit('update:filters', filters)
}

const toggleCustomRange = () => {
  showCustomRange.value = !showCustomRange.value
  if (showCustomRange.value) {
    selectedPreset.value = null
  }
}

const applyCustomFilters = () => {
  selectedPreset.value = null
  const filters: AnalyticsFilters = {}
  
  if (localStartDate.value || localEndDate.value) {
    filters.dateRange = {}
    if (localStartDate.value) {
      // Converte para início do dia no horário local do usuário
      const [year, month, day] = localStartDate.value.split('-').map(Number)
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0)
      filters.dateRange.startDate = startDate.toISOString()
    }
    if (localEndDate.value) {
      // Converte para fim do dia no horário local do usuário
      const [year, month, day] = localEndDate.value.split('-').map(Number)
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
      filters.dateRange.endDate = endDate.toISOString()
    }
  }
  
  emit('update:filters', filters)
}

const clearFilters = () => {
  selectedPreset.value = null
  localStartDate.value = ''
  localEndDate.value = ''
  showCustomRange.value = false
  emit('update:filters', {})
}

watch(() => props.filters, (newFilters) => {
  if (!newFilters?.dateRange) {
    selectedPreset.value = null
    localStartDate.value = ''
    localEndDate.value = ''
    showCustomRange.value = false
  } else if (newFilters.dateRange.startDate && newFilters.dateRange.endDate) {
    // Verifica se corresponde a algum preset
    const startDate = new Date(newFilters.dateRange.startDate)
    const endDate = new Date(newFilters.dateRange.endDate)
    
    const matchesPreset = presets.find(preset => {
      const presetDates = preset.getDates()
      return presetDates.startDate.getTime() === startDate.getTime() &&
             presetDates.endDate.getTime() === endDate.getTime()
    })
    
    if (matchesPreset) {
      selectedPreset.value = matchesPreset.id
      showCustomRange.value = false
    } else {
      selectedPreset.value = null
      showCustomRange.value = true
      // Converte ISO strings para formato de input date (YYYY-MM-DD)
      localStartDate.value = startDate.toISOString().split('T')[0]
      localEndDate.value = endDate.toISOString().split('T')[0]
    }
  }
}, { deep: true })
</script>

<style scoped>
.date-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
  padding: 0;
}

.date-filters__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.date-filters__preset {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-filters__preset:hover {
  border-color: var(--color-primary);
  background: var(--color-background);
}

.date-filters__preset--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.date-filters__preset--active:hover {
  background: var(--color-primary);
  opacity: 0.9;
}

.date-filters__preset--custom {
  border-style: dashed;
}

.date-filters__toggle-icon {
  font-size: 0.625rem;
  transition: transform 0.3s ease;
  display: inline-block;
}

.date-filters__toggle-icon--expanded {
  transform: rotate(180deg);
}

.date-filters__custom {
  margin-top: 0.5rem;
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.date-filters__custom-content {
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
  background: var(--color-background);
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
  gap: 0.5rem;
}
</style>

