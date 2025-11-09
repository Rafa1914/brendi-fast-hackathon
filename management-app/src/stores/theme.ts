import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  // Inicializar tema do localStorage ou padrão
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme
      return saved || 'light'
    }
    return 'light'
  }

  const theme = ref<Theme>(getInitialTheme())

  const applyTheme = (themeValue: Theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (themeValue === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Aplicar tema inicial imediatamente
  applyTheme(theme.value)

  // Observar mudanças no tema
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    setTheme,
    toggleTheme
  }
})
