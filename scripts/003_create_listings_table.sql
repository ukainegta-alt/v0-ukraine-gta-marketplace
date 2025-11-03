-- Create listings table
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  description text not null,
  price numeric(10, 2) not null,
  contact_info text not null,
  is_vip boolean default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  views_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.listings enable row level security;

-- Policies for listings
create policy "Anyone can view approved listings"
  on public.listings for select
  using (status = 'approved' or user_id = (current_setting('app.current_user_id', true))::uuid or (current_setting('app.current_user_role', true)) = 'admin');

create policy "Users can create own listings"
  on public.listings for insert
  with check (user_id = (current_setting('app.current_user_id', true))::uuid);

create policy "Users can update own listings"
  on public.listings for update
  using (user_id = (current_setting('app.current_user_id', true))::uuid or (current_setting('app.current_user_role', true)) = 'admin');

create policy "Users can delete own listings"
  on public.listings for delete
  using (user_id = (current_setting('app.current_user_id', true))::uuid or (current_setting('app.current_user_role', true)) = 'admin');

-- Create indexes for better performance
create index if not exists listings_user_id_idx on public.listings(user_id);
create index if not exists listings_category_id_idx on public.listings(category_id);
create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_is_vip_idx on public.listings(is_vip);
create index if not exists listings_created_at_idx on public.listings(created_at desc);
