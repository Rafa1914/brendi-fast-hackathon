<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="base-modal" @click.self="handleClose">
        <div class="base-modal__overlay"></div>
        <div class="base-modal__container">
          <div class="base-modal__content">
            <div class="base-modal__header">
              <h2 class="base-modal__title">{{ title }}</h2>
              <button class="base-modal__close" @click="handleClose" aria-label="Fechar">
                ✕
              </button>
            </div>
            <div class="base-modal__body">
              <slot />
            </div>
            <div v-if="$slots.footer" class="base-modal__footer">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleClose = () => {
  if (props.closeOnOverlay) {
    emit('update:modelValue', false)
  }
}

// Prevenir scroll do body quando modal estiver aberto
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.base-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.base-modal__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.base-modal__container {
  position: relative;
  z-index: 1001;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
}

.base-modal__content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.base-modal__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.base-modal__close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.2s ease;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.base-modal__close:hover {
  color: var(--color-text);
  background: var(--color-background);
}

.base-modal__body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.base-modal__footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Transições */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .base-modal__container,
.modal-leave-active .base-modal__container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .base-modal__container,
.modal-leave-to .base-modal__container {
  transform: scale(0.95);
  opacity: 0;
}
</style>

