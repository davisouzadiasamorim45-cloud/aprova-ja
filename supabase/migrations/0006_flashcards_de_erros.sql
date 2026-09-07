-- ============================================================================
-- Gera flashcards a partir das questões que o usuário errou.
--
-- Não usa IA: o cartão é montado com o conteúdo que já está no banco de
-- questões (enunciado + alternativas na frente, alternativa correta e
-- explicação no verso).
-- ============================================================================

-- Liga o cartão à questão de origem, para não gerar o mesmo cartão duas vezes.
alter table public.flashcards
  add column if not exists questao_id uuid references public.questoes (id) on delete set null;

create unique index if not exists idx_flashcards_questao_unica
  on public.flashcards (user_id, questao_id)
  where questao_id is not null;

-- ----------------------------------------------------------------------------
-- Cria (ou reaproveita) o baralho "Questões que errei" e insere um cartão para
-- cada questão cuja ÚLTIMA tentativa foi errada e que ainda não virou cartão.
-- Retorna quantos cartões foram criados.
--
-- security invoker: roda com as permissões de quem chamou, então o RLS já
-- garante que a pessoa só lê as próprias tentativas e só escreve nos próprios
-- baralhos/cartões.
-- ----------------------------------------------------------------------------
create or replace function public.gerar_flashcards_de_erros()
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_baralho uuid;
  v_inseridos integer;
begin
  if v_user is null then
    raise exception 'usuário não autenticado';
  end if;

  select id into v_baralho
    from public.baralhos
   where user_id = v_user and nome = 'Questões que errei'
   limit 1;

  if v_baralho is null then
    insert into public.baralhos (user_id, nome)
    values (v_user, 'Questões que errei')
    returning id into v_baralho;
  end if;

  with ultima_tentativa as (
    select distinct on (t.questao_id) t.questao_id, t.correta
      from public.tentativas t
     where t.user_id = v_user
     order by t.questao_id, t.created_at desc
  ),
  erradas as (
    select q.id, q.enunciado, q.explicacao
      from ultima_tentativa u
      join public.questoes q on q.id = u.questao_id
     where u.correta = false
       and not exists (
         select 1 from public.flashcards f
          where f.user_id = v_user and f.questao_id = q.id
       )
  ),
  novos as (
    insert into public.flashcards (baralho_id, user_id, questao_id, frente, verso)
    select
      v_baralho,
      v_user,
      e.id,
      e.enunciado || coalesce(
        E'\n\n' || (
          select string_agg(a.letra || ') ' || a.texto, E'\n' order by a.ordem, a.letra)
            from public.alternativas a
           where a.questao_id = e.id
        ),
        ''
      ),
      'Resposta: ' || coalesce(
        (
          select a.letra || ') ' || a.texto
            from public.alternativas a
           where a.questao_id = e.id and a.correta
           limit 1
        ),
        '—'
      ) || coalesce(E'\n\n' || e.explicacao, '')
    from erradas e
    returning 1
  )
  select count(*) into v_inseridos from novos;

  return coalesce(v_inseridos, 0);
end;
$$;

grant execute on function public.gerar_flashcards_de_erros() to authenticated;
