-- ============================================================================
-- Concurso Prep — schema inicial
-- Plataforma SaaS de preparação para concursos públicos (multiusuário)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- PERFIS DE USUÁRIO (espelha auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- CONCURSOS (catálogo global — conteúdo compartilhado entre todos os usuários)
-- ----------------------------------------------------------------------------
create table if not exists public.concursos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,               -- ex: "Receita Federal - Auditor Fiscal"
  orgao text,                       -- ex: "Receita Federal"
  banca text,                       -- ex: "FGV", "CESPE/CEBRASPE"
  ano int,
  nivel text check (nivel in ('fundamental', 'medio', 'superior')),
  status text not null default 'previsto' check (status in ('previsto', 'edital_publicado', 'inscricoes_abertas', 'encerrado')),
  descricao text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Matérias do edital verticalizado de um concurso
create table if not exists public.materias (
  id uuid primary key default gen_random_uuid(),
  concurso_id uuid not null references public.concursos (id) on delete cascade,
  nome text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Tópicos dentro de cada matéria (nível do edital verticalizado)
create table if not exists public.topicos (
  id uuid primary key default gen_random_uuid(),
  materia_id uuid not null references public.materias (id) on delete cascade,
  nome text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Progresso do usuário sobre cada tópico do edital (checklist)
create table if not exists public.progresso_edital (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  topico_id uuid not null references public.topicos (id) on delete cascade,
  status text not null default 'nao_iniciado' check (status in ('nao_iniciado', 'estudando', 'revisando', 'concluido')),
  updated_at timestamptz not null default now(),
  unique (user_id, topico_id)
);

-- ----------------------------------------------------------------------------
-- BANCO DE QUESTÕES
-- ----------------------------------------------------------------------------
create table if not exists public.questoes (
  id uuid primary key default gen_random_uuid(),
  concurso_id uuid references public.concursos (id) on delete set null,
  materia_id uuid references public.materias (id) on delete set null,
  topico_id uuid references public.topicos (id) on delete set null,
  banca text,
  ano int,
  enunciado text not null,
  tipo text not null default 'multipla_escolha' check (tipo in ('multipla_escolha', 'certo_errado')),
  dificuldade text not null default 'media' check (dificuldade in ('facil', 'media', 'dificil')),
  explicacao text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.alternativas (
  id uuid primary key default gen_random_uuid(),
  questao_id uuid not null references public.questoes (id) on delete cascade,
  letra text not null,          -- 'A', 'B', 'C'... ou 'C'/'E' para certo/errado
  texto text not null,
  correta boolean not null default false,
  ordem int not null default 0
);

-- Tentativas de resposta do usuário (para estatísticas de desempenho)
create table if not exists public.tentativas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  questao_id uuid not null references public.questoes (id) on delete cascade,
  alternativa_id uuid references public.alternativas (id) on delete set null,
  correta boolean not null,
  tempo_resposta_segundos int,
  created_at timestamptz not null default now()
);

create index if not exists idx_tentativas_user on public.tentativas (user_id, created_at desc);
create index if not exists idx_questoes_filtros on public.questoes (concurso_id, materia_id, topico_id);

-- ----------------------------------------------------------------------------
-- CRONOGRAMA DE ESTUDOS
-- ----------------------------------------------------------------------------
create table if not exists public.metas_concurso (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  concurso_id uuid not null references public.concursos (id) on delete cascade,
  data_prova date,
  horas_semanais_meta numeric(5,2) default 10,
  created_at timestamptz not null default now(),
  unique (user_id, concurso_id)
);

create table if not exists public.cronograma_itens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  concurso_id uuid references public.concursos (id) on delete set null,
  materia_id uuid references public.materias (id) on delete set null,
  topico_id uuid references public.topicos (id) on delete set null,
  titulo text not null,
  dia_semana int check (dia_semana between 0 and 6), -- 0=domingo ... 6=sábado
  data date,
  duracao_minutos int not null default 60,
  concluido boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_cronograma_user on public.cronograma_itens (user_id, data);

-- ----------------------------------------------------------------------------
-- FLASHCARDS (repetição espaçada — SM-2 simplificado)
-- ----------------------------------------------------------------------------
create table if not exists public.baralhos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  concurso_id uuid references public.concursos (id) on delete set null,
  nome text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  baralho_id uuid not null references public.baralhos (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  frente text not null,
  verso text not null,
  -- campos do algoritmo SM-2
  intervalo_dias numeric(6,2) not null default 0,
  fator_facilidade numeric(4,2) not null default 2.5,
  repeticoes int not null default 0,
  proxima_revisao date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists idx_flashcards_revisao on public.flashcards (user_id, proxima_revisao);

create table if not exists public.flashcard_revisoes (
  id uuid primary key default gen_random_uuid(),
  flashcard_id uuid not null references public.flashcards (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  qualidade int not null check (qualidade between 0 and 5),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ASSINATURAS / BILLING (esqueleto Stripe)
-- ----------------------------------------------------------------------------
create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plano text not null default 'free' check (plano in ('free', 'pro', 'premium')),
  status text not null default 'inactive' check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled')),
  periodo_atual_fim timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.concursos enable row level security;
alter table public.materias enable row level security;
alter table public.topicos enable row level security;
alter table public.progresso_edital enable row level security;
alter table public.questoes enable row level security;
alter table public.alternativas enable row level security;
alter table public.tentativas enable row level security;
alter table public.metas_concurso enable row level security;
alter table public.cronograma_itens enable row level security;
alter table public.baralhos enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_revisoes enable row level security;
alter table public.assinaturas enable row level security;

-- Perfis: cada usuário vê/edita apenas o próprio
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Conteúdo de catálogo (concursos/matérias/tópicos/questões/alternativas):
-- leitura pública para qualquer usuário autenticado; escrita restrita ao criador
create policy "concursos_select_all" on public.concursos for select using (auth.role() = 'authenticated');
create policy "concursos_insert_own" on public.concursos for insert with check (auth.uid() = created_by);
create policy "concursos_update_own" on public.concursos for update using (auth.uid() = created_by);

create policy "materias_select_all" on public.materias for select using (auth.role() = 'authenticated');
create policy "materias_write_auth" on public.materias for insert with check (auth.role() = 'authenticated');
create policy "materias_update_auth" on public.materias for update using (auth.role() = 'authenticated');

create policy "topicos_select_all" on public.topicos for select using (auth.role() = 'authenticated');
create policy "topicos_write_auth" on public.topicos for insert with check (auth.role() = 'authenticated');
create policy "topicos_update_auth" on public.topicos for update using (auth.role() = 'authenticated');

create policy "questoes_select_all" on public.questoes for select using (auth.role() = 'authenticated');
create policy "questoes_insert_own" on public.questoes for insert with check (auth.uid() = created_by);
create policy "questoes_update_own" on public.questoes for update using (auth.uid() = created_by);

create policy "alternativas_select_all" on public.alternativas for select using (auth.role() = 'authenticated');
create policy "alternativas_write_auth" on public.alternativas for insert with check (auth.role() = 'authenticated');

-- Dados por usuário: cada um só vê e mexe no seu próprio
create policy "progresso_edital_own" on public.progresso_edital for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tentativas_own" on public.tentativas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "metas_concurso_own" on public.metas_concurso for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cronograma_itens_own" on public.cronograma_itens for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "baralhos_own" on public.baralhos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "flashcards_own" on public.flashcards for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "flashcard_revisoes_own" on public.flashcard_revisoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "assinaturas_own_select" on public.assinaturas for select using (auth.uid() = user_id);
-- Escrita em assinaturas é feita pelo backend (service role) via webhook do Stripe.
