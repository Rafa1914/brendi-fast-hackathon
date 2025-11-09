# Management Agent

Agent de análise para o hackathon Brendi que utiliza AI SDK da Vercel com a classe `Agent` para fornecer insights e análises sobre os dados da loja.

## Estrutura

```
src/
├── ai/                    # Camada de abstração para AI
│   ├── interface/         # Interface IAgentProvider
│   ├── providers/         # Implementações (OpenAI, etc)
│   ├── tools/             # Tools para o agent usar
│   │   └── analyticsTools.ts
│   └── agentProvider.ts   # Factory para instanciar provider
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
- `AI_PROVIDER`: Provider de AI (padrão: openai)
- `OPENAI_MODEL`: Modelo do OpenAI (padrão: gpt-4o-mini)
- `OPENAI_API_KEY`: API Key do OpenAI (necessário)

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
Gera insights detalhados sobre o período analisado.

**Body:**
```json
{
  "analytics": { ... },
  "period": "01/12/2023 até 31/12/2023" // Opcional
}
```

## Agent Class

O agent utiliza a classe `Agent` do AI SDK da Vercel, que gerencia automaticamente:

- **Loop de execução**: O agent executa em loop até completar a tarefa
- **Context management**: Mantém o histórico da conversa e decide o que o modelo vê em cada passo
- **Stopping conditions**: Determina quando o loop está completo (máximo de 20 steps por padrão)

### Tools Disponíveis

O agent tem acesso aos seguintes tools:

1. **getAnalytics**: Busca dados de analytics da loja para um período específico
   - Parâmetros: `startDate` (opcional), `endDate` (opcional)
   - Retorna: Dados formatados de analytics

2. **formatAnalytics**: Formata dados de analytics em uma string legível
   - Parâmetros: `analytics` (objeto com dados)
   - Retorna: String formatada com os dados

O agent pode usar esses tools automaticamente quando necessário para buscar ou formatar dados.

## Camada de Abstração de AI

O agent utiliza uma camada de abstração que permite trocar o provider de AI sem alterar a lógica de negócio.

### Adicionar novo provider

1. Crie uma nova implementação em `src/ai/providers/`
2. Implemente a interface `IAgentProvider`
3. Adicione o caso no factory `agentProvider.ts`

Exemplo:
```typescript
// src/ai/providers/anthropicAgentProvider.ts
import { Experimental_Agent as Agent } from 'ai';
import { IAgentProvider } from '../interface/IAgentProvider';

class AnthropicAgentProvider implements IAgentProvider {
  async generate(options: AgentGenerateOptions): Promise<AgentGenerateResponse> {
    // Implementação usando Anthropic
  }
}
```

## Integração com Management API

O agent consome dados da Management API através do `managementApiClient`, que busca os dados agregados e processados. O agent pode usar o tool `getAnalytics` para buscar dados atualizados quando necessário.

## Referências

- [AI SDK Agents Overview](https://ai-sdk.dev/docs/agents/overview)
- [AI SDK Building Agents](https://ai-sdk.dev/docs/agents/building-agents)
- [AI SDK Tools](https://ai-sdk.dev/docs/tools)
