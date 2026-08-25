-- ============================================================================
-- Seed de demonstração: um concurso genérico com edital, matérias, tópicos
-- e algumas questões de exemplo, para o produto não começar vazio.
-- Seguro rodar mais de uma vez (usa "on conflict do nothing" via checagem).
-- ============================================================================

do $$
declare
  v_concurso_id uuid;
  v_materia_pt uuid;
  v_materia_rlm uuid;
  v_materia_direito uuid;
  v_topico_id uuid;
  v_questao_id uuid;
begin
  if exists (select 1 from public.concursos where nome = 'Concurso Modelo - Analista Administrativo') then
    return;
  end if;

  insert into public.concursos (nome, orgao, banca, ano, nivel, status, descricao)
  values (
    'Concurso Modelo - Analista Administrativo',
    'Órgão Público Federal (exemplo)',
    'Banca Exemplo',
    extract(year from now())::int,
    'superior',
    'edital_publicado',
    'Concurso de demonstração para você conhecer a plataforma. Cadastre seus próprios concursos e editais reais.'
  ) returning id into v_concurso_id;

  insert into public.materias (concurso_id, nome, ordem) values (v_concurso_id, 'Língua Portuguesa', 1) returning id into v_materia_pt;
  insert into public.materias (concurso_id, nome, ordem) values (v_concurso_id, 'Raciocínio Lógico-Matemático', 2) returning id into v_materia_rlm;
  insert into public.materias (concurso_id, nome, ordem) values (v_concurso_id, 'Direito Administrativo', 3) returning id into v_materia_direito;

  insert into public.topicos (materia_id, nome, ordem) values
    (v_materia_pt, 'Interpretação de texto', 1),
    (v_materia_pt, 'Ortografia e acentuação', 2),
    (v_materia_pt, 'Crase', 3),
    (v_materia_pt, 'Concordância verbal e nominal', 4);

  insert into public.topicos (materia_id, nome, ordem) values
    (v_materia_rlm, 'Proposições e conectivos lógicos', 1),
    (v_materia_rlm, 'Porcentagem e razão/proporção', 2),
    (v_materia_rlm, 'Análise combinatória', 3);

  insert into public.topicos (materia_id, nome, ordem) values
    (v_materia_direito, 'Princípios da Administração Pública', 1),
    (v_materia_direito, 'Atos administrativos', 2),
    (v_materia_direito, 'Licitações e contratos', 3);

  -- Questão de exemplo 1 (múltipla escolha)
  select id into v_topico_id from public.topicos where materia_id = v_materia_direito and nome = 'Princípios da Administração Pública';

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (
    v_concurso_id, v_materia_direito, v_topico_id, 'Banca Exemplo', extract(year from now())::int,
    'Segundo a Constituição Federal, são princípios expressos da Administração Pública: legalidade, impessoalidade, moralidade, publicidade e:',
    'multipla_escolha', 'facil',
    'O art. 37, caput, da CF/88 traz os princípios LIMPE: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência.'
  ) returning id into v_questao_id;

  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_questao_id, 'A', 'Eficiência', true, 1),
    (v_questao_id, 'B', 'Economicidade', false, 2),
    (v_questao_id, 'C', 'Razoabilidade', false, 3),
    (v_questao_id, 'D', 'Supremacia do interesse privado', false, 4);

  -- Questão de exemplo 2 (certo/errado)
  select id into v_topico_id from public.topicos where materia_id = v_materia_pt and nome = 'Crase';

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (
    v_concurso_id, v_materia_pt, v_topico_id, 'Banca Exemplo', extract(year from now())::int,
    'Julgue o item: "Entreguei o relatório à ela ontem à tarde." — o uso da crase está correto em ambas as ocorrências.',
    'certo_errado', 'media',
    'Errado: não se usa crase antes de pronome pessoal ("à ela" está incorreto); já "à tarde" está correto, pois é uma locução adverbial feminina.'
  ) returning id into v_questao_id;

  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_questao_id, 'C', 'Certo', false, 1),
    (v_questao_id, 'E', 'Errado', true, 2);

end $$;
