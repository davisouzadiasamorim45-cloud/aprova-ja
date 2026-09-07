-- ============================================================================
-- Popula o catálogo com concursos públicos reais (levantamento de 06/09/2026,
-- via PCI Concursos e agregadores) — mistura de "previstos" (ainda sem edital
-- publicado, mas com banca/vagas já definidas) e "inscrições abertas" (data
-- de inscrição confirmada). Isso é um retrato do momento da pesquisa: como
-- o status de concurso muda toda semana, vale revisar/atualizar periodicamente.
-- Seguro rodar mais de uma vez.
-- ============================================================================

insert into public.concursos (nome, orgao, banca, ano, nivel, status, descricao)
select * from (values
  -- --- Inscrições abertas (data confirmada) ---
  ('Transpetro - Vários Cargos', 'Petrobras Transporte S.A. (Transpetro)', null, 2026, 'superior', 'inscricoes_abertas',
   'Vagas de nível médio, técnico e superior. Inscrições até 14/09/2026.'),
  ('AgSUS - Vários Cargos', 'Agência Brasileira de Apoio à Gestão do SUS (AgSUS)', null, 2026, 'superior', 'inscricoes_abertas',
   'Cadastro de reserva para cargos técnicos e superiores, incluindo Psicólogo. Inscrições entre setembro e outubro de 2026.'),
  ('DEPA - Colégio Militar (Preparatório)', 'Diretoria de Educação Preparatória e Assistencial (Exército)', null, 2026, 'fundamental', 'inscricoes_abertas',
   '355 vagas para aluno do 6º ano do Ensino Fundamental e do 1º ano do Ensino Médio. Inscrição até 17/09/2026.'),

  -- --- Previstos (banca/vagas definidas, edital ainda não publicado) ---
  ('PC BA - Investigador, Escrivão e Delegado', 'Polícia Civil da Bahia', 'AOCP', 2026, 'superior', 'previsto',
   '750 vagas imediatas. Banca AOCP já contratada; edital previsto para breve.'),
  ('PM PI - Soldado', 'Polícia Militar do Piauí', 'FCC', 2026, 'medio', 'previsto',
   'Cerca de 1.000 vagas para Policial Militar. Banca FCC confirmada; edital previsto.'),
  ('TCE-MA - Técnico de Controle Externo', 'Tribunal de Contas do Estado do Maranhão', 'Cebraspe', 2026, 'superior', 'previsto',
   '118 vagas autorizadas para níveis médio e superior. Banca Cebraspe contratada; edital iminente.'),
  ('CGU - Auditor Federal de Finanças e Controle', 'Controladoria-Geral da União', null, 2026, 'superior', 'previsto',
   '60 vagas (com possibilidade de ampliação para 120) para Auditor Federal de Finanças e Controle (AFFC).'),
  ('IBGE - Cargos Efetivos', 'Instituto Brasileiro de Geografia e Estatística', null, 2026, 'superior', 'previsto',
   'Pedido de autorização para cerca de 900 vagas efetivas em análise.'),
  ('Bacen - Auditor e Procurador', 'Banco Central do Brasil', null, 2026, 'superior', 'previsto',
   '140 vagas previstas: 120 para Auditor e 20 para Procurador.'),
  ('ABIN - Oficial e Agente de Inteligência', 'Agência Brasileira de Inteligência', null, 2026, 'superior', 'previsto',
   '301 vagas solicitadas, cobrindo parte do déficit de servidores do órgão.'),
  ('DPU - Defensor Público Federal', 'Defensoria Pública da União', null, 2026, 'superior', 'previsto',
   'Regulamento do concurso publicado; até 810 vagas autorizadas na LOA 2026.'),
  ('PRF - Policial Rodoviário Federal', 'Polícia Rodoviária Federal', null, 2026, 'medio', 'previsto',
   '533 vagas solicitadas para as áreas Policial e Administrativa.'),
  ('Sefaz MG - Gestor Fazendário', 'Secretaria de Estado de Fazenda de Minas Gerais', null, 2026, 'superior', 'previsto',
   'Até 250 vagas previstas, com remuneração inicial em torno de R$ 10,6 mil.'),
  ('TCE-GO - Técnico de Controle Externo', 'Tribunal de Contas do Estado de Goiás', 'FCC', 2026, 'superior', 'previsto',
   'Banca FCC contratada para seleção de técnicos de controle externo.'),
  ('Receita Federal - Auditor Fiscal', 'Receita Federal do Brasil', null, 2026, 'superior', 'previsto',
   'Possibilidade de nova autorização com cerca de 100 vagas.'),
  ('INSS - Técnico do Seguro Social', 'Instituto Nacional do Seguro Social', null, 2026, 'medio', 'previsto',
   'Maior concurso do pacote federal em análise: 8.500 vagas para Técnico do Seguro Social.'),
  ('PC TO - Diversos Cargos', 'Polícia Civil do Tocantins', null, 2026, 'medio', 'previsto',
   '452 vagas integrando o plano estratégico de Segurança Pública do estado.'),
  ('PM MA - Soldado', 'Polícia Militar do Maranhão', null, 2026, 'medio', 'previsto',
   '1.000 vagas; banca definida e ajustes de idade/altura mínima já publicados pelo Ministério Público.')
) as novos(nome, orgao, banca, ano, nivel, status, descricao)
where not exists (
  select 1 from public.concursos c where c.nome = novos.nome
);
