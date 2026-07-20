-- Fixed rate trading: 1 INR = 1.25 LMC (price per LMC = 0.8)
-- Removes dependency on live price_ticks for place_order.
-- Makes razorpay_credit_lmc idempotent on payment_id.

CREATE OR REPLACE FUNCTION public.place_order(
  p_side TEXT,
  p_amount_lmc NUMERIC,
  p_price NUMERIC
)
RETURNS public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_fixed_price NUMERIC := 0.8; -- 1 INR = 1.25 LMC
  v_inr NUMERIC;
  v_wallet public.wallets;
  v_tx public.transactions;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_side NOT IN ('buy', 'sell') THEN
    RAISE EXCEPTION 'Invalid side';
  END IF;

  IF p_amount_lmc <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Always use fixed rate; ignore drifting client price (allow tiny float noise)
  IF abs(p_price - v_fixed_price) > 0.01 THEN
    RAISE EXCEPTION 'Price out of range';
  END IF;

  v_inr := round((p_amount_lmc * v_fixed_price)::numeric, 4);

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
  VALUES (v_user, p_side, v_inr, p_amount_lmc, v_fixed_price, 'completed')
  RETURNING * INTO v_tx;

  RETURN v_tx;
END;
$$;

CREATE OR REPLACE FUNCTION public.razorpay_credit_lmc(
  p_amount_inr numeric,
  p_amount_lmc numeric,
  p_price numeric,
  p_payment_id text
)
RETURNS public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_fixed_price NUMERIC := 0.8;
  v_lmc NUMERIC;
  v_existing public.transactions;
  v_tx public.transactions;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount_inr <= 0 OR p_amount_lmc <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;
  IF p_payment_id IS NULL OR length(trim(p_payment_id)) = 0 THEN
    RAISE EXCEPTION 'Payment id required';
  END IF;

  -- Idempotent: same Razorpay payment must not credit twice
  SELECT * INTO v_existing
    FROM public.transactions
   WHERE user_id = v_user
     AND type = 'buy'
     AND note = 'Razorpay ' || p_payment_id
   LIMIT 1;

  IF FOUND THEN
    RETURN v_existing;
  END IF;

  -- Credit exactly INR * 1.25 LMC (matches "You will receive")
  v_lmc := round((p_amount_inr * 1.25)::numeric, 4);

  UPDATE public.wallets
     SET lmc_balance = lmc_balance + v_lmc,
         updated_at = now()
   WHERE user_id = v_user;

  INSERT INTO public.transactions (user_id, type, amount_inr, amount_lmc, price, status, note)
  VALUES (v_user, 'buy', p_amount_inr, v_lmc, v_fixed_price, 'completed', 'Razorpay ' || p_payment_id)
  RETURNING * INTO v_tx;

  RETURN v_tx;
END;
$$;
