import { createFileRoute } from "@tanstack/react-router";
import { Shell, AppHeader } from "@/components/lmc/Shell";

export const Route = createFileRoute("/buy-tutorial")({
  component: BuyTutorial,
  head: () => ({
    meta: [{ title: "Buy Tutorial · LM Coin" }],
  }),
});

function BuyTutorial() {
  return (
    <Shell>
      <AppHeader title="Buy Tutorial" />
      
      <div className="p-4 space-y-6 text-foreground relative z-10 pb-8">
        
        {/* Regular Member Section */}
        <div className="p-5 rounded-3xl backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
          <h2 className="text-xl font-extrabold mb-4" style={{ color: "var(--gold-soft)" }}>
            1 - Regular Member
          </h2>
          <h3 className="font-bold text-lg mb-2">Introduction</h3>
          <p className="mb-4 text-sm opacity-90 leading-relaxed font-medium">
            Uses blockchain algorithms to match buyers and sellers.
          </p>
          <p className="mb-4 text-sm opacity-90 leading-relaxed font-medium">
            As a buyer, you need to transfer the payment to the seller via UPI. After making the transfer, please wait for the seller to confirm receipt and verify the amount. Once the seller clicks 【Confirm Receipt】, the system will automatically release LMC to your account.
          </p>
          
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-500 dark:text-red-400 font-medium">
            <span className="mr-2">⚠️</span> 
            Please make sure to transfer the exact amount shown in the order and complete the payment on time. Otherwise, you may suffer losses, and the platform will not be responsible for any losses caused by your own actions.
          </div>
        </div>

        {/* VIP Member Section */}
        <div className="p-5 rounded-3xl backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
          <h2 className="text-xl font-extrabold mb-4" style={{ color: "var(--gold-soft)" }}>
            2 - VIP member
          </h2>
          <h3 className="font-bold text-lg mb-2">Introduction</h3>
          <p className="mb-4 text-sm opacity-90 leading-relaxed font-medium">
            Uses blockchain algorithms to match buyers and sellers.
          </p>
          <p className="mb-4 text-sm opacity-90 leading-relaxed font-medium">
            As a buyer, you need to transfer the payment to the seller via UPI. After making the transfer, please wait for the seller to confirm receipt and verify the amount. Once the seller clicks 【Confirm Receipt】, the system will automatically release ARB to your account.
          </p>
          
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-500 dark:text-red-400 font-medium">
            <span className="mr-2">⚠️</span> 
            Please make sure to transfer the exact amount shown in the order and complete the payment on time. Otherwise, you may suffer losses, and the platform will not be responsible for any losses caused by your own actions.
          </div>
        </div>
        
      </div>
    </Shell>
  );
}
