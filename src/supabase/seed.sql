-- =========================
-- Users Table (Supabase Auth)
-- =========================
-- Supabase provides auth.users by default
-- We'll extend it via "profiles" table

-- =========================
-- Profiles Table
-- =========================

-- First, Create the Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT DEFAULT '';
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  selected_charity_id UUID,
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active','inactive','cancelled')),
  subscription_tier TEXT, 
  stripe_customer_id TEXT,
  charity_contribution_total NUMERIC DEFAULT 0, 
  winnings_total NUMERIC DEFAULT 0,
  winnings_status TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- Scores Table (Rolling 5 per user)
-- =========================
CREATE TABLE public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score_value INTEGER CHECK (score_value >= 1 AND score_value <= 45) NOT NULL,
  score_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger function to maintain only latest 5 scores per user
CREATE OR REPLACE FUNCTION maintain_rolling_five_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE id IN (
    SELECT id FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY score_date DESC, created_at DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_rolling_scores
AFTER INSERT ON public.scores
FOR EACH ROW EXECUTE FUNCTION maintain_rolling_five_scores();

-- =========================
-- Charities Table
-- =========================
CREATE TABLE public.charities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================
-- Charity Events Table
-- =========================
CREATE TABLE public.charity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================
-- Draws Table
-- =========================
CREATE TABLE public.draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_month DATE NOT NULL, -- e.g., '2026-03-01'
  winning_numbers INTEGER[] NOT NULL, -- array of 5 numbers
  total_prize_pool NUMERIC(12, 2) NOT NULL,
  rollover_amount_from_previous NUMERIC(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  is_jackpot_rolled_over BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- Draw Winners Table
-- =========================
CREATE TABLE public.draw_winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type INTEGER CHECK (match_type IN (3,4,5)), -- 5,4,3 number match
  prize_amount NUMERIC(12,2),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending','approved','rejected')),
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- Subscriptions Table
-- =========================
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT;
  plan TEXT CHECK (plan IN ('monthly','yearly')) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  subscription_amount NUMERIC(12,2) NOT NULL,
  next_renewal_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles 
ADD COLUMN subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive','active','past_due','canceled')),
ADD COLUMN subscription_renewal_date TIMESTAMPTZ,
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN stripe_price_id TEXT;


-- Automation: Create profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    role, 
    charity_percentage, 
    full_name, 
    selected_charity_id
  )
  VALUES (
    NEW.id, 
    'subscriber', 
    10,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    (NEW.raw_user_meta_data->>'selected_charity_id')::UUID 
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1. Add the missing Stripe column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 2. Make user_id UNIQUE (Required for .upsert to work)
ALTER TABLE public.subscriptions 
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- 3. Update the RLS (If not already done)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscription" 
ON public.subscriptions 
FOR ALL USING (auth.uid() = user_id);


CREATE TABLE email_change_otps (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,,
  new_email text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS (if not already)
ALTER TABLE public.email_change_otps ENABLE ROW LEVEL SECURITY;

-- Create Policy: Allow users to insert/update their own OTP
CREATE POLICY "Users can manage their own email change OTPs" 
ON public.email_change_otps
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);


-- Combined Profiles Table Schema
CREATE TABLE public.profiles (
  -- Identity & Basics
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Charity Settings & Stats
  selected_charity_id UUID,
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10),
  charity_contribution_total NUMERIC DEFAULT 0,
  
  -- Winnings Info
  winnings_total NUMERIC DEFAULT 0,
  winnings_status TEXT DEFAULT 'none',

  -- Subscription & Stripe Integration
  subscription_status TEXT DEFAULT 'inactive' 
    CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled', 'cancelled')),
  subscription_tier TEXT,
  subscription_renewal_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT
);

-- Automation: Create profile on Auth Signup (Including Charity ID)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    role, 
    charity_percentage, 
    full_name, 
    selected_charity_id,
    subscription_tier
  )
  VALUES (
    NEW.id, 
    'subscriber', 
    10,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    (NEW.raw_user_meta_data->>'selected_charity_id')::UUID,
    NEW.raw_user_meta_data->>'subscription_tier'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE public.profiles
ADD CONSTRAINT fk_charity
FOREIGN KEY (selected_charity_id) 
REFERENCES public.charities(id);

ALTER TABLE public.scores
ADD CONSTRAINT fk_scores_profile
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Force Supabase to refresh its memory of the tables
NOTIFY pgrst, 'reload schema';


select * from pg_policies where tablename = 'profiles';

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

drop policy "Admins can view all profiles" on profiles;

create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (is_admin());


-- Create the relationship
ALTER TABLE public.scores
ADD CONSTRAINT fk_scores_profile
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Force Supabase to refresh its memory of the tables
NOTIFY pgrst, 'reload schema';
-- 1. Create the relationship between subscriptions and profiles
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS fk_user_subscriptions;

ALTER TABLE public.subscriptions
ADD CONSTRAINT fk_user_subscriptions
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 2. Refresh the schema cache
NOTIFY pgrst, 'reload schema';


-- Set defaults so the code doesn't crash if these are missing
ALTER TABLE public.draws ALTER COLUMN draw_month SET DEFAULT CURRENT_DATE;
ALTER TABLE public.draws ALTER COLUMN total_prize_pool SET DEFAULT 0.00;
SELECT conbin FROM pg_constraint WHERE conname = 'draws_status_check';

-- 1. Allow authenticated users to upload to 'charity-logos'
CREATE POLICY "Allow admin uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'charity-logos');

-- 2. Allow public to view the logos
CREATE POLICY "Public logo access" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'charity-logos');

-- Allow authenticated users to upload to 'charity-logos'
insert into storage.buckets (id, name, public) 
values ('charity-logos', 'charity-logos', true)
ON CONFLICT (id) DO NOTHING;

create policy "Admins can upload logos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'charity-logos');

create policy "Anyone can view logos"
on storage.objects for select
to public
using (bucket_id = 'charity-logos');