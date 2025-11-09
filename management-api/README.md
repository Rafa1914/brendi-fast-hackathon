# Management API

API de gestão desenvolvida com Express e TypeScript para o hackathon Brendi.

## 🚀 Início Rápido

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado na porta 3000 (ou na porta definida na variável de ambiente `PORT`).

### Build

```bash
npm run build
```

### Produção

```bash
npm start
```

## 📁 Estrutura do Projeto

```
management-api/
├── src/
│   └── index.ts          # Arquivo principal da aplicação
├── dist/                 # Código compilado (gerado)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Superset JavaScript com tipagem estática
- **CORS** - Middleware para habilitar CORS
- **dotenv** - Gerenciamento de variáveis de ambiente

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
PORT=3000
```

## 🛣 Rotas

- `GET /` - Informações da API
- `GET /health` - Health check

