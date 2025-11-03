-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_uk text unique not null,
  slug text unique not null,
  icon text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.categories enable row level security;

-- Everyone can view categories
create policy "Anyone can view categories"
  on public.categories for select
  using (true);

-- Only admins can manage categories
create policy "Admins can insert categories"
  on public.categories for insert
  with check ((current_setting('app.current_user_role', true)) = 'admin');

create policy "Admins can update categories"
  on public.categories for update
  using ((current_setting('app.current_user_role', true)) = 'admin');

create policy "Admins can delete categories"
  on public.categories for delete
  using ((current_setting('app.current_user_role', true)) = 'admin');

-- Insert default categories
insert into public.categories (name_uk, slug, icon) values
  ('Транспорт', 'transport', '🚗'),
  ('Одяг', 'clothing', '👕'),
  ('Нерухомість', 'real-estate', '🏠'),
  ('Інше', 'other', '📦')
on conflict (slug) do nothing;
