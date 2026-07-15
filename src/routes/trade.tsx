import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/lmc/Shell";
import { PriceBadge, Sparkline } from "@/components/lmc/PriceTicker";
import { useLivePrice, generateHistory, formatINR } from "@/lib/lmc-market";

export const Route = createFileRoute("/trade")({
  component: Trade,
  head: () => ({ meta: [{ title: "Trade · LM Coin" }, { name: "description", content: "Trade LM Coin with market and limit orders, live charts and an active order book." }] }),
});

const RANGES = ["1H", "1D", "1W", "1M", "ALL"] as const;

function Trade() {
  const { price, change24h } = useLivePrice();
  const [range, setRange] = useState<typeof RANGES[number]>("1D");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [amount, setAmount] = useState("");
  const [limit, setLimit] = useState("");

  const history = useMemo(() => {
    const map = { "1H": [60, 30], "1D": [120, 300], "1W": [140, 1800], "1M": [160, 10800], ALL: [180, 86400] } as const;
    const [pts, secs] = map[range];
    return generateHistory(pts, secs);
  }, [range]);

  const fee = 0.001;
  const num = parseFloat(amount) || 0;
  const px = orderType === "limit" ? (parseFloat(limit) || price) : price;
  const gross = side === "buy" ? num / px : num * px;
  const feeAmt = gross * fee;
  const net = gross - feeAmt;

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-10 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="card-glass rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">LMC / INR</div>
                  <div className="font-mono tabular-nums text-3xl md:text-4xl font-semibold text-gold-gradient">{formatINR(price, 4)}</div>
                  <div className={`text-sm ${change24h >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
                    {change24h >= 0 ? "▲" : "▼"} {change24h}% <span className="text-muted-foreground">24h</span>
                  </div>
                </div>
              </div>
              <PriceBadge compact />
            </div>
            <div className="mt-6">
              <Sparkline data={history} height={280} />
            </div>
            <div className="mt-4 inline-flex rounded-lg border border-border bg-secondary/40 p-1">
              {RANGES.map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 text-xs rounded-md ${range === r ? "btn-gold font-semibold" : "text-muted-foreground hover:text-foreground"}`}>{r}</button>
              ))}
            </div>
          </div>

          <OrderBook price={price} />
          <TradeHistory />
        </div>

        <aside className="space-y-4">
          <div className="card-glass rounded-2xl p-5">
            <div className="grid grid-cols-2 rounded-lg border border-border overflow-hidden">
              <button onClick={() => setSide("buy")} className={`py-2.5 text-sm font-semibold ${side === "buy" ? "btn-gold" : "text-muted-foreground"}`}>Buy</button>
              <button onClick={() => setSide("sell")} className={`py-2.5 text-sm font-semibold ${side === "sell" ? "btn-gold" : "text-muted-foreground"}`}>Sell</button>
            </div>

            <div className="mt-4 inline-flex rounded-lg border border-border bg-secondary/40 p-1">
              <button onClick={() => setOrderType("market")} className={`px-3 py-1.5 text-xs rounded-md ${orderType === "market" ? "btn-gold font-semibold" : "text-muted-foreground"}`}>Market</button>
              <button onClick={() => setOrderType("limit")} className={`px-3 py-1.5 text-xs rounded-md ${orderType === "limit" ? "btn-gold font-semibold" : "text-muted-foreground"}`}>Limit</button>
            </div>

            <div className="mt-4 space-y-3">
              {orderType === "limit" && (
                <label className="block">
                  <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Limit price (INR)</span>
                  <input value={limit} onChange={(e) => setLimit(e.target.value)} placeholder={price.toFixed(4)}
                    className="w-full rounded-lg bg-background/60 border border-border px-4 py-3 font-mono text-sm outline-none focus:border-[color:var(--gold)]" />
                </label>
              )}
              <label className="block">
                <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                  {side === "buy" ? "Amount (INR)" : "Amount (LMC)"}
                </span>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full rounded-lg bg-background/60 border border-border px-4 py-3 font-mono text-lg outline-none focus:border-[color:var(--gold)]" />
              </label>

              <div className="grid grid-cols-4 gap-2">
                {["25%", "50%", "75%", "MAX"].map((v) => (
                  <button key={v} className="text-xs py-1.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary">{v}</button>
                ))}
              </div>

              <div className="rounded-lg bg-background/60 border border-border p-3 text-sm space-y-1.5">
                <Row k="Price" v={formatINR(px, 4)} />
                <Row k={side === "buy" ? "You receive (LMC)" : "You receive (INR)"} v={net.toFixed(4)} />
                <Row k="Platform fee (0.1%)" v={feeAmt.toFixed(4)} />
              </div>

              <button className={`w-full rounded-lg py-3 text-sm font-semibold ${side === "buy" ? "btn-gold" : "bg-[color:var(--danger)] text-white"}`}>
                {side === "buy" ? "Buy LMC" : "Sell LMC"}
              </button>
              <p className="text-[10px] text-muted-foreground text-center">Simulated order · demo build</p>
            </div>
          </div>

          <div className="card-glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg">Price alerts</h3>
              <button className="text-xs text-[color:var(--gold)]">+ Add</button>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">Above</span><span className="font-mono">₹45.00</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Below</span><span className="font-mono">₹40.00</span></li>
            </ul>
          </div>
        </aside>
      </section>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></div>;
}

function OrderBook({ price }: { price: number }) {
  const asks = Array.from({ length: 6 }, (_, i) => ({ p: price + (i + 1) * 0.05, q: (Math.random() * 200 + 20).toFixed(2) }));
  const bids = Array.from({ length: 6 }, (_, i) => ({ p: price - (i + 1) * 0.05, q: (Math.random() * 200 + 20).toFixed(2) }));
  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-serif text-lg">Order book</h3>
        <span className="text-xs text-muted-foreground">LMC / INR</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-border">
        <div>
          <div className="px-5 py-2 text-[11px] uppercase tracking-widest text-muted-foreground flex justify-between">
            <span>Bid (Buy)</span><span>Qty</span>
          </div>
          {bids.map((b, i) => (
            <div key={i} className="px-5 py-1.5 flex justify-between text-sm font-mono">
              <span className="text-[color:var(--success)]">{b.p.toFixed(4)}</span>
              <span className="text-muted-foreground">{b.q}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="px-5 py-2 text-[11px] uppercase tracking-widest text-muted-foreground flex justify-between">
            <span>Ask (Sell)</span><span>Qty</span>
          </div>
          {asks.map((a, i) => (
            <div key={i} className="px-5 py-1.5 flex justify-between text-sm font-mono">
              <span className="text-[color:var(--danger)]">{a.p.toFixed(4)}</span>
              <span className="text-muted-foreground">{a.q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TradeHistory() {
  const rows = [
    { side: "Buy", qty: 12.5, price: 42.71, time: "09:41:22" },
    { side: "Sell", qty: 4.2, price: 42.70, time: "09:41:10" },
    { side: "Buy", qty: 80.0, price: 42.72, time: "09:40:58" },
    { side: "Buy", qty: 3.6, price: 42.72, time: "09:40:44" },
    { side: "Sell", qty: 22.9, price: 42.69, time: "09:40:31" },
  ];
  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border"><h3 className="font-serif text-lg">Recent trades</h3></div>
      <div className="grid grid-cols-4 px-5 py-2 text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
        <div>Side</div><div>Qty</div><div>Price</div><div className="text-right">Time</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-4 px-5 py-2 text-sm font-mono">
          <div className={r.side === "Buy" ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}>{r.side}</div>
          <div>{r.qty}</div>
          <div>{r.price.toFixed(4)}</div>
          <div className="text-right text-muted-foreground">{r.time}</div>
        </div>
      ))}
    </div>
  );
}
