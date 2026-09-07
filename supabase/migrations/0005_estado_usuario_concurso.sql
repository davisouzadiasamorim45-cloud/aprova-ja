-- ============================================================================
-- Adiciona "estado" (UF) ao perfil do usuário e ao concurso, para permitir
-- filtrar concursos nacionais + estaduais do estado da pessoa. Concurso sem
-- estado (estado is null) é considerado nacional.
-- ============================================================================

alter table public.profiles
  add column if not exists estado char(2)
    check (estado is null or estado in (
      'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
      'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
    ));

alter table public.concursos
  add column if not exists estado char(2)
    check (estado is null or estado in (
      'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
      'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
    ));

create index if not exists idx_concursos_estado on public.concursos (estado);

-- O gatilho de criação de perfil passa a gravar também o estado, quando
-- enviado no cadastro (user_metadata.estado).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, estado)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'estado');
  return new;
end;
$$;

-- Marca o estado dos concursos estaduais já cadastrados (levantamento de 06/09/2026).
update public.concursos set estado = 'BA' where nome = 'PC BA - Investigador, Escrivão e Delegado';
update public.concursos set estado = 'PI' where nome = 'PM PI - Soldado';
update public.concursos set estado = 'MA' where nome in ('TCE-MA - Técnico de Controle Externo', 'PM MA - Soldado');
update public.concursos set estado = 'GO' where nome = 'TCE-GO - Técnico de Controle Externo';
update public.concursos set estado = 'MG' where nome = 'Sefaz MG - Gestor Fazendário';
update public.concursos set estado = 'TO' where nome = 'PC TO - Diversos Cargos';
