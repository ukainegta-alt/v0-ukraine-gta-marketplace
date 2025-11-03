-- UkraineGTA 02 Marketplace Database Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Anyone can create a user account" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS users_nickname_idx ON public.users(nickname);

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uk TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

INSERT INTO public.categories (name_uk, slug, icon) VALUES
  ('Транспорт', 'transport', '🚗'),
  ('Одяг', 'clothing', '👕'),
  ('Нерухомість', 'real-estate', '🏠'),
  ('Інше', 'other', '📦')
ON CONFLICT (slug) DO NOTHING;

-- 3. Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  contact_info TEXT NOT NULL DEFAULT 'Немає контактної інформації',
  is_vip BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'approved', 'inactive', 'rejected')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved listings" ON public.listings
  FOR SELECT USING (status IN ('active', 'approved') OR auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can create own listings" ON public.listings
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can update own listings" ON public.listings
  FOR UPDATE USING (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can delete own listings" ON public.listings
  FOR DELETE USING (auth.uid()::TEXT = user_id::TEXT);

CREATE INDEX IF NOT EXISTS listings_user_id_idx ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS listings_category_id_idx ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS listings_status_idx ON public.listings(status);
CREATE INDEX IF NOT EXISTS listings_is_vip_idx ON public.listings(is_vip);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings(created_at DESC);

-- 4. Create listing_images table
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view images of approved listings" ON public.listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
      AND (listings.status IN ('active', 'approved') OR auth.uid()::TEXT = listings.user_id::TEXT)
    )
  );

CREATE POLICY "Users can insert images for own listings" ON public.listing_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
      AND auth.uid()::TEXT = listings.user_id::TEXT
    )
  );

CREATE POLICY "Users can delete images from own listings" ON public.listing_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_images.listing_id
      AND auth.uid()::TEXT = listings.user_id::TEXT
    )
  );

CREATE INDEX IF NOT EXISTS listing_images_listing_id_idx ON public.listing_images(listing_id);

-- 5. Create functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.listings
  SET views_count = views_count + 1
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create admin user (password: admin123)
-- Hash for 'admin123': 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT INTO public.users (nickname, password_hash, role) VALUES
  ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin')
ON CONFLICT (nickname) DO NOTHING;
