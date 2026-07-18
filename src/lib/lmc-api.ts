import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Wallet = { user_id: string; inr_balance: number; lmc_balance: number; updated_at: string };
export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  referral_code: string;
  referred_by: string | null;
  kyc_status: string;
};
export type Transaction = {
  id: string;
  user_id: string;
  type: "deposit" | "withdraw" | "buy" | "sell" | "transfer" | "referral";
  amount_inr: number;
  amount_lmc: number;
  price: number | null;
  status: "pending" | "completed" | "failed" | "cancelled";
  note: string | null;
  created_at: string;
};
export type Announcement = { id: string; title: string; body: string | null; tag: string; published_at: string };
export type Tick = { t: string; price: number };

export function formatINR(n: number, digits = 2): string {
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
export function formatLMC(n: number, digits = 4): string {
  return Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: digits });
}

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWallet = useCallback(async () => {
    const { data, error } = await supabase.from("wallets").select("*").maybeSingle();
    if (error) throw error;
    setWallet(data as Wallet | null);
    return data as Wallet | null;
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        await refreshWallet();
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();

    const channel = supabase
      .channel("wallet-self")
      .on("postgres_changes", { event: "*", schema: "public", table: "wallets" }, () => {
        void refreshWallet();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [refreshWallet]);

  return { wallet, loading, refreshWallet };
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    supabase.from("profiles").select("*").maybeSingle().then(({ data }) => {
      if (!mounted) return;
      setProfile(data as Profile | null);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);
  return { profile, loading };
}

/** Live price series with realtime updates */
export function usePriceSeries(limit = 120) {
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase
        .from("price_ticks")
        .select("t, price")
        .order("t", { ascending: false })
        .limit(limit);
      if (!mounted) return;
      setTicks(((data ?? []) as Tick[]).slice().reverse());
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("price-ticks")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "price_ticks" }, (payload) => {
        const row = payload.new as Tick;
        setTicks((prev) => [...prev.slice(-(limit - 1)), row]);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const price = ticks.length ? Number(ticks[ticks.length - 1].price) : 0;
  const first = ticks.length ? Number(ticks[0].price) : 0;
  const change = first ? +(((price - first) / first) * 100).toFixed(2) : 0;

  const sparkData = useMemo(
    () => ticks.map((t) => ({ t: new Date(t.t).getTime(), p: Number(t.price) })),
    [ticks],
  );

  return { ticks, sparkData, price, change, loading };
}

export function useTransactions(limit = 20) {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!mounted) return;
      setRows((data ?? []) as Transaction[]);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel("tx-self")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => load())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [limit]);
  return { transactions: rows, loading };
}

export function useAnnouncements() {
  const [rows, setRows] = useState<Announcement[]>([]);
  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setRows((data ?? []) as Announcement[]));
  }, []);
  return rows;
}

export async function placeOrder(side: "buy" | "sell", amountLmc: number, price: number) {
  const { data, error } = await supabase.rpc("place_order", {
    p_side: side,
    p_amount_lmc: amountLmc,
    p_price: price,
  });
  if (error) throw error;
  return data;
}
export async function depositInr(amount: number) {
  const { data, error } = await supabase.rpc("wallet_deposit_inr", { p_amount: amount });
  if (error) throw error;
  return data;
}
export async function withdrawInr(amount: number) {
  const { data, error } = await supabase.rpc("wallet_withdraw_inr", { p_amount: amount });
  if (error) throw error;
  return data;
}
