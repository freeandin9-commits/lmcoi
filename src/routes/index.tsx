import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Shell, LMCMark } from "@/components/lmc/Shell";
import { PriceBadge, Sparkline } from "@/components/lmc/PriceTicker";
import {
  useLivePrice, generateHistory, MARKET_STATS, TOP_MOVERS, ANNOUNCEMENTS,
  formatINR, formatCompact,
} from "@/lib/lmc-market";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "LM Coin — Buy, sell and trade LMC" },
      { name: "description", content: "LM Coin (LMC) is a premium digital asset platform. Buy, sell, trade and earn with a secure INR wallet, real-time prices and referral rewards." },
    ],
  }),
});

function Home() {
  const { price, change24h } = useLivePrice();
  const history = useMemo(() => generateHistory(140, 60), []);
  return (
    <Shell>
      <Hero price={price} change24h={change24h} history={history} />
      <MarketOverview />
      <Movers />
      <FeatureGrid />
      <Announcements />
      <ReferralBanner />
      <DownloadApp />
    </Shell>
  );
}

function Hero({ price, change24h, history }: { price: number; change24h: number; history: { t: number; p: number }[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border card-glass px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" /> Live · LMC / INR
          </span>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[1.02] text-balance">
            The <span className="text-gold-gradient">gold standard</span><br />of digital assets.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Buy, sell and trade LM Coin with an INR wallet, live prices, and institutional-grade security — on the web and in your pocket.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/trade" className="inline-flex items-center rounded-lg btn-gold px-5 py-3 text-sm font-semibold">Buy LMC</Link>
            <Link to="/trade" className="inline-flex items-center rounded-lg border border-border bg-secondary/60 px-5 py-3 text-sm font-medium hover:bg-secondary">Trade now</Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            <Stat label="Market cap" value={formatCompact(MARKET_STATS.marketCap)} />
            <Stat label="24h volume" value={formatCompact(MARKET_STATS.volume24h)} />
            <Stat label="Holders" value="52,318" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 rounded-[2rem] bg-[color:var(--gold)]/10 blur-3xl" aria-hidden />
          <div className="relative card-glass rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LMCMark size={40} />
                <div>
                  <div className="font-serif text-xl">LM Coin</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">LMC / INR</div>
                </div>
              </div>
              <PriceBadge compact />
            </div>
            <div className="mt-5">
              <div className="font-mono tabular-nums text-4xl md:text-5xl font-semibold text-gold-gradient">
                {formatINR(price, 4)}
              </div>
              <div className={`mt-1 text-sm ${change24h >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
                {change24h >= 0 ? "▲" : "▼"} {change24h}% <span className="text-muted-foreground">· last 24h</span>
              </div>
            </div>
            <div className="mt-4">
              <Sparkline data={history} height={140} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/trade" className="rounded-lg btn-gold py-3 text-center text-sm font-semibold">Buy</Link>
              <Link to="/trade" className="rounded-lg border border-border bg-secondary/60 py-3 text-center text-sm font-medium hover:bg-secondary">Sell</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-serif text-2xl">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MarketOverview() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          ["Circulating", MARKET_STATS.circulating.toLocaleString("en-IN") + " LMC"],
          ["Total supply", MARKET_STATS.totalSupply.toLocaleString("en-IN") + " LMC"],
          ["24h high", "₹44.36"],
          ["24h low", "₹40.92"],
        ].map(([l, v]) => (
          <div key={l}>
            <div className="font-serif text-lg">{v}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Movers() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Market</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">Top movers</h2>
        </div>
        <Link to="/trade" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
      </div>
      <div className="rounded-2xl card-glass overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
          <div className="col-span-6">Asset</div>
          <div className="col-span-3 text-right">Price</div>
          <div className="col-span-3 text-right">24h</div>
        </div>
        {TOP_MOVERS.map((m) => (
          <div key={m.symbol} className="grid grid-cols-12 items-center px-5 py-4 border-b border-border last:border-0">
            <div className="col-span-6 flex items-center gap-3">
              {m.symbol === "LMC" ? <LMCMark size={28} /> : (
                <span className="h-7 w-7 rounded-full bg-secondary grid place-items-center text-[11px] font-mono">{m.symbol[0]}</span>
              )}
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.symbol}</div>
              </div>
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums">{formatINR(m.price, 2)}</div>
            <div className={`col-span-3 text-right font-medium ${m.change >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
              {m.change >= 0 ? "+" : ""}{m.change}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureGrid() {
  const items = [
    { t: "Instant buy & sell", d: "Convert INR ⇄ LMC instantly with transparent fees." },
    { t: "Advanced trading", d: "Market and limit orders with a live order book." },
    { t: "Bank-grade security", d: "2FA, device management, JWT auth and audit logs." },
    { t: "Referral rewards", d: "Earn a share of trading fees when your friends trade." },
    { t: "INR wallet", d: "Deposit and withdraw via bank transfer or UPI." },
    { t: "Mobile ready", d: "The same experience on web, Android and iOS." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="max-w-2xl">
        <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Why LM Coin</span>
        <h2 className="mt-2 font-serif text-3xl md:text-5xl">Everything you need to own LMC.</h2>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((i) => (
          <div key={i.t} className="card-glass rounded-2xl p-6">
            <div className="h-8 w-8 rounded-lg btn-gold grid place-items-center font-serif">✦</div>
            <h3 className="mt-4 font-serif text-xl">{i.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Announcements() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Updates</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">Latest announcements</h2>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {ANNOUNCEMENTS.map((a) => (
          <div key={a.title} className="card-glass rounded-2xl p-6">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded-full bg-[color:var(--gold)]/15 text-[color:var(--gold)] px-2 py-0.5">{a.tag}</span>
              <span className="text-muted-foreground">{a.date}</span>
            </div>
            <p className="mt-3 font-serif text-lg">{a.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReferralBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="relative overflow-hidden rounded-3xl card-glass p-8 md:p-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[color:var(--gold)]/25 blur-3xl" aria-hidden />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Referral rewards</span>
            <h2 className="mt-2 font-serif text-3xl md:text-5xl">Invite friends. Earn <span className="text-gold-gradient">25%</span> of their fees.</h2>
            <p className="mt-3 text-muted-foreground max-w-lg">Share your unique link and earn LMC every time they trade. Payouts credit instantly to your referral wallet.</p>
            <Link to="/referral" className="mt-6 inline-flex items-center rounded-lg btn-gold px-5 py-3 text-sm font-semibold">Get your link</Link>
          </div>
          <div className="justify-self-end w-full max-w-sm">
            <div className="rounded-2xl bg-background/60 border border-border p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Your referral code</div>
              <div className="mt-2 font-mono text-2xl text-gold-gradient">LM-XZ4Q9</div>
              <div className="mt-4 text-xs text-muted-foreground">Earnings this month</div>
              <div className="font-serif text-2xl">₹4,812.50</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DownloadApp() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 text-center">
      <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--gold)]">Mobile</span>
      <h2 className="mt-2 font-serif text-4xl md:text-6xl text-balance">Take LM Coin with you.</h2>
      <p className="mt-4 text-muted-foreground max-w-xl mx-auto">The same experience on Android and iOS — with push alerts, biometric login, and real-time price notifications.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <StoreBtn label="App Store" sub="Download for iOS" />
        <StoreBtn label="Google Play" sub="Get it on Android" />
      </div>
    </section>
  );
}

function StoreBtn({ label, sub }: { label: string; sub: string }) {
  return (
    <a href="#" className="inline-flex items-center gap-3 rounded-xl border border-border bg-secondary/60 hover:bg-secondary px-5 py-3 text-left">
      <span className="h-8 w-8 rounded-lg btn-gold grid place-items-center">↓</span>
      <span>
        <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">{sub}</span>
        <span className="block font-serif text-base">{label}</span>
      </span>
    </a>
  );
}
