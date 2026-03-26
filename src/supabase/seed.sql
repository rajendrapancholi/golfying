-- CLEAN & CORRECTED SUPABASE SCHEMA
-- 1. PROFILES (Main User Model)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Charity
  selected_charity_id UUID REFERENCES public.charities(id),
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10),
  charity_contribution_total NUMERIC DEFAULT 0,

  -- Winnings
  winnings_total NUMERIC DEFAULT 0,
  winnings_status TEXT DEFAULT 'none',

  -- Subscription
  subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive','active','past_due','canceled','cancelled')),
  subscription_tier TEXT,
  subscription_renewal_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,

  -- Region Support
  region_id TEXT DEFAULT 'GB'
);

-- 2. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, role, charity_percentage, full_name,
    selected_charity_id, subscription_tier
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. CHARITIES
CREATE TABLE public.charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SCORES (Rolling 5 per user)
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score_value INTEGER NOT NULL CHECK (score_value BETWEEN 1 AND 45),
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Maintain Rolling 5 Scores
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

DROP TRIGGER IF EXISTS tr_rolling_scores ON public.scores;

CREATE TRIGGER tr_rolling_scores
AFTER INSERT ON public.scores
FOR EACH ROW EXECUTE FUNCTION maintain_rolling_five_scores();

-- 5. CHARITY EVENTS
CREATE TABLE public.charity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. DRAWS
CREATE TABLE public.draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month DATE NOT NULL DEFAULT CURRENT_DATE,
  winning_numbers INTEGER[] NOT NULL,
  total_prize_pool NUMERIC(12,2) DEFAULT 0.00,
  rollover_amount_from_previous NUMERIC(12,2) DEFAULT 0,
  rollover_amount DECIMAL(12,2) DEFAULT 0.00,
  total_pool DECIMAL(12,2) DEFAULT 0.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','simulated','published')),
  is_jackpot_rolled_over BOOLEAN DEFAULT FALSE,
  region_id TEXT DEFAULT 'GB',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Region-Based RLS
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see region-restricted draws"
ON public.draws FOR SELECT
USING (region_id = (SELECT region_id FROM public.profiles WHERE id = auth.uid()));

-- 7. DRAW WINNERS
CREATE TABLE public.draw_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_type INTEGER CHECK (match_type IN (3,4,5)),
  prize_amount NUMERIC(12,2),
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending','approved','rejected','paid')),
  payment_status TEXT DEFAULT 'pending',
  region_id TEXT DEFAULT 'GB',
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('monthly','yearly')),
  is_active BOOLEAN DEFAULT FALSE,
  subscription_amount NUMERIC(12,2) NOT NULL,
  next_renewal_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscription"
ON public.subscriptions
FOR ALL USING (auth.uid() = user_id);

-- 9. EMAIL CHANGE OTPs
CREATE TABLE public.email_change_otps (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  new_email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_change_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own email change OTPs"
ON public.email_change_otps
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10. STORAGE POLICIES (charity-logos bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('charity-logos', 'charity-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'charity-logos');

CREATE POLICY "Public view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'charity-logos');

-- 11. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  charity_id UUID REFERENCES charities(id),
  bonus_multiplier DECIMAL DEFAULT 1.0,
  is_active BOOLEAN DEFAULT false,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ
);

-- 12. TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_id UUID REFERENCES profiles(id),
  subscription_status TEXT
);

-- 13. ADMIN CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
