import "./lib/error-capture";

import { createHmac } from "node:crypto";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function handleRazorpayOrder(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (request.method !== "POST" || url.pathname !== "/api/razorpay/create-order") {
    return undefined;
  }

  let body: { amount?: unknown; currency?: unknown; receipt?: unknown } = {};
  try {
    body = (await request.json()) as { amount?: unknown; currency?: unknown; receipt?: unknown };
  } catch {
    body = {};
  }

  const amount = Number(body.amount);
  const currency = typeof body.currency === "string" ? body.currency.toUpperCase() : "INR";
  const receipt = typeof body.receipt === "string" ? body.receipt : `lmc-${Date.now()}`;

  if (!Number.isFinite(amount) || amount <= 0) {
    return new Response(JSON.stringify({ error: "invalid_amount" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (keyId && keySecret) {
    try {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          currency,
          receipt,
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { id?: string; amount?: number; currency?: string; receipt?: string };
        if (payload.id) {
          return new Response(
            JSON.stringify({
              id: payload.id,
              amount: payload.amount ?? Math.round(amount),
              currency: payload.currency ?? currency,
              receipt: payload.receipt ?? receipt,
            }),
            {
              status: 200,
              headers: { "content-type": "application/json; charset=utf-8" },
            },
          );
        }
      }

      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText || "Unable to create Razorpay order" }), {
        status: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    } catch (error) {
      console.error("Razorpay order creation failed", error);
      return new Response(JSON.stringify({ error: "Unable to create Razorpay order" }), {
        status: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  }

  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return new Response(
    JSON.stringify({
      id: orderId,
      amount: Math.round(amount),
      currency,
      receipt,
    }),
    {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    },
  );
}

async function handleRazorpayVerify(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (request.method !== "POST" || url.pathname !== "/api/razorpay/verify-payment") {
    return undefined;
  }

  let body: { razorpay_order_id?: unknown; razorpay_payment_id?: unknown; razorpay_signature?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_body" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";

  if (!orderId || !paymentId || !signature) {
    return new Response(JSON.stringify({ error: "missing_fields" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!keySecret) {
    // No secret configured — accept in dev/test mode
    console.warn("RAZORPAY_KEY_SECRET not set; skipping signature verification.");
    return new Response(JSON.stringify({ verified: true, dev: true }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expected !== signature) {
    return new Response(JSON.stringify({ error: "signature_mismatch" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  return new Response(JSON.stringify({ verified: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const razorpayOrderResponse = await handleRazorpayOrder(request);
      if (razorpayOrderResponse) {
        return razorpayOrderResponse;
      }

      const razorpayVerifyResponse = await handleRazorpayVerify(request);
      if (razorpayVerifyResponse) {
        return razorpayVerifyResponse;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
