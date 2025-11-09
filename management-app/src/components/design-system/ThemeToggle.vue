<template>
  <button
    class="theme-toggle"
    :class="`theme-toggle--${theme}`"
    @click="toggleTheme"
    :aria-label="`Alternar para tema ${theme === 'dark' ? 'escuro' : 'claro'}`"
  >
    <span class="theme-toggle__icon">{{ theme === 'dark' ? '🌙' : '☀️' }}</span>
    <span class="theme-toggle__label">{{ theme === 'dark' ? 'Escuro' : 'Claro' }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const theme = computed(() => themeStore.theme)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.theme-toggle:hover {
  background: var(--color-background);
  border-color: var(--color-primary);
}

.theme-toggle__icon {
  font-size: 1.125rem;
}

.theme-toggle__label {
  font-size: 0.875rem;
}
</style>

