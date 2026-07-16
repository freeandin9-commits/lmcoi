import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { RefreshCw } from "lucide-react";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function genCode(len = 5) {
  let out = "";
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

function draw(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  // background
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(0, 0, w, h);
  // noise lines
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(180,${100 + Math.random() * 100},0,0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.lineTo(Math.random() * w, Math.random() * h);
    ctx.stroke();
  }
  // dots
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(120,80,0,${Math.random()})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
  // characters
  const step = w / (code.length + 1);
  for (let i = 0; i < code.length; i++) {
    const x = step * (i + 1);
    const y = h / 2 + (Math.random() - 0.5) * 8;
    const angle = (Math.random() - 0.5) * 0.6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `bold ${22 + Math.random() * 6}px monospace`;
    ctx.fillStyle = `hsl(${Math.random() * 60 + 20}, 80%, 30%)`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }
}

export type CaptchaHandle = {
  verify: (value: string) => boolean;
  refresh: () => void;
};

export const Captcha = forwardRef<CaptchaHandle, { value: string; onChange: (v: string) => void }>(
  ({ value, onChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [code, setCode] = useState(() => genCode());

    useEffect(() => {
      if (canvasRef.current) draw(canvasRef.current, code);
    }, [code]);

    const refresh = () => {
      setCode(genCode());
      onChange("");
    };

    useImperativeHandle(ref, () => ({
      verify: (v: string) => v.trim().toUpperCase() === code,
      refresh,
    }));

    return (
      <div>
        <label className="text-sm font-medium">Security check</label>
        <div className="mt-2 flex items-center gap-2">
          <canvas
            ref={canvasRef}
            width={140}
            height={48}
            className="rounded-lg border border-border select-none"
          />
          <button
            type="button"
            onClick={refresh}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition"
            aria-label="Refresh captcha"
          >
            <RefreshCw size={16} />
          </button>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder="Enter code"
            maxLength={6}
            required
            className="flex-1 rounded-xl bg-secondary px-4 py-3 outline-none text-sm tracking-widest uppercase focus:ring-2 focus:ring-[color:var(--gold)]/50"
          />
        </div>
      </div>
    );
  },
);
Captcha.displayName = "Captcha";
