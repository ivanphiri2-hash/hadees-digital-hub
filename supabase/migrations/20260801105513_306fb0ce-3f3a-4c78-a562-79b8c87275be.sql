
create policy "docs staff all" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and public.is_staff(auth.uid()))
  with check (bucket_id = 'documents' and public.is_staff(auth.uid()));

create policy "docs client read" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and exists (
    select 1 from public.clients c where c.user_id = auth.uid() and c.id::text = (storage.foldername(name))[1]
  ));

create policy "docs client insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and exists (
    select 1 from public.clients c where c.user_id = auth.uid() and c.id::text = (storage.foldername(name))[1]
  ));
