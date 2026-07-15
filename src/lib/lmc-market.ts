import { useEffect, useState } from "react";

// Simulated LM Coin market — client-side only. Deterministic-ish random walk
// seeded off a base price. Replace with a real backend later.

const BASE = 42.75; // INR
const START_TS = Date.now();

function priceAt(t: number): number {
  const s = (t - START_TS) / 1000;
  const wave =
    Math.sin(s / 37) * 1.6 +
    Math.sin(s / 11) * 0.6 +
    Math.sin(s / 3.2) * 0.18 +
    Math.cos(s / 73) * 2.1;
  return +(BASE + wave).toFixed(4);
}

export function generateHistory(points = 120, spacingSec = 30): { t: number; p: number }[] {
  const now = Date.now();
  const arr: { t: number; p: number }[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const t = now - i * spacingSec * 1000;
    arr.push({ t, p: priceAt(t) });
  }
  return arr;
}

export function useLivePrice(intervalMs = 1500) {
  const [price, setPrice] = useState<number>(() => priceAt(Date.now()));
  const [prev, setPrev] = useState<number>(price);
  useEffect(() => {
    const id = setInterval(() => {
      setPrev((p) => p);
      setPrice((old) => {
        setPrev(old);
        return priceAt(Date.now());
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  const change24h = +((price - BASE) / BASE * 100).toFixed(2);
  return { price, prev, change24h };
}

export const MARKET_STATS = {
  symbol: "LMC",
  name: "LM Coin",
  marketCap: 128_450_000,
  volume24h: 3_842_100,
  circulating: 3_000_000,
  totalSupply: 10_000_000,
};

export const TOP_MOVERS = [
  { symbol: "LMC", name: "LM Coin", change: 6.42, price: 42.75 },
  { symbol: "BTC", name: "Bitcoin", change: 2.11, price: 7_412_000 },
  { symbol: "ETH", name: "Ethereum", change: 3.44, price: 312_400 },
  { symbol: "SOL", name: "Solana", change: -1.08, price: 18_640 },
  { symbol: "MATIC", name: "Polygon", change: 4.72, price: 82.15 },
];

export const ANNOUNCEMENTS = [
  { date: "2026-07-12", title: "LMC listed on primary INR order book", tag: "Listing" },
  { date: "2026-07-08", title: "Referral rewards boosted to 25% for July", tag: "Rewards" },
  { date: "2026-07-01", title: "New security: device management + 2FA rollout", tag: "Security" },
];

export function formatINR(n: number, digits = 2): string {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
export function formatCompact(n: number): string {
  return "₹" + Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}
