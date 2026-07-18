import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { ArrowLeft, History, ArrowUpRight, ArrowDownLeft, Gift } from "lucide-react";
import { useTransactions, formatINR, formatLMC } from "@/lib/lmc-api";

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
                  className="p-4 rounded-2xl bg-secondary/40 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm border border-border">
                        {getTransactionIcon(t.type)}
                      </div>
                      <div>
                        {/* 1. Type: Buy / Sell / Referral */}
                        <div className="font-bold text-base capitalize text-foreground">
                          {t.type}
                        </div>
                        {/* 2. Date and Time */}
                        <div className="text-xs text-muted-foreground font-medium mt-0.5">
                          {new Date(t.created_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: true
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-extrabold text-sm font-mono ${getTransactionColor(t.type)}`}>
                        {amountDisplay}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-70">
                        {t.status}
                      </div>
                    </div>
                  </div>

                  {/* 3. Order ID */}
                  <div className="pt-2 mt-1 border-t border-border/50 flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground font-semibold">Order ID</span>
                    <span className="text-[11px] font-mono text-muted-foreground/80 bg-background/50 px-2 py-0.5 rounded-md border border-border">
                      {t.id}
                    </span>
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
