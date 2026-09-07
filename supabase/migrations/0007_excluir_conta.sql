-- ============================================================================
-- Permite excluir a conta de quem cadastrou um concurso ou questão própria.
--
-- concursos.created_by e questoes.created_by referenciam profiles(id) sem
-- "on delete cascade/set null" (comportamento padrão é RESTRICT) — hoje, se
-- alguém que cadastrou um concurso tentar excluir a conta, o banco recusa o
-- delete com violação de FK. Como esse conteúdo é de catálogo compartilhado
-- (visível a todos), a exclusão correta é "órfão" (set null), não cascata:
-- o concurso/questão continua existindo para quem o segue.
-- ============================================================================

alter table public.concursos
  drop constraint if exists concursos_created_by_fkey,
  add constraint concursos_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete set null;

alter table public.questoes
  drop constraint if exists questoes_created_by_fkey,
  add constraint questoes_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete set null;
