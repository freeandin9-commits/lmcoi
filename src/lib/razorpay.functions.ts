import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createHmac } from "crypto";

/** Fixed rate: 1 INR = 1.25 LMC */
const LMC_PER_INR = 1.25;
const PRICE_PER_LMC = 1 / LMC_PER_INR;

type CreateOrderInput = { amountInr: number };
type VerifyInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amountInr: number;
};

function razorpayAuthHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

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
        Authorization: razorpayAuthHeader(keyId, keySecret),
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
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error("Razorpay not configured");

    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");
    if (expected !== data.razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // Confirm payment is captured/authorized on Razorpay before any wallet credit
    const payRes = await fetch(`https://api.razorpay.com/v1/payments/${data.razorpay_payment_id}`, {
      headers: { Authorization: razorpayAuthHeader(keyId, keySecret) },
    });
    if (!payRes.ok) {
      throw new Error("Unable to verify payment with Razorpay");
    }
    const payment = (await payRes.json()) as {
      id: string;
      status: string;
      order_id: string;
      amount: number;
      currency: string;
    };

    if (payment.order_id !== data.razorpay_order_id) {
      throw new Error("Payment order mismatch");
    }
    if (payment.currency !== "INR") {
      throw new Error("Unsupported currency");
    }
    if (payment.status !== "captured" && payment.status !== "authorized") {
      throw new Error(`Payment not successful (${payment.status})`);
    }

    // Use Razorpay paid amount (paise → INR), not a client-only figure
    const paidInr = Math.round(payment.amount) / 100;
    if (Math.abs(paidInr - data.amountInr) > 0.01) {
      throw new Error("Payment amount mismatch");
    }

    // Exact "You will receive" value: INR × 1.25 LMC
    const lmcQty = Math.round(paidInr * LMC_PER_INR * 10000) / 10000;

    const { supabase } = context;
    const { data: tx, error: creditErr } = await (supabase as any).rpc("razorpay_credit_lmc", {
      p_amount_inr: paidInr,
      p_amount_lmc: lmcQty,
      p_price: PRICE_PER_LMC,
      p_payment_id: data.razorpay_payment_id,
    });
    if (creditErr) throw new Error(creditErr.message);

    const credited = Number(tx?.amount_lmc ?? lmcQty);
    return { ok: true, lmc: credited, paymentId: data.razorpay_payment_id };
  });
