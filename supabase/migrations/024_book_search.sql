-- Search limited to chosen books, so the app answers from Shadow Persuasion
-- (the older third-party books stay in the table, unused, until removed).
create or replace function public.match_book_chunks(
  query_embedding vector,
  match_threshold double precision,
  match_count integer,
  titles text[]
)
returns table (id uuid, content text, book_title text, author text, chapter text, technique_name text, category text, similarity double precision)
language plpgsql
set search_path to 'public'
as $$
begin
  return query
  select kc.id, kc.content, kc.book_title, kc.author, kc.chapter, kc.technique_name, kc.category,
         1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  where kc.book_title = any(titles)
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
end;
$$;
NOTIFY pgrst, 'reload schema';
