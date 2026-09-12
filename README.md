# AprovaJá — Treino para concursos públicos

MVP de um SaaS de preparação para concursos: banco de questões com estatísticas,
cronograma de estudos, flashcards com repetição espaçada (SM-2) e assinatura via Stripe.

Stack: **Next.js 16 (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres, Auth) + Stripe**.

## 1. Pré-requisitos

- Node.js 20+
- Uma conta gratuita em [supabase.com](https://supabase.com)
- (Opcional, para cobrança) uma conta em [stripe.com](https://stripe.com)

## 2. Configurar o Supabase

1. Crie um projeto novo em supabase.com.
2. Em **SQL Editor**, rode os arquivos de `supabase/migrations/` **na ordem**:
   - `0001_init.sql` — cria todas as tabelas, índices e políticas de RLS.
   - `0002_seed.sql` — cria um concurso de demonstração com edital, matérias e questões de exemplo.
3. Em **Project Settings > API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (mantenha em segredo — nunca exponha no navegador)
4. Em **Authentication > URL Configuration**, adicione a URL do seu app (ex: `http://localhost:3000` em dev, e a URL da Vercel em produção) em *Site URL* e *Redirect URLs* (`/auth/callback`).
5. Por padrão o Supabase exige confirmação de e-mail no cadastro. Para testar mais rápido em desenvolvimento, você pode desativar isso em **Authentication > Providers > Email > Confirm email**.

## 3. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

| Variável | Onde conseguir |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API (secreta) |
| `NEXT_PUBLIC_SITE_URL` | URL pública do app (`http://localhost:3000` em dev) |
| `STRIPE_SECRET_KEY` | Stripe > Developers > API keys (secreta) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe > Developers > API keys (publicável — usada no client pra montar o cartão com Stripe Elements) |
| `STRIPE_WEBHOOK_SECRET` | Stripe > Developers > Webhooks (ao criar o endpoint) |
| `STRIPE_PRICE_ID_PRO` | Stripe > Product catalog (crie um produto "Pro" com preço recorrente) |
| `STRIPE_PRICE_ID_PREMIUM` | Stripe > Product catalog (crie um produto "Premium") |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) > Settings > API Keys — usada na correção de redação com IA |

O app funciona sem as variáveis do Stripe — a página `/dashboard/planos` mostra um erro
amigável ao tentar assinar, mas todo o resto (questões, cronograma, flashcards) funciona normalmente.
O mesmo vale pra `ANTHROPIC_API_KEY`: sem ela, `/dashboard/redacao` deixa enviar a redação
normalmente, mas a correção fica com status "erro" e um botão "Tentar novamente" — assim que a
chave for configurada, o mesmo texto pode ser corrigido sem reenviar nada.

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## 5. Configurar o webhook do Stripe (para assinaturas funcionarem)

Em desenvolvimento, use a Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Isso imprime um `whsec_...` — coloque em `STRIPE_WEBHOOK_SECRET`.

Em produção, crie o endpoint em **Stripe > Developers > Webhooks** apontando para
`https://SEU_DOMINIO/api/stripe/webhook`, escutando os eventos:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## 6. Deploy (Vercel)

1. Suba este repositório para o GitHub/GitLab.
2. Importe o projeto na [Vercel](https://vercel.com/new).
3. Configure as mesmas variáveis de ambiente do `.env.local` no painel da Vercel.
4. Atualize `NEXT_PUBLIC_SITE_URL` para a URL final (ex: `https://aprovaja.vercel.app`).
5. Atualize as *Redirect URLs* no Supabase e o endpoint de webhook no Stripe para essa URL.

## Estrutura do projeto

```
src/
  app/
    page.tsx                 → Landing page
    (auth)/login, /cadastro  → Autenticação
    onboarding/               → Briefing inicial (qual concurso, meta de horas)
    dashboard/                → Área logada
      questoes/               → Banco de questões (prática)
      estatisticas/           → Desempenho por matéria
      cronograma/             → Cronograma semanal de estudos
      flashcards/             → Baralhos e revisão espaçada (SM-2)
      concursos/              → Catálogo de concursos (seguir/cadastrar)
      planos/                 → Assinatura (Stripe)
    api/stripe/               → Checkout, portal e webhook do Stripe
  components/                 → Componentes de UI (client components)
  lib/
    supabase/                 → Clientes Supabase (browser, server, service role, middleware)
    auth/actions.ts           → Server Actions de login/cadastro/logout
    stripe/client.ts          → Cliente Stripe
    spaced-repetition/sm2.ts  → Algoritmo de repetição espaçada
  types/database.ts           → Tipos do banco (escritos à mão; substitua pelo gerado do Supabase quando quiser)
supabase/migrations/          → Schema SQL + seed de demonstração
```

## Decisões e próximos passos

- **Conteúdo das questões**: o produto não inclui questões reais de provas de bancas
  (CESPE/Cebraspe, FGV, FCC etc.) por serem, em geral, protegidas por direitos autorais
  do órgão organizador. O seed traz apenas questões autorais de exemplo. Para crescer o
  banco de questões com segurança jurídica, escreva questões originais no estilo/dificuldade
  de cada banca, ou avalie parcerias/fontes de domínio público.
- **IA para gerar questões/planos personalizados**: fica como evolução futura (recurso pago),
  já que tem custo de API — não faz parte deste MVP de custo zero.
- **Pagamentos no Brasil**: o Stripe cobre cartão de crédito. Se Pix/boleto forem importantes
  para o seu público, avalie um gateway nacional (Pagar.me, Asaas, Iugu) mais adiante.
- **Tipos do banco**: `src/types/database.ts` foi escrito à mão a partir das migrations.
  Quando o projeto Supabase estiver no ar, gere os tipos oficiais com:
  `npx supabase gen types typescript --project-id <id> > src/types/database.ts`
