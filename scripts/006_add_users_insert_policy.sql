-- Add INSERT policy for users table to allow signup
-- This policy allows anyone to create a new user account during signup
create policy "Anyone can create a user account"
  on public.users for insert
  with check (true);
