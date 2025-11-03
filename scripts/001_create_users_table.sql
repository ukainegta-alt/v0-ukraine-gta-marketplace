-- Create users table for custom NickName + Password authentication
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nickname text unique not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies for users table
create policy "Users can view all profiles"
  on public.users for select
  using (true);

create policy "Users can update own profile"
  on public.users for update
  using (id = (current_setting('app.current_user_id', true))::uuid);

-- Create index for faster nickname lookups
create index if not exists users_nickname_idx on public.users(nickname);
