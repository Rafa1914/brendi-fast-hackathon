<template>
  <div class="app-layout">
    <aside class="app-layout__sidebar">
      <div class="app-layout__logo">
        <h1>🍽️ Dashboard</h1>
      </div>
      <nav class="app-layout__nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="app-layout__nav-link"
          active-class="app-layout__nav-link--active"
        >
          <span class="app-layout__nav-icon">{{ link.icon }}</span>
          <span>{{ link.label }}</span>
        </RouterLink>
      </nav>
    </aside>
    <main class="app-layout__main">
      <header class="app-layout__header">
        <h2 class="app-layout__page-title">{{ pageTitle }}</h2>
        <div class="app-layout__header-actions">
          <slot name="header-actions" />
        </div>
      </header>
      <div class="app-layout__content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'

const route = useRoute()

const navLinks = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/orders', label: 'Pedidos', icon: '🛒' },
  { path: '/analytics', label: 'Análises', icon: '📈' }
]

const pageTitle = computed(() => {
  const currentLink = navLinks.find(link => link.path === route.path)
  return currentLink?.label || 'Dashboard'
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

.app-layout__sidebar {
  width: 16rem;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.app-layout__logo {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.app-layout__logo h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.app-layout__nav {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.app-layout__nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  color: var(--color-text-light);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.app-layout__nav-link:hover {
  background: var(--color-background);
  color: var(--color-text);
}

.app-layout__nav-link--active {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.app-layout__nav-icon {
  font-size: 1.25rem;
}

.app-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.app-layout__header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-layout__page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.app-layout__header-actions {
  display: flex;
  gap: 0.75rem;
}

.app-layout__content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>

