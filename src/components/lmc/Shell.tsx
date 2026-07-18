import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, Receipt, Wallet, Users, User } from "lucide-react";
import logoAsset from "@/assets/lm-coin-logo.png.asset.json";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/transactions", label: "Order", icon: Receipt }, // <-- Changed from "/buy" to "/transactions"
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
    // Main container set to screen height (100dvh for mobile) with overflow-hidden to stop body scroll
    <div className="h-[100dvh] w-full flex justify-center overflow-hidden" style={{ background: "var(--page)" }}>
      {/* മെയിൻ കണ്ടെയ്നറിന് നേരിയ സുതാര്യതയും ഷാഡോയും നൽകി */}
      <div className="relative w-full max-w-[480px] h-full bg-background/80 backdrop-blur-sm shadow-2xl border-x border-white/10 flex flex-col">
        {/* Added overflow-y-auto here so only this section scrolls */}
        <main className={`flex-1 overflow-y-auto ${hideTabs ? "" : "pb-24"}`}>{children}</main>
        {!hideTabs && <BottomNav pathname={pathname} />}
      </div>
    </div>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    // Glassmorphism styling for BottomNav: സുതാര്യമായ ബാക്ക്ഗ്രൗണ്ട്, ബ്ലർ, ബോർഡർ, റൗണ്ടഡ് കോർണേഴ്സ്
    // Changed 'fixed' to 'absolute' to perfectly pin it to the bottom of the relative parent container
    <nav className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[448px] bg-white/5 backdrop-blur-lg border border-white/10 z-40 rounded-2xl shadow-xl overflow-hidden">
      <div className="grid grid-cols-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = pathname === t.to || (t.to !== "/home" && pathname.startsWith(t.to));
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-all duration-300 ${
                active ? "text-[color:var(--foreground)]" : "text-muted-foreground/80 hover:text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-[color:var(--gold)]" : ""} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
      {/* safe-area-inset ഒഴിവാക്കി, പകരം bottom-4 നൽകി ഫ്ലോട്ടിംഗ് ലുക്ക് നൽകി */}
    </nav>
  );
}

export function AppHeader({ title, left, right }: { title: string; left?: ReactNode; right?: ReactNode }) {
  return (
    // Glassmorphism styling for AppHeader: സുതാര്യമായ ബാക്ക്ഗ്രൗണ്ട്, ബ്ലർ, ബോട്ടം ബോർഡർ
    <header className="sticky top-0 z-30 bg-background/40 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <div className="h-16 px-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {left}
          <h1 className="truncate text-xl font-bold tracking-tight">{title}</h1>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </header>
  );
}
