
CREATE OR REPLACE FUNCTION public.razorpay_credit_lmc(p_amount_inr numeric, p_amount_lmc numeric, p_price numeric, p_payment_id text)
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
  IF p_amount_inr <= 0 OR p_amount_lmc <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  UPDATE public.wallets
     SET lmc_balance = lmc_balance + p_amount_lmc,
         updated_at = now()
   WHERE user_id = v_user;

  INSERT INTO public.transactions (user_id, type, amount_inr, amount_lmc, price, status, note)
  VALUES (v_user, 'buy', p_amount_inr, p_amount_lmc, p_price, 'completed', 'Razorpay ' || p_payment_id)
  RETURNING * INTO v_tx;

  RETURN v_tx;
END;
$$;
