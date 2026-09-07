-- ============================================================================
-- Link do edital: em vez de hospedar o PDF no nosso Storage, guardamos só a
-- URL do edital no site oficial do órgão/banca. A pessoa clica e abre/baixa
-- direto da fonte — sem gastar armazenamento nosso com arquivos grandes.
-- ============================================================================

alter table public.concursos
  add column if not exists edital_url text
    check (edital_url is null or edital_url ~* '^https?://');

-- Preenchido só para os concursos do catálogo que já têm edital publicado de
-- verdade (verificado nas fontes oficiais abaixo em 07/09/2026) — os demais
-- estão como "previsto" e ainda não têm edital, por definição.
update public.concursos set edital_url = 'https://agenciasus.org.br/editais'
  where nome = 'AgSUS - Vários Cargos';
update public.concursos set edital_url = 'https://transpetro.com.br/transpetro-institucional/quem-somos/carreiras/concursos.htm'
  where nome = 'Transpetro - Vários Cargos';
update public.concursos set edital_url = 'https://www.decex.eb.mil.br/colegios-militares'
  where nome = 'DEPA - Colégio Militar (Preparatório)';
