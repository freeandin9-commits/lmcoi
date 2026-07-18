import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { ArrowLeft, History, ArrowUpRight, ArrowDownLeft, Gift, Copy, Check, Share2 } from "lucide-react";
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
  // Fetching last 50 transactions
  const { transactions } = useTransactions(50);

  // State for tracking copied Order ID
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // 1) Handle Copy Order ID
  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
  };

  // 2) Handle Share as Image
  const handleShare = async (id: string) => {
    const element = document.getElementById(`tx-${id}`);
    if (!element) return;

    try {
      // Create canvas from the specific transaction div
      const canvas = await html2canvas(element, {
        backgroundColor: null, // Keep background transparent/original
        scale: 2, // Better image quality
      });

      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) return;
        const file = new File([blob], `transaction_${id}.png`, { type: "image/png" });

        // Check if browser supports Web Share API with files
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "LM Coin Transaction",
            files: [file],
          });
        } else {
          // Fallback for browsers that don't support file sharing (Downloads the image instead)
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `transaction_${id}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("Error sharing transaction:", error);
    }
  };

  return (
    <Shell>
      <AppHeader
        title="Transactions"
        left={
          <button
            onClick={() => nav({ to: "/dashboard" })}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all"
            aria-label="Go back"
          >
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
              // Format amount based on type
              const isLmc = t.type === "buy" || t.type === "sell";
              const amountDisplay = isLmc
                ? `${t.type === "buy" ? "+" : "-"}${formatLMC(Number(t.amount_lmc), 4)} LMC`
                : `${t.type === "deposit" || t.type === "referral" ? "+" : "-"}${formatINR(Number(t.amount_inr), 2)}`;

              return (
                <div
                  key={t.id}
                  id={`tx-${t.id}`} // Added ID for html2canvas to capture this specific div
                  className="p-4 rounded-2xl bg-secondary/40 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm border border-border">
                        {getTransactionIcon(t.type)}
                      </div>
                      <div>
                        {/* Type: Buy / Sell / Referral */}
                        <div className="font-bold text-base capitalize text-foreground">{t.type}</div>
                        {/* Date and Time */}
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

                  {/* Order ID & Actions (Copy / Share) */}
                  <div className="pt-2 mt-1 border-t border-border/50 flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground font-semibold">Order ID</span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-background/50 pl-2 pr-1 py-0.5 rounded-md border border-border">
                        <span className="text-[11px] font-mono text-muted-foreground/80">{t.id}</span>
                        <button
                          onClick={() => handleCopy(t.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Copy Order ID"
                          data-html2canvas-ignore="true" // Hides copy button from shared image
                        >
                          {copiedId === t.id ? (
                            <Check size={12} className="text-[color:var(--success)]" />
                          ) : (
                            <Copy size={12} className="text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => handleShare(t.id)}
                        className="p-1.5 bg-background/50 border border-border rounded-md hover:bg-white/10 text-muted-foreground transition-all"
                        title="Share Transaction"
                        data-html2canvas-ignore="true" // Hides share button from shared image
                      >
                        <Share2 size={14} />
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
