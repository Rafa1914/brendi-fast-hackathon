<template>
  <div class="base-card" :class="{ 'base-card--hover': hover }">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hover?: boolean
}>()
</script>

<style scoped>
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.base-card--hover {
  transition: all 0.2s ease;
  cursor: pointer;
}

.base-card--hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
</style>

