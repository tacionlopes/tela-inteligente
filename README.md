# Desbloqueio Inteligente

Projeto do aplicativo `Desbloqueio Inteligente`, com:

- frontend web estático na raiz
- base Android em `bloqueio-inteligente-android-2`
- endpoint de IA em `api/ai/generate-questions.js`

## Estrutura principal

- [index.html](/Users/taciolopes/.codex/worktrees/4160/New%20project%202/index.html)
- [styles.css](/Users/taciolopes/.codex/worktrees/4160/New%20project%202/styles.css)
- [app.js](/Users/taciolopes/.codex/worktrees/4160/New%20project%202/app.js)
- [ai-api-config.js](/Users/taciolopes/.codex/worktrees/4160/New%20project%202/ai-api-config.js)
- [api/ai/generate-questions.js](/Users/taciolopes/.codex/worktrees/4160/New%20project%202/api/ai/generate-questions.js)
- [vercel.json](/Users/taciolopes/.codex/worktrees/4160/New%20project%202/vercel.json)

## Vercel

O projeto está preparado para deploy na Vercel com:

- build estático em `dist`
- endpoint serverless em `/api/ai/generate-questions`
- `providerMode: "api"` no frontend
- fallback automático para simulação se a API falhar

### Variáveis de ambiente

Use como base:

- [.env.vercel.example](/Users/taciolopes/.codex/worktrees/4160/New%20project%202/.env.vercel.example)

Variáveis esperadas:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (opcional)
- `OPENAI_MAX_OUTPUT_TOKENS` (opcional)

### Fluxo de deploy

1. importar este projeto na Vercel
2. configurar as variáveis de ambiente
3. deixar:
   - `Build Command`: `npm run build`
   - `Output Directory`: `dist`
4. publicar

Depois disso, o frontend passa a tentar:

- `POST /api/ai/generate-questions`

Se a API responder bem:

- o painel mostra `Origem: API`

Se a API falhar:

- o app cai para `Origem: Simulação`

## Desenvolvimento local

Build:

```bash
npm run build
```

Preview:

```bash
node scripts/preview.mjs
```

Preview com API local habilitada:

```bash
OPENAI_API_KEY="SUA_CHAVE" PORT=4183 node scripts/preview.mjs
```

## Android

Abra no Android Studio:

- [bloqueio-inteligente-android-2](/Users/taciolopes/.codex/worktrees/4160/New%20project%202/bloqueio-inteligente-android-2)

Os assets web usados no app Android ficam em:

- [app/src/main/assets](/Users/taciolopes/.codex/worktrees/4160/New%20project%202/bloqueio-inteligente-android-2/app/src/main/assets)
