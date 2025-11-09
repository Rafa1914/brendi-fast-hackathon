<template>
  <div class="base-skeleton" :class="`base-skeleton--${variant}`" :style="{ width, height, borderRadius }">
    <div class="base-skeleton__shimmer"></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  width?: string
  height?: string
  borderRadius?: string
  variant?: 'text' | 'circular' | 'rectangular'
}>(), {
  width: '100%',
  height: '1rem',
  borderRadius: 'var(--radius-sm)',
  variant: 'rectangular'
})
</script>

<style scoped>
.base-skeleton {
  position: relative;
  overflow: hidden;
  background: var(--color-background);
  border-radius: var(--radius-sm);
}

.base-skeleton--text {
  height: 1rem;
  border-radius: var(--radius-sm);
}

.base-skeleton--circular {
  border-radius: 50%;
  aspect-ratio: 1;
}

.base-skeleton--rectangular {
  border-radius: var(--radius-sm);
}

.base-skeleton__shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

.dark .base-skeleton__shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>

