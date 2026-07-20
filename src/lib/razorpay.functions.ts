import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createHmac } from "crypto";

type CreateOrderInput = { amountInr: number };
type VerifyInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amountInr: number;
};

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CreateOrderInput) => {
    const amt = Number(data?.amountInr);
    if (!Number.isFinite(amt) || amt < 1) throw new Error("Invalid amount");
    if (amt > 500000) throw new Error("Amount above per-transaction limit");
    return { amountInr: Math.round(amt * 100) / 100 };
  })
  .handler(async ({ data, context }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error("Razorpay not configured");

    const receipt = `lmc_${context.userId.slice(0, 8)}_${Date.now()}`;
    const body = {
      amount: Math.round(data.amountInr * 100), // paise
      currency: "INR",
      receipt,
      notes: { user_id: context.userId },
    };

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Razorpay order failed: ${t}`);
    }
    const order = (await res.json()) as { id: string; amount: number; currency: string };
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: VerifyInput) => {
    if (!data?.razorpay_order_id || !data?.razorpay_payment_id || !data?.razorpay_signature) {
      throw new Error("Missing payment fields");
    }
    const amt = Number(data.amountInr);
    if (!Number.isFinite(amt) || amt <= 0) throw new Error("Invalid amount");
    return {
      razorpay_order_id: String(data.razorpay_order_id),
      razorpay_payment_id: String(data.razorpay_payment_id),
      razorpay_signature: String(data.razorpay_signature),
      amountInr: amt,
    };
  })
  .handler(async ({ data, context }) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new Error("Razorpay not configured");

    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");
    if (expected !== data.razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    const { supabase } = context;

    // Convert INR to LMC at fixed 1 INR = 1.25 LMC (price 0.8)
    const lmcPerInr = 1.25;
    const price = 1 / lmcPerInr;
    const lmcQty = Math.round(data.amountInr * lmcPerInr * 10000) / 10000;

    // Credit only the LMC to wallet (not the INR); log a single buy transaction
    const { error: creditErr } = await (supabase as any).rpc("razorpay_credit_lmc", {
      p_amount_inr: data.amountInr,
      p_amount_lmc: lmcQty,
      p_price: price,
      p_payment_id: data.razorpay_payment_id,
    });
    if (creditErr) throw new Error(creditErr.message);

    return { ok: true, lmc: lmcQty, paymentId: data.razorpay_payment_id };
  });
