import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar tema após criar o Pinia
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()
// O tema já é aplicado automaticamente no store

app.mount('#app')
