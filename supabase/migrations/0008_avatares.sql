-- ============================================================================
-- Foto de perfil: bucket de Storage + políticas de acesso.
--
-- profiles.avatar_url já existia desde a 0001 mas nunca foi usada. Os arquivos
-- ficam em avatars/<user_id>/<timestamp>.<ext> — o prefixo por pasta é o que
-- permite a política "só o dono mexe no que é dele" abaixo.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 3145728, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública (bucket público — precisa da política mesmo assim pra
-- acesso via API/SDK, não só pela URL pública direta).
create policy "avatares_select_public" on storage.objects
  for select using (bucket_id = 'avatars');

-- Escrita restrita à própria pasta: avatars/<auth.uid()>/...
create policy "avatares_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatares_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatares_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
