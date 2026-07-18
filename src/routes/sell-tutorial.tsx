import { createFileRoute } from "@tanstack/react-router";
import { Shell, AppHeader } from "@/components/lmc/Shell";

export const Route = createFileRoute("/sell-tutorial")({
  component: SellTutorial,
  head: () => ({
    meta: [{ title: "Sell Tutorial · LM Coin" }],
  }),
});

function SellTutorial() {
  return (
    <Shell>
      <AppHeader title="Sell Tutorial" />
      
      <div className="p-4 space-y-6 text-foreground relative z-10 pb-8">
        
        {/* Main Content Section */}
        <div className="p-5 rounded-3xl backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
          <h3 className="font-bold text-xl mb-3" style={{ color: "var(--gold-soft)" }}>
            Introduction
          </h3>
          <p className="mb-4 text-sm opacity-90 leading-relaxed font-medium">
            Uses blockchain algorithms to match buyers and sellers.
          </p>
          <p className="mb-4 text-sm opacity-90 leading-relaxed font-medium">
            As a seller, after the buyer transfers the funds to you via UPI, please check your account carefully. Once you confirm that the transfer has been received and the amount is correct, click 【Confirm Receipt】 in the order details. The system will then automatically release ARB to the buyer.
          </p>
          
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-500 dark:text-red-400 font-medium">
            <span className="mr-2">⚠️</span> 
            Please do not maliciously refuse or delay clicking 【Confirm Receipt】 after receiving payment. Otherwise, your account may be restricted or suspended by the platform.
          </div>
        </div>
        
      </div>
    </Shell>
  );
}
