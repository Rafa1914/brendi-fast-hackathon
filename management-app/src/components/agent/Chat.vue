<template>
  <BaseCard>
    <div class="chat">
      <div class="chat__header">
        <h3 class="chat__title">Assistente de Análise</h3>
        <BaseButton
          v-if="messages.length > 0"
          variant="ghost"
          size="sm"
          @click="clearChat"
        >
          Limpar
        </BaseButton>
      </div>

      <div class="chat__messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['chat__message', `chat__message--${message.role}`]"
        >
          <div class="chat__message-content">
            <div class="chat__message-text">{{ message.content }}</div>
          </div>
        </div>
        <div v-if="loading" class="chat__message chat__message--assistant">
          <div class="chat__message-content">
            <div class="chat__message-text chat__message-text--loading">
              Pensando...
            </div>
          </div>
        </div>
      </div>

      <div class="chat__input">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Digite sua pergunta..."
          class="chat__input-field"
          :disabled="loading"
          @keyup.enter="sendMessage"
        />
        <BaseButton
          :disabled="!inputMessage.trim() || loading"
          @click="sendMessage"
        >
          Enviar
        </BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import BaseCard from '@/components/design-system/BaseCard.vue'
import BaseButton from '@/components/design-system/BaseButton.vue'
import { useAgentApi } from '@/composables/useAgentApi'
import { useAnalyticsStore } from '@/stores/analytics'
import type { ChatMessage } from '@/types/agent'

const analyticsStore = useAnalyticsStore()
const { chat: chatApi } = useAgentApi()

const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage: ChatMessage = {
    role: 'user',
    content: inputMessage.value.trim(),
  }

  messages.value.push(userMessage)
  const currentInput = inputMessage.value
  inputMessage.value = ''
  loading.value = true

  try {
    const allMessages: ChatMessage[] = [...messages.value]
    const { execute, data } = chatApi(allMessages, analyticsStore.analytics || undefined)
    await execute()

    if (data.value) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.value.message,
      }
      messages.value.push(assistantMessage)
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    const errorMessage: ChatMessage = {
      role: 'assistant',
      content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
    }
    messages.value.push(errorMessage)
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
  inputMessage.value = ''
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })
</script>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-height: 80vh;
}

.chat__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.chat__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat__message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.chat__message--user {
  justify-content: flex-end;
}

.chat__message--assistant {
  justify-content: flex-start;
}

.chat__message-content {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.chat__message--user .chat__message-content {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.chat__message-text {
  color: var(--color-text);
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.chat__message--user .chat__message-text {
  color: white;
}

.chat__message-text--loading {
  opacity: 0.7;
  font-style: italic;
}

.chat__input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.chat__input-field {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--color-text);
  background: var(--color-background);
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.chat__input-field:focus {
  outline: none;
  border-color: var(--color-primary);
}

.chat__input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

