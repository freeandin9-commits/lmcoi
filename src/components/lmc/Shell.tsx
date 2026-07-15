import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/wallet", label: "Wallet" },
  { to: "/trade", label: "Trade" },
  { to: "/referral", label: "Referral" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen">
      <TopBar pathname={pathname} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function TopBar({ pathname }: { pathname: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <LMCMark />
          <span className="font-serif text-lg tracking-tight">
            LM<span className="text-gold-gradient">Coin</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-2 rounded-lg transition ${
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs font-medium hover:bg-secondary"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-lg btn-gold px-3.5 py-2 text-xs font-semibold"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function LMCMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-full font-serif font-semibold"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(140deg, oklch(0.9 0.14 88), oklch(0.62 0.14 78))",
        color: "oklch(0.16 0.012 260)",
        boxShadow: "0 6px 20px -8px oklch(0.75 0.16 82 / 0.55), inset 0 1px 0 oklch(1 0 0 / 0.5)",
        fontSize: size * 0.42,
      }}
    >
      L
    </span>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-8 md:grid-cols-4 text-sm">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <LMCMark />
            <span className="font-serif text-lg">LM Coin</span>
          </div>
          <p className="mt-3 text-muted-foreground max-w-sm">
            A modern digital asset platform. Buy, sell, trade and earn — with security and speed built in.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            LMC is a simulated internal token. Prices shown are demo data.
          </p>
        </div>
        <div>
          <div className="font-medium mb-3">Platform</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/wallet" className="hover:text-foreground">Wallet</Link></li>
            <li><Link to="/trade" className="hover:text-foreground">Trade</Link></li>
            <li><Link to="/referral" className="hover:text-foreground">Referral</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-3">Company</div>
          <ul className="space-y-2 text-muted-foreground">
            <li>Security</li>
            <li>Announcements</li>
            <li>Support</li>
            <li>Terms & Privacy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} LM Coin. All rights reserved.</span>
          <span>Demo build · Not investment advice</span>
        </div>
      </div>
    </footer>
  );
}
