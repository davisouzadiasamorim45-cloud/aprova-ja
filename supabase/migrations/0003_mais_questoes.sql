-- ============================================================================
-- Amplia o banco de questões do concurso de demonstração (só tinha 2 questões,
-- o que esgotava rápido demais numa sessão de prática). Adiciona ~28 questões
-- novas cobrindo todos os tópicos já cadastrados, com dificuldade variada.
-- Seguro rodar mais de uma vez (verifica se já foi aplicado).
-- ============================================================================

do $$
declare
  -- Busca os IDs por nome (como o 0002_seed.sql já faz) em vez de UUIDs fixos:
  -- UUIDs fixos só funcionam no banco onde foram copiados: num banco novo
  -- (supabase db reset, CI, clone de outro dev) o 0002_seed.sql gera UUIDs
  -- novos via gen_random_uuid(), e valores hardcoded quebrariam as FKs abaixo.
  v_concurso_id uuid;
  v_materia_pt uuid;
  v_materia_rlm uuid;
  v_materia_direito uuid;

  v_top_interpretacao uuid;
  v_top_ortografia uuid;
  v_top_crase uuid;
  v_top_concordancia uuid;

  v_top_proposicoes uuid;
  v_top_porcentagem uuid;
  v_top_combinatoria uuid;

  v_top_principios uuid;
  v_top_atos uuid;
  v_top_licitacoes uuid;

  v_q uuid;
begin
  select id into v_concurso_id from public.concursos where nome = 'Concurso Modelo - Analista Administrativo';

  -- Se o concurso de demonstração não existir (ex: 0002_seed.sql ainda não rodou
  -- ou foi alterado), não há onde pendurar essas questões — encerra sem erro.
  if v_concurso_id is null then
    return;
  end if;

  -- Idempotência: se já tem 30+ questões neste concurso, o lote já foi aplicado.
  if (select count(*) from public.questoes where concurso_id = v_concurso_id) >= 30 then
    return;
  end if;

  select id into v_materia_pt from public.materias where concurso_id = v_concurso_id and nome = 'Língua Portuguesa';
  select id into v_materia_rlm from public.materias where concurso_id = v_concurso_id and nome = 'Raciocínio Lógico-Matemático';
  select id into v_materia_direito from public.materias where concurso_id = v_concurso_id and nome = 'Direito Administrativo';

  select id into v_top_interpretacao from public.topicos where materia_id = v_materia_pt and nome = 'Interpretação de texto';
  select id into v_top_ortografia from public.topicos where materia_id = v_materia_pt and nome = 'Ortografia e acentuação';
  select id into v_top_crase from public.topicos where materia_id = v_materia_pt and nome = 'Crase';
  select id into v_top_concordancia from public.topicos where materia_id = v_materia_pt and nome = 'Concordância verbal e nominal';

  select id into v_top_proposicoes from public.topicos where materia_id = v_materia_rlm and nome = 'Proposições e conectivos lógicos';
  select id into v_top_porcentagem from public.topicos where materia_id = v_materia_rlm and nome = 'Porcentagem e razão/proporção';
  select id into v_top_combinatoria from public.topicos where materia_id = v_materia_rlm and nome = 'Análise combinatória';

  select id into v_top_principios from public.topicos where materia_id = v_materia_direito and nome = 'Princípios da Administração Pública';
  select id into v_top_atos from public.topicos where materia_id = v_materia_direito and nome = 'Atos administrativos';
  select id into v_top_licitacoes from public.topicos where materia_id = v_materia_direito and nome = 'Licitações e contratos';

  -- ------------------------------------------------------------------------
  -- LÍNGUA PORTUGUESA — Interpretação de texto
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_interpretacao, 'Banca Exemplo', 2026,
    'Embora tenha estudado bastante, o candidato não obteve o resultado esperado na prova. A conjunção "embora" expressa ideia de:',
    'multipla_escolha', 'facil',
    '"Embora" introduz oração subordinada adverbial concessiva, indicando um fato que poderia impedir a ação principal, mas não impede.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Causa', false, 1), (v_q, 'B', 'Concessão', true, 2),
    (v_q, 'C', 'Consequência', false, 3), (v_q, 'D', 'Condição', false, 4);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_interpretacao, 'Banca Exemplo', 2026,
    'Julgue o item: na frase "Se estudar, será aprovado", a oração "Se estudar" expressa uma condição necessária para a realização do fato expresso na oração principal.',
    'certo_errado', 'media',
    'Certo. "Se" introduz oração subordinada adverbial condicional, exprimindo a condição para que o fato principal ocorra.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', true, 1), (v_q, 'E', 'Errado', false, 2);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_interpretacao, 'Banca Exemplo', 2026,
    'O trecho "Não é que o funcionário não quisesse trabalhar; faltava-lhe, isso sim, motivação" permite inferir que o problema do funcionário era:',
    'multipla_escolha', 'dificil',
    'A oração corrige a suposição de falta de vontade, apontando a falta de motivação como a causa real do problema.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Falta de vontade', false, 1), (v_q, 'B', 'Falta de motivação', true, 2),
    (v_q, 'C', 'Excesso de tarefas', false, 3), (v_q, 'D', 'Falta de capacitação', false, 4);

  -- ------------------------------------------------------------------------
  -- LÍNGUA PORTUGUESA — Ortografia e acentuação
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_ortografia, 'Banca Exemplo', 2026,
    'Assinale a alternativa em que todas as palavras estão grafadas corretamente:',
    'multipla_escolha', 'facil',
    'A grafia correta é "exceção" (com "x") e "privilégio" (sem "e" extra após o "v").'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Ecceção, previlégio', false, 1), (v_q, 'B', 'Exceção, privilégio', true, 2),
    (v_q, 'C', 'Exceção, previlégio', false, 3), (v_q, 'D', 'Ecceção, privilégio', false, 4);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_ortografia, 'Banca Exemplo', 2026,
    'Julgue o item: a palavra "tapiocaria" é acentuada graficamente por ser uma paroxítona terminada em ditongo crescente.',
    'certo_errado', 'media',
    'Errado. "Tapiocaria" é paroxítona terminada em "a" e segue a regra geral (sem acento); não há ditongo na sílaba tônica.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', false, 1), (v_q, 'E', 'Errado', true, 2);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_ortografia, 'Banca Exemplo', 2026,
    'Qual das palavras abaixo é acentuada por ser proparoxítona?',
    'multipla_escolha', 'facil',
    '"Lâmpada" (LÂM-pa-da) tem a sílaba tônica na antepenúltima posição — toda proparoxítona é sempre acentuada.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Também', false, 1), (v_q, 'B', 'Álbum', false, 2),
    (v_q, 'C', 'Água', false, 3), (v_q, 'D', 'Lâmpada', true, 4);

  -- ------------------------------------------------------------------------
  -- LÍNGUA PORTUGUESA — Crase
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_crase, 'Banca Exemplo', 2026,
    'Assinale a alternativa em que o uso do acento indicativo de crase está correto:',
    'multipla_escolha', 'media',
    'Usa-se crase antes de palavra feminina determinada ("à escola") e em locuções adverbiais femininas ("às 8 horas"); não se usa antes de pronomes pessoais/de tratamento como "ela", "você" e "mim".'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Entreguei o documento à ela.', false, 1), (v_q, 'B', 'Cheguei à escola às 8 horas.', true, 2),
    (v_q, 'C', 'Refiro-me à você.', false, 3), (v_q, 'D', 'Dirigiu-se à mim.', false, 4);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_crase, 'Banca Exemplo', 2026,
    'Julgue o item: na frase "Estou disposto à contribuir com o projeto", o uso da crase está correto, pois "contribuir" é precedido da preposição "a" exigida por "disposto".',
    'certo_errado', 'dificil',
    'Errado. Não se usa crase antes de verbo no infinitivo; o correto seria apenas "a contribuir", sem o acento grave.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', false, 1), (v_q, 'E', 'Errado', true, 2);

  -- ------------------------------------------------------------------------
  -- LÍNGUA PORTUGUESA — Concordância verbal e nominal
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_concordancia, 'Banca Exemplo', 2026,
    'Assinale a alternativa com concordância verbal correta:',
    'multipla_escolha', 'facil',
    'O verbo "fazer" indicando tempo decorrido é impessoal e fica sempre na 3ª pessoa do singular: "faz dois anos".'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Fazem dois anos que ele trabalha aqui.', false, 1), (v_q, 'B', 'Faz dois anos que ele trabalha aqui.', true, 2),
    (v_q, 'C', 'Fazem dois anos, pois, que ele trabalha aqui.', false, 3), (v_q, 'D', 'Havia muitos anos que ele trabalha aqui, fazem.', false, 4);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_concordancia, 'Banca Exemplo', 2026,
    'Julgue o item: na frase "Aluga-se casas na praia", a concordância verbal está correta.',
    'certo_errado', 'media',
    'Errado. Com verbo transitivo direto + partícula apassivadora "se" (voz passiva sintética), o verbo concorda com o sujeito: "Alugam-se casas".'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', false, 1), (v_q, 'E', 'Errado', true, 2);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_pt, v_top_concordancia, 'Banca Exemplo', 2026,
    'Assinale a alternativa com concordância nominal correta:',
    'multipla_escolha', 'dificil',
    '"Anexo" funciona como adjetivo e concorda em gênero/número com "cópias" (feminino plural) → "anexas"; o verbo concorda com o sujeito posposto "as cópias" → "seguem".'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Seguem anexas as cópias solicitadas.', true, 1), (v_q, 'B', 'Segue anexo as cópias solicitadas.', false, 2),
    (v_q, 'C', 'Seguem anexo as cópias solicitadas.', false, 3), (v_q, 'D', 'Segue anexos as cópias solicitadas.', false, 4);

  -- ------------------------------------------------------------------------
  -- RACIOCÍNIO LÓGICO-MATEMÁTICO — Proposições e conectivos lógicos
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_rlm, v_top_proposicoes, 'Banca Exemplo', 2026,
    'A negação da proposição "Todos os servidores são pontuais" é:',
    'multipla_escolha', 'facil',
    'A negação de "Todos são X" é "Existe pelo menos um que não é X".'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Nenhum servidor é pontual.', false, 1), (v_q, 'B', 'Todos os servidores são impontuais.', false, 2),
    (v_q, 'C', 'Pelo menos um servidor não é pontual.', true, 3), (v_q, 'D', 'Nenhum servidor é impontual.', false, 4);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_rlm, v_top_proposicoes, 'Banca Exemplo', 2026,
    'Julgue o item: a proposição "Se chove, então a rua fica molhada" é logicamente equivalente a "Se a rua não está molhada, então não choveu".',
    'certo_errado', 'media',
    'Certo. Trata-se da contrapositiva da condicional original, que é sempre logicamente equivalente a ela.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', true, 1), (v_q, 'E', 'Errado', false, 2);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_rlm, v_top_proposicoes, 'Banca Exemplo', 2026,
    'Considere P: "Marcos estuda" e Q: "Marcos passa no concurso". A proposição composta "P e não Q" é falsa em todos os casos, EXCETO quando:',
    'multipla_escolha', 'dificil',
    'A conjunção "P ∧ ¬Q" só é verdadeira quando P é verdadeira e Q é falsa; em todos os demais casos ela é falsa.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'P é verdadeira e Q é falsa', true, 1), (v_q, 'B', 'P é falsa e Q é verdadeira', false, 2),
    (v_q, 'C', 'P é verdadeira e Q é verdadeira', false, 3), (v_q, 'D', 'P é falsa e Q é falsa', false, 4);

  -- ------------------------------------------------------------------------
  -- RACIOCÍNIO LÓGICO-MATEMÁTICO — Porcentagem e razão/proporção
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_rlm, v_top_porcentagem, 'Banca Exemplo', 2026,
    'Um produto custava R$ 200,00 e teve um aumento de 15%. Qual o novo preço?',
    'multipla_escolha', 'facil',
    'Aumento de 15% sobre R$ 200,00 = R$ 30,00; novo preço = R$ 200,00 + R$ 30,00 = R$ 230,00.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'R$ 215,00', false, 1), (v_q, 'B', 'R$ 220,00', false, 2),
    (v_q, 'C', 'R$ 225,00', false, 3), (v_q, 'D', 'R$ 230,00', true, 4);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_rlm, v_top_porcentagem, 'Banca Exemplo', 2026,
    'Julgue o item: se A está para B assim como 3 está para 5, e A vale 12, então B vale 20.',
    'certo_errado', 'media',
    'Certo. Pela proporção 3/5 = 12/B, temos B = (12 × 5) / 3 = 20.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', true, 1), (v_q, 'E', 'Errado', false, 2);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_rlm, v_top_porcentagem, 'Banca Exemplo', 2026,
    'Em uma repartição, a razão entre servidores efetivos e comissionados é de 4 para 1. Se há 25 servidores comissionados, quantos são efetivos?',
    'multipla_escolha', 'dificil',
    'Se a razão é 4 efetivos para cada comissionado, e há 25 comissionados, então efetivos = 4 × 25 = 100.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', '80', false, 1), (v_q, 'B', '90', false, 2),
    (v_q, 'C', '100', true, 3), (v_q, 'D', '120', false, 4);

  -- ------------------------------------------------------------------------
  -- RACIOCÍNIO LÓGICO-MATEMÁTICO — Análise combinatória
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_rlm, v_top_combinatoria, 'Banca Exemplo', 2026,
    'De quantas formas distintas 3 documentos diferentes podem ser organizados em uma pilha?',
    'multipla_escolha', 'facil',
    'Trata-se de uma permutação simples de 3 elementos: 3! = 3 × 2 × 1 = 6.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', '3', false, 1), (v_q, 'B', '6', true, 2),
    (v_q, 'C', '9', false, 3), (v_q, 'D', '12', false, 4);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_rlm, v_top_combinatoria, 'Banca Exemplo', 2026,
    'Julgue o item: o número de comissões de 2 pessoas que podem ser formadas a partir de um grupo de 5 servidores é igual a 20.',
    'certo_errado', 'media',
    'Errado. Combinação de 5 elementos tomados 2 a 2: C(5,2) = 5!/(2!·3!) = 10, e não 20.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', false, 1), (v_q, 'E', 'Errado', true, 2);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_rlm, v_top_combinatoria, 'Banca Exemplo', 2026,
    'Uma senha de acesso é formada por 2 letras distintas (entre 26 possíveis) seguidas de 2 números distintos (entre 10 dígitos). Quantas senhas distintas podem ser formadas?',
    'multipla_escolha', 'dificil',
    'Pelo princípio multiplicativo: 26 × 25 (letras sem repetição) × 10 × 9 (números sem repetição) = 650 × 90 = 58.500.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', '5.850', false, 1), (v_q, 'B', '58.500', true, 2),
    (v_q, 'C', '6.500', false, 3), (v_q, 'D', '65.000', false, 4);

  -- ------------------------------------------------------------------------
  -- DIREITO ADMINISTRATIVO — Princípios da Administração Pública
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_direito, v_top_principios, 'Banca Exemplo', 2026,
    'Julgue o item: o princípio da publicidade impõe que os atos administrativos sejam, em regra, divulgados para conhecimento público, ressalvadas exceções legais, como o sigilo necessário à segurança do Estado.',
    'certo_errado', 'facil',
    'Certo. A publicidade é a regra na Administração Pública; exceções (sigilo) existem apenas quando previstas em lei.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', true, 1), (v_q, 'E', 'Errado', false, 2);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_direito, v_top_principios, 'Banca Exemplo', 2026,
    'O princípio segundo o qual a Administração Pública deve buscar a solução mais adequada e econômica para o interesse coletivo, evitando desperdício de recursos, é o princípio da:',
    'multipla_escolha', 'media',
    'O princípio da eficiência (incluído pela EC nº 19/1998) exige que a atuação administrativa seja rápida, econômica e produza resultados satisfatórios.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Legalidade', false, 1), (v_q, 'B', 'Impessoalidade', false, 2),
    (v_q, 'C', 'Eficiência', true, 3), (v_q, 'D', 'Moralidade', false, 4);

  -- ------------------------------------------------------------------------
  -- DIREITO ADMINISTRATIVO — Atos administrativos
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_direito, v_top_atos, 'Banca Exemplo', 2026,
    'São atributos do ato administrativo, EXCETO:',
    'multipla_escolha', 'facil',
    'Os atributos clássicos são presunção de legitimidade, autoexecutoriedade, imperatividade e tipicidade; onerosidade não é um atributo do ato administrativo.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Presunção de legitimidade', false, 1), (v_q, 'B', 'Autoexecutoriedade', false, 2),
    (v_q, 'C', 'Imperatividade', false, 3), (v_q, 'D', 'Onerosidade', true, 4);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_direito, v_top_atos, 'Banca Exemplo', 2026,
    'Julgue o item: a revogação de um ato administrativo ocorre quando este é ilegal, produzindo efeitos "ex tunc" (retroativos).',
    'certo_errado', 'media',
    'Errado. Isso descreve a ANULAÇÃO (por ilegalidade, efeitos ex tunc). A revogação ocorre por conveniência e oportunidade, com efeitos "ex nunc" (não retroativos).'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', false, 1), (v_q, 'E', 'Errado', true, 2);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_direito, v_top_atos, 'Banca Exemplo', 2026,
    'Assinale a alternativa correta sobre a anulação e a revogação dos atos administrativos:',
    'multipla_escolha', 'dificil',
    'A anulação decorre de ilegalidade e retroage (ex tunc); a revogação decorre de conveniência/oportunidade, produz efeitos apenas para o futuro (ex nunc) e não pode atingir direitos adquiridos.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Ambas podem incidir sobre atos vinculados e discricionários, sempre com efeitos ex tunc.', false, 1),
    (v_q, 'B', 'A anulação decorre de ilegalidade e retroage (ex tunc); a revogação decorre de conveniência e não retroage (ex nunc).', true, 2),
    (v_q, 'C', 'A revogação pode atingir atos que já geraram direitos adquiridos, sem restrição.', false, 3),
    (v_q, 'D', 'A anulação é sempre um ato discricionário da Administração.', false, 4);

  -- ------------------------------------------------------------------------
  -- DIREITO ADMINISTRATIVO — Licitações e contratos
  -- ------------------------------------------------------------------------
  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_direito, v_top_licitacoes, 'Banca Exemplo', 2026,
    'A modalidade de licitação destinada à aquisição de bens e serviços comuns, realizada em sessão pública com disputa por meio de propostas e lances, é o(a):',
    'multipla_escolha', 'facil',
    'O pregão é a modalidade voltada à aquisição de bens e serviços comuns, com disputa por meio de propostas e lances.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'Concorrência', false, 1), (v_q, 'B', 'Convite', false, 2),
    (v_q, 'C', 'Pregão', true, 3), (v_q, 'D', 'Concurso', false, 4);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_direito, v_top_licitacoes, 'Banca Exemplo', 2026,
    'Julgue o item: segundo a Lei nº 14.133/2021 (Nova Lei de Licitações), a dispensa de licitação é sempre proibida, independentemente do valor da contratação.',
    'certo_errado', 'media',
    'Errado. A lei prevê hipóteses de dispensa de licitação (ex.: valores baixos, emergência, guerra); a dispensa não é sempre proibida.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'C', 'Certo', false, 1), (v_q, 'E', 'Errado', true, 2);

  insert into public.questoes (concurso_id, materia_id, topico_id, banca, ano, enunciado, tipo, dificuldade, explicacao)
  values (v_concurso_id, v_materia_direito, v_top_licitacoes, 'Banca Exemplo', 2026,
    'Sobre os contratos administrativos, é correto afirmar que:',
    'multipla_escolha', 'dificil',
    'Os contratos administrativos possuem cláusulas exorbitantes que conferem à Administração prerrogativas como alteração e rescisão unilaterais e fiscalização da execução, sempre resguardado o equilíbrio econômico-financeiro do contrato.'
  ) returning id into v_q;
  insert into public.alternativas (questao_id, letra, texto, correta, ordem) values
    (v_q, 'A', 'A Administração não pode alterar unilateralmente as cláusulas contratuais.', false, 1),
    (v_q, 'B', 'A Administração possui prerrogativas como a alteração unilateral e a fiscalização da execução, observado o equilíbrio econômico-financeiro.', true, 2),
    (v_q, 'C', 'O contratado pode rescindir o contrato a qualquer momento, sem motivação.', false, 3),
    (v_q, 'D', 'Cláusulas exorbitantes não existem em contratos administrativos.', false, 4);

end $$;
