-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_listings_updated_at on public.listings;
create trigger update_listings_updated_at
  before update on public.listings
  for each row
  execute function public.update_updated_at_column();

-- Function to increment views count
create or replace function public.increment_listing_views(listing_uuid uuid)
returns void as $$
begin
  update public.listings
  set views_count = views_count + 1
  where id = listing_uuid;
end;
$$ language plpgsql security definer;
