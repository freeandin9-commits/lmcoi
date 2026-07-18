import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, LineChart, Wallet, Users, User } from "lucide-react";
import logoAsset from "@/assets/lm-coin-logo.png.asset.json";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/trade", label: "Order", icon: Receipt },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/referral", label: "Referral", icon: Users },
  { to: "/dashboard", label: "Me", icon: User },
] as const;

export function LMCMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src={logoAsset.url}
      alt="LM Coin"
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

/** Mobile-app phone frame. On desktop we center a phone-width column. */
export function Shell({ children, hideTabs = false }: { children: ReactNode; hideTabs?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "var(--page)" }}>
      <div className="relative w-full max-w-[480px] min-h-screen bg-background shadow-xl border-x border-border flex flex-col">
        <main className={`flex-1 ${hideTabs ? "" : "pb-24"}`}>{children}</main>
        {!hideTabs && <BottomNav pathname={pathname} />}
      </div>
    </div>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background border-t border-border z-40">
      <div className="grid grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = pathname === t.to || (t.to !== "/home" && pathname.startsWith(t.to));
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition ${
                active ? "text-[color:var(--foreground)]" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-[color:var(--gold)]" : ""} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

export function AppHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="h-14 px-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">{title}</h1>
        <div>{right}</div>
      </div>
    </header>
  );
}
