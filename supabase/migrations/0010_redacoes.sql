-- ============================================================================
-- Correção de redação com IA. A pessoa envia tema + texto; a correção (nota
-- por competência, pontos fortes/a melhorar) é gerada pela Claude e guardada
-- aqui — dado 100% do usuário, sem catálogo compartilhado envolvido.
-- ============================================================================

create table if not exists public.redacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  concurso_id uuid references public.concursos (id) on delete set null,
  tema text not null,
  texto text not null,
  status text not null default 'pendente' check (status in ('pendente', 'corrigida', 'erro')),
  nota_final numeric(3,1) check (nota_final is null or (nota_final >= 0 and nota_final <= 10)),
  -- [{ nome, nota, comentario }, ...] — ver src/lib/redacao/schema.ts
  competencias jsonb,
  pontos_fortes text[],
  pontos_a_melhorar text[],
  comentario_geral text,
  erro text,
  created_at timestamptz not null default now(),
  corrigida_at timestamptz
);

create index if not exists idx_redacoes_user on public.redacoes (user_id, created_at desc);

alter table public.redacoes enable row level security;

create policy "redacoes_own" on public.redacoes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
