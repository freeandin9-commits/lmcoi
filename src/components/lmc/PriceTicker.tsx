import { useLivePrice, formatINR } from "@/lib/lmc-market";

export function PriceBadge({ compact = false }: { compact?: boolean }) {
  const { price, prev, change24h } = useLivePrice();
  const up = price >= prev;
  const pos = change24h >= 0;
  return (
    <div className={`inline-flex items-center gap-3 rounded-full card-glass px-4 py-2 ${compact ? "text-sm" : ""}`}>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">LMC / INR</span>
      <span className={`font-mono tabular-nums font-semibold transition-colors ${up ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
        {formatINR(price, 4)}
      </span>
      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${pos ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--danger)]/15 text-[color:var(--danger)]"}`}>
        {pos ? "+" : ""}{change24h}%
      </span>
    </div>
  );
}

export function Sparkline({ data, height = 72, className = "" }: { data: { t: number; p: number }[]; height?: number; className?: string }) {
  if (data.length < 2) return null;
  const w = 600;
  const h = height;
  const ps = data.map((d) => d.p);
  const min = Math.min(...ps);
  const max = Math.max(...ps);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => `${(i * step).toFixed(2)},${(h - ((d.p - min) / range) * h).toFixed(2)}`);
  const path = "M" + pts.join(" L");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const up = data[data.length - 1].p >= data[0].p;
  const stroke = up ? "var(--success)" : "var(--danger)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full ${className}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
