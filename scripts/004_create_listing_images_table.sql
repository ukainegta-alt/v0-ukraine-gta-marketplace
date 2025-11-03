-- Create listing images table
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.listing_images enable row level security;

-- Policies for listing images
create policy "Anyone can view images of approved listings"
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
      and (listings.status = 'approved' or listings.user_id = (current_setting('app.current_user_id', true))::uuid or (current_setting('app.current_user_role', true)) = 'admin')
    )
  );

create policy "Users can insert images for own listings"
  on public.listing_images for insert
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
      and listings.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  );

create policy "Users can delete images from own listings"
  on public.listing_images for delete
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
      and listings.user_id = (current_setting('app.current_user_id', true))::uuid
    )
  );

-- Create index for faster lookups
create index if not exists listing_images_listing_id_idx on public.listing_images(listing_id);
