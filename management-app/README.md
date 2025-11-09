# Management App - Dashboard Analítico

Aplicação web Vue.js para dashboard analítico de restaurantes.

## 🚀 Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Vue Router** - Roteamento
- **Pinia** - Gerenciamento de estado
- **Composables** - Lógica reutilizável
- **Design System** - Componentes base reutilizáveis

## 📁 Estrutura do Projeto

```
management-app/
├── src/
│   ├── components/
│   │   ├── design-system/     # Componentes base do design system
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseLoading.vue
│   │   │   └── BaseStatCard.vue
│   │   ├── layout/            # Componentes de layout
│   │   │   └── AppLayout.vue
│   │   └── orders/            # Componentes específicos de pedidos
│   │       └── OrderList.vue
│   ├── composables/           # Composables reutilizáveis
│   │   ├── useApi.ts
│   │   ├── useOrderApi.ts
│   │   └── useStoreApi.ts
│   ├── stores/                # Stores Pinia
│   │   ├── order.ts
│   │   └── store.ts
│   ├── types/                 # Tipos TypeScript
│   │   ├── order.ts
│   │   └── store.ts
│   ├── views/                 # Views/páginas
│   │   ├── DashboardView.vue
│   │   ├── OrdersView.vue
│   │   └── AnalyticsView.vue
│   ├── router/                # Configuração de rotas
│   │   └── index.ts
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🏗️ Arquitetura

### Boas Práticas Implementadas

1. **Dumb Components**: Componentes que apenas recebem props e emitem eventos
2. **Composables**: Lógica reutilizável extraída para composables
3. **Views**: Páginas principais da aplicação
4. **Pinia Stores**: Gerenciamento de estado global
5. **Design System**: Componentes base reutilizáveis e consistentes

### Fluxo de Dados

```
API Backend → Composables (useOrderApi, useStoreApi) → Pinia Stores → Views → Components
```

## 🛠️ Instalação

```bash
npm install
```

## 🚀 Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📦 Build

```bash
npm run build
```

## 🔍 Type Checking

```bash
npm run type-check
```

## 🌐 API Backend

A aplicação está configurada para se comunicar com o backend em `http://localhost:3000/api`.

O proxy está configurado no `vite.config.ts` para redirecionar requisições `/api` para o backend.

## 📊 Funcionalidades

- **Dashboard**: Visão geral com estatísticas principais
- **Pedidos**: Listagem e filtros de pedidos
- **Análises**: Análise de produtos e distribuição por período

## 🎨 Design System

O design system utiliza variáveis CSS para cores, sombras e espaçamentos, garantindo consistência visual em toda a aplicação.

