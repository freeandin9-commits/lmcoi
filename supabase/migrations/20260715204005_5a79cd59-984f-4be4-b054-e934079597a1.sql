
-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES public.profiles(id),
  kyc_status TEXT NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =========================================================
-- WALLETS
-- =========================================================
CREATE TABLE public.wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  inr_balance NUMERIC(20, 4) NOT NULL DEFAULT 0,
  lmc_balance NUMERIC(20, 8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE for authenticated - all mutations go through server functions with service_role.

-- =========================================================
-- TRANSACTIONS
-- =========================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit','withdraw','buy','sell','transfer','referral')),
  amount_inr NUMERIC(20, 4) NOT NULL DEFAULT 0,
  amount_lmc NUMERIC(20, 8) NOT NULL DEFAULT 0,
  price NUMERIC(20, 8),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','cancelled')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX transactions_user_created_idx ON public.transactions (user_id, created_at DESC);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- PRICE TICKS (public read)
-- =========================================================
CREATE TABLE public.price_ticks (
  t TIMESTAMPTZ PRIMARY KEY DEFAULT now(),
  price NUMERIC(20, 8) NOT NULL
);
CREATE INDEX price_ticks_t_desc_idx ON public.price_ticks (t DESC);
GRANT SELECT ON public.price_ticks TO anon, authenticated;
GRANT ALL ON public.price_ticks TO service_role;
ALTER TABLE public.price_ticks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read price ticks" ON public.price_ticks FOR SELECT TO anon, authenticated USING (true);

-- =========================================================
-- ANNOUNCEMENTS (public read)
-- =========================================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  tag TEXT NOT NULL DEFAULT 'Update',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (true);

-- =========================================================
-- Auto-provision profile + wallet on signup
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate a unique 8-char referral code
  LOOP
    new_code := 'LM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code);
  END LOOP;

  INSERT INTO public.profiles (id, email, display_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    new_code
  );

  INSERT INTO public.wallets (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- Atomic order placement (buy/sell) as SECURITY DEFINER RPC
-- =========================================================
CREATE OR REPLACE FUNCTION public.place_order(
  p_side TEXT,           -- 'buy' or 'sell'
  p_amount_lmc NUMERIC,  -- quantity of LMC being bought or sold
  p_price NUMERIC        -- price per LMC in INR (client-supplied, server re-checks)
)
RETURNS public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_market NUMERIC;
  v_inr NUMERIC;
  v_wallet public.wallets;
  v_tx public.transactions;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_side NOT IN ('buy','sell') THEN
    RAISE EXCEPTION 'Invalid side';
  END IF;

  IF p_amount_lmc <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Server-side price sanity: allow +/- 3% from latest tick
  SELECT price INTO v_market FROM public.price_ticks ORDER BY t DESC LIMIT 1;
  IF v_market IS NULL THEN
    RAISE EXCEPTION 'Market unavailable';
  END IF;
  IF abs(p_price - v_market) / v_market > 0.03 THEN
    RAISE EXCEPTION 'Price out of range';
  END IF;

  v_inr := round((p_amount_lmc * p_price)::numeric, 4);

  -- Lock the wallet row
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_user FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet missing';
  END IF;

  IF p_side = 'buy' THEN
    IF v_wallet.inr_balance < v_inr THEN
      RAISE EXCEPTION 'Insufficient INR balance';
    END IF;
    UPDATE public.wallets
       SET inr_balance = inr_balance - v_inr,
           lmc_balance = lmc_balance + p_amount_lmc,
           updated_at = now()
     WHERE user_id = v_user;
  ELSE
    IF v_wallet.lmc_balance < p_amount_lmc THEN
      RAISE EXCEPTION 'Insufficient LMC balance';
    END IF;
    UPDATE public.wallets
       SET lmc_balance = lmc_balance - p_amount_lmc,
           inr_balance = inr_balance + v_inr,
           updated_at = now()
     WHERE user_id = v_user;
  END IF;

  INSERT INTO public.transactions (user_id, type, amount_inr, amount_lmc, price, status)
  VALUES (v_user, p_side, v_inr, p_amount_lmc, p_price, 'completed')
  RETURNING * INTO v_tx;

  RETURN v_tx;
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order(TEXT, NUMERIC, NUMERIC) TO authenticated;

-- =========================================================
-- Deposit / Withdraw INR (simulated instant, replace with payments later)
-- =========================================================
CREATE OR REPLACE FUNCTION public.wallet_deposit_inr(p_amount NUMERIC)
RETURNS public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_tx public.transactions;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  IF p_amount > 500000 THEN RAISE EXCEPTION 'Amount above per-transaction limit'; END IF;

  UPDATE public.wallets SET inr_balance = inr_balance + p_amount, updated_at = now()
   WHERE user_id = v_user;

  INSERT INTO public.transactions (user_id, type, amount_inr, status, note)
  VALUES (v_user, 'deposit', p_amount, 'completed', 'INR deposit')
  RETURNING * INTO v_tx;
  RETURN v_tx;
END;
$$;
GRANT EXECUTE ON FUNCTION public.wallet_deposit_inr(NUMERIC) TO authenticated;

CREATE OR REPLACE FUNCTION public.wallet_withdraw_inr(p_amount NUMERIC)
RETURNS public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_wallet public.wallets;
  v_tx public.transactions;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;

  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_user FOR UPDATE;
  IF v_wallet.inr_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient INR balance';
  END IF;

  UPDATE public.wallets SET inr_balance = inr_balance - p_amount, updated_at = now()
   WHERE user_id = v_user;

  INSERT INTO public.transactions (user_id, type, amount_inr, status, note)
  VALUES (v_user, 'withdraw', p_amount, 'completed', 'INR withdrawal')
  RETURNING * INTO v_tx;
  RETURN v_tx;
END;
$$;
GRANT EXECUTE ON FUNCTION public.wallet_withdraw_inr(NUMERIC) TO authenticated;

-- =========================================================
-- Price tick generator (called by pg_cron every minute)
-- =========================================================
CREATE OR REPLACE FUNCTION public.generate_price_tick()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last NUMERIC;
  v_next NUMERIC;
BEGIN
  SELECT price INTO v_last FROM public.price_ticks ORDER BY t DESC LIMIT 1;
  IF v_last IS NULL THEN
    v_last := 42.75;
  END IF;
  -- Bounded random walk: +/- 0.6%, mean-reverting toward 42.75
  v_next := v_last + (random() - 0.5) * v_last * 0.012 + (42.75 - v_last) * 0.03;
  IF v_next < 1 THEN v_next := 1; END IF;
  INSERT INTO public.price_ticks (t, price) VALUES (now(), round(v_next::numeric, 4));

  -- Keep only last 7 days of ticks
  DELETE FROM public.price_ticks WHERE t < now() - INTERVAL '7 days';
END;
$$;
