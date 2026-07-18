import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { ArrowLeft, History, ArrowUpRight, ArrowDownLeft, Gift, Copy, Check, Share2, Loader2 } from "lucide-react";
import { useTransactions, formatINR, formatLMC } from "@/lib/lmc-api";
import html2canvas from "html2canvas";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  head: () => ({
    meta: [{ title: "Transactions · LM Coin" }],
  }),
});

function TransactionsPage() {
  const nav = useNavigate();
  const { transactions } = useTransactions(50);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "buy":
      case "deposit":
        return <ArrowDownLeft size={20} className="text-[color:var(--success)]" />;
      case "sell":
      case "withdraw":
        return <ArrowUpRight size={20} className="text-red-500" />;
      case "referral":
        return <Gift size={20} className="text-purple-500" />;
      default:
        return <History size={20} className="text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "buy":
      case "deposit":
        return "text-[color:var(--success)]";
      case "sell":
      case "withdraw":
        return "text-red-500";
      case "referral":
        return "text-purple-500";
      default:
        return "text-foreground";
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (id: string) => {
    if (sharingId) return;
    const element = document.getElementById(`tx-${id}`);
    if (!element) return;

    setSharingId(id);

    try {
      // Temporary remove blur for better capturing
      element.classList.remove("backdrop-blur-md");

      const canvas = await html2canvas(element, {
        backgroundColor: "#0f172a", // Solid background color
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Restore blur
      element.classList.add("backdrop-blur-md");

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1.0);
      });

      if (!blob) throw new Error("Blob generation failed");

      const file = new File([blob], `transaction_${id}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "Transaction", files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transaction_${id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(error);
      alert("ഷെയർ ചെയ്യാൻ സാധിച്ചില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.");
    } finally {
      setSharingId(null);
    }
  };

  return (
    <Shell>
      <AppHeader
        title="Transactions"
        left={
          <button onClick={() => nav({ to: "/dashboard" })} className="p-2 -ml-2 text-muted-foreground">
            <ArrowLeft size={24} />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-12 space-y-4">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-secondary/50 rounded-2xl border border-white/10 mt-6">
            <History size={40} className="mx-auto mb-3 opacity-50" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => {
              const isLmc = t.type === "buy" || t.type === "sell";
              const amountDisplay = isLmc
                ? `${t.type === "buy" ? "+" : "-"}${formatLMC(Number(t.amount_lmc), 4)} LMC`
                : `${t.type === "deposit" || t.type === "referral" ? "+" : "-"}${formatINR(Number(t.amount_inr), 2)}`;

              return (
                <div
                  key={t.id}
                  id={`tx-${t.id}`}
                  className="p-4 rounded-2xl bg-secondary/40 backdrop-blur-md border border-white/10 shadow-sm flex flex-col gap-3 relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                        {getTransactionIcon(t.type)}
                      </div>
                      <div>
                        <div className="font-bold text-base capitalize text-foreground">{t.type}</div>
                        <div className="text-xs text-muted-foreground font-medium mt-0.5">
                          {new Date(t.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-extrabold text-sm font-mono ${getTransactionColor(t.type)}`}>
                        {amountDisplay}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-70">{t.status}</div>
                    </div>
                  </div>

                  <div
                    className="pt-2 mt-1 border-t border-border/50 flex justify-between items-center"
                    data-html2canvas-ignore="true"
                  >
                    <span className="text-[11px] text-muted-foreground font-semibold">Order ID</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-background/50 pl-2 pr-1 py-0.5 rounded-md border border-border">
                        <span className="text-[11px] font-mono text-muted-foreground/80">{t.id}</span>
                        <button
                          onClick={() => handleCopy(t.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {copiedId === t.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <button
                        onClick={() => handleShare(t.id)}
                        disabled={sharingId === t.id}
                        className="p-1.5 bg-background/50 border border-border rounded-md hover:bg-white/10 text-muted-foreground"
                      >
                        {sharingId === t.id ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
