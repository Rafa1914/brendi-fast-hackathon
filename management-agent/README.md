# Management Agent

Agent de análise para o hackathon Brendi que utiliza AI SDK da Vercel com a classe `Agent` para fornecer insights e análises sobre os dados da loja.

## Estrutura

```
src/
├── ai/                    # Camada de AI
│   ├── agents/            # Agents especializados
│   │   ├── DeliveryConsultantAgent.ts    # Agent para chat com tools
│   │   └── InsightsSummarizerAgent.ts     # Agent para insights sem tools
│   ├── tools/             # Tools para o agent usar
│   │   └── analyticsTools.ts
├── client/                 # Clientes para APIs externas
│   └── managementApiClient.ts
├── controller/            # Controllers
│   └── agent.ts
├── router/                # Rotas
│   ├── agent.ts
│   └── index.ts
├── service/               # Lógica de negócio
│   └── agent.ts
├── types/                 # Tipos TypeScript
│   ├── agent.ts
│   └── analytics.ts
├── validator/             # Validadores
│   └── agent.ts
└── index.ts               # Entry point
```

## Instalação

```bash
npm install
```

## Configuração

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Variáveis de ambiente:
- `PORT`: Porta do servidor (padrão: 3001)
- `MANAGEMENT_API_URL`: URL da Management API (padrão: http://localhost:3000)
- `OPENAI_API_KEY`: API Key do OpenAI (necessário)
- `OPENAI_MODEL`: Modelo do OpenAI (padrão: gpt-4o-mini) - usado como fallback
- `OPENAI_MODEL_CHAT`: Modelo do OpenAI para chat (padrão: usa OPENAI_MODEL ou gpt-4o-mini) - modelo robusto com tools
- `OPENAI_MODEL_INSIGHTS`: Modelo do OpenAI para insights (padrão: gpt-4o-mini) - modelo rápido sem tools

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## Rotas

### POST /api/agent/chat
Chat com o agent para análise dos dados.

**Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Qual foi a receita total?"
    }
  ],
  "analytics": { ... } // Opcional
}
```

### POST /api/agent/insights
Gera insights detalhados sobre o período analisado. Usa um modelo mais rápido sem tools para melhor performance.

**Body:**
```json
{
  "filters": {
    "dateRange": {
      "startDate": "2023-12-01T00:00:00.000Z", // Opcional
      "endDate": "2023-12-31T23:59:59.999Z"    // Opcional
    }
  }
}
```

**Nota:** O agent busca os dados de analytics e feedbacks diretamente do `management-api` usando os filtros fornecidos.

## Arquitetura de Agents

O sistema utiliza dois agents completamente separados, cada um com seu próprio propósito, modelo e prompt:

### DeliveryConsultantAgent (Chat com Tools)
- **Arquivo**: `src/ai/agents/DeliveryConsultantAgent.ts`
- **Modelo**: Configurado via `OPENAI_MODEL_CHAT` (padrão: `OPENAI_MODEL` ou `gpt-4o-mini`)
- **Características**: 
  - Usa a classe `Agent` com tools para análises complexas
  - Prompt especializado em consultoria de delivery e e-commerce
  - Pode buscar dados atualizados usando tools quando necessário
- **Uso**: Rota `/api/agent/chat` para conversas interativas
- **Tools disponíveis**: `getAnalytics`, `formatAnalytics`, `getFeedbackAnalytics`
- **Prompt**: Focado em análise estratégica, recomendações práticas e uso inteligente de tools

### InsightsSummarizerAgent (Insights sem Tools)
- **Arquivo**: `src/ai/agents/InsightsSummarizerAgent.ts`
- **Modelo**: Configurado via `OPENAI_MODEL_INSIGHTS` (padrão: `gpt-4o-mini`)
- **Características**: 
  - Usa `generateText` diretamente, sem tools, para resposta mais rápida
  - Prompt otimizado para geração de insights estruturados em JSON
  - Focado em análise concisa e acionável
- **Uso**: Rota `/api/agent/insights` para geração automática de insights
- **Vantagem**: Mais rápido e econômico, ideal para geração automática
- **Prompt**: Especializado em síntese de dados e geração de insights estruturados

## Agent Class

O chat utiliza a classe `Agent` do AI SDK da Vercel, que gerencia automaticamente:

- **Loop de execução**: O agent executa em loop até completar a tarefa
- **Context management**: Mantém o histórico da conversa e decide o que o modelo vê em cada passo
- **Stopping conditions**: Determina quando o loop está completo (máximo de 10 steps por padrão)

### Tools Disponíveis

O agent tem acesso aos seguintes tools:

1. **getAnalytics**: Busca dados de analytics da loja para um período específico
   - Parâmetros: `startDate` (opcional), `endDate` (opcional)
   - Retorna: Dados formatados de analytics

2. **formatAnalytics**: Formata dados de analytics em uma string legível
   - Parâmetros: `analytics` (objeto com dados)
   - Retorna: String formatada com os dados

O agent pode usar esses tools automaticamente quando necessário para buscar ou formatar dados.

## Adicionar novo Agent

Para adicionar um novo agent especializado:

1. Crie um novo arquivo em `src/ai/agents/`
2. Implemente a lógica específica do agent
3. Use o agent diretamente no service

Exemplo:
```typescript
// src/ai/agents/MyCustomAgent.ts
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

class MyCustomAgent {
  private openai: ReturnType<typeof createOpenAI>;
  
  constructor() {
    this.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async doSomething(): Promise<string> {
    // Implementação do agent
  }
}

export default new MyCustomAgent();
```

## Integração com Management API

O agent consome dados da Management API através do `managementApiClient`, que busca os dados agregados e processados. O agent pode usar o tool `getAnalytics` para buscar dados atualizados quando necessário.

## Referências

- [AI SDK Agents Overview](https://ai-sdk.dev/docs/agents/overview)
- [AI SDK Building Agents](https://ai-sdk.dev/docs/agents/building-agents)
- [AI SDK Tools](https://ai-sdk.dev/docs/tools)
