<template>
  <div class="base-tabs">
    <div class="base-tabs__header">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['base-tabs__tab', { 'base-tabs__tab--active': activeTab === tab.id }]"
        @click="$emit('update:activeTab', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="base-tabs__content">
      <slot :activeTab="activeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs: Array<{ id: string; label: string }>
  activeTab: string
}>()

defineEmits<{
  'update:activeTab': [id: string]
}>()
</script>

<style scoped>
.base-tabs {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.base-tabs__header {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.base-tabs__tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: var(--color-text-light);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s ease;
  position: relative;
}

.base-tabs__tab:hover {
  color: var(--color-text);
  background: var(--color-background);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.base-tabs__tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.base-tabs__content {
  flex: 1;
}
</style>

