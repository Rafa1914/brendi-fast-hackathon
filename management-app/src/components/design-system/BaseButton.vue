<template>
  <button
    :class="['base-button', `base-button--${variant}`, { 'base-button--loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="base-button__spinner"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 2.5rem;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button--primary {
  background: var(--color-primary);
  color: white;
}

.base-button--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.base-button--secondary {
  background: var(--color-secondary);
  color: white;
}

.base-button--secondary:hover:not(:disabled) {
  opacity: 0.9;
}

.base-button--danger {
  background: var(--color-danger);
  color: white;
}

.base-button--danger:hover:not(:disabled) {
  opacity: 0.9;
}

.base-button--ghost {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.base-button--ghost:hover:not(:disabled) {
  background: var(--color-background);
}

.base-button__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

