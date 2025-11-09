<template>
  <div class="app-layout">
    <header class="app-layout__header">
      <div class="app-layout__header-left">
        <h1 class="app-layout__logo">🍽️ Dashboard</h1>
      </div>
      <div class="app-layout__header-actions">
        <ThemeToggle />
        <slot name="header-actions" />
      </div>
    </header>
    <main class="app-layout__main">
      <div class="app-layout__content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '@/components/design-system/ThemeToggle.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-background);
  transition: background-color 0.3s ease;
}

.app-layout__header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  gap: 2rem;
}

.app-layout__header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.app-layout__logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.app-layout__page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  transition: color 0.3s ease;
}

.app-layout__header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.app-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.app-layout__content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
