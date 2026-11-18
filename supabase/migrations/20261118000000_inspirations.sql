create table public.inspirations (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) > 0),
  creator text not null default '',
  category text not null check (length(trim(category)) > 0),
  source text not null check (length(trim(source)) > 0),
  tags text[] not null default '{}',
  description text not null default '',
  original_url text not null unique check (original_url ~ '^https://'),
  image_url text not null check (image_url ~ '^(https://|/previews/)'),
  image_alt text not null default '',
  published_at timestamptz not null default now(),
  published boolean not null default false
);

create index inspirations_published_order
  on public.inspirations (published_at desc, slug)
  where published;

alter table public.inspirations enable row level security;

revoke all on public.inspirations from anon, authenticated;
grant select on public.inspirations to anon, authenticated;
grant select, insert, update, delete on public.inspirations to service_role;

create policy "Published inspiration is public"
on public.inspirations for select to anon, authenticated
using (published);
