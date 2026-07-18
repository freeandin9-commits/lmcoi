import { createFileRoute } from "@tanstack/react-router";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { Info, BookOpen, AlertCircle, FileText } from "lucide-react";

export const Route = createFileRoute("/user-notice")({
  component: UserNotice,
  head: () => ({
    meta: [{ title: "User Notice · LM Coin" }],
  }),
});

function UserNotice() {
  return (
    <Shell>
      <AppHeader title="User Notice" />
      
      <div className="p-4 space-y-6 text-foreground relative z-10 pb-10">
        
        {/* User Instruction Block */}
        <div className="text-center space-y-2 mt-2">
          <h2 className="text-2xl font-extrabold drop-shadow-md">User Instruction</h2>
          <p className="text-muted-foreground text-sm font-medium">Quickly learn how to play.</p>
        </div>

        {/* Introduction Section */}
        <div className="p-5 rounded-3xl backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
          <div className="flex items-center gap-2 mb-3">
            <Info size={20} style={{ color: "var(--gold-soft)" }} />
            <h3 className="font-bold text-lg" style={{ color: "var(--gold-soft)" }}>
              Introduction
            </h3>
          </div>
          <p className="mb-3 text-sm opacity-90 leading-relaxed font-medium">
            LM Wallet is a trading platform developed based on the C2C principle. The trading model involves users buying and selling among each other in a hall-like environment, rather than a recharge mode.
          </p>
          <p className="text-sm opacity-90 leading-relaxed font-medium">
            LMC serves as the sole currency on the LM Wallet trading platform, with an exchange rate of 1:1.25 with legal currency. Users can use legal currency.
          </p>
        </div>

        {/* Process Section */}
        <div className="p-5 rounded-3xl backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} style={{ color: "var(--gold-soft)" }} />
            <h3 className="font-bold text-lg" style={{ color: "var(--gold-soft)" }}>
              Process
            </h3>
          </div>
          <div className="space-y-3">
            {[
              "Activate LC Wallet",
              "Buy LMC",
              "Recharge to merchant platform",
              "Withdrawal from Merchant to LMC",
              "Sell LMC on LM Wallet",
              "Buyer payment",
              "Payment received",
              "Confirmation of receipt",
              "Transition complete",
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10">
                <span className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-black/20 dark:bg-black/50 text-[color:var(--gold-soft)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rules Section */}
        <div className="p-5 rounded-3xl backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={20} style={{ color: "var(--gold-soft)" }} />
            <h3 className="font-bold text-lg" style={{ color: "var(--gold-soft)" }}>
              Rules
            </h3>
          </div>
          <p className="mb-5 text-sm opacity-90 leading-relaxed font-medium">
            During the transaction process, there are also some important notes. Please make sure to read them carefully:
          </p>
          
          <div className="space-y-4">
            {/* Rule 01 */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[color:var(--gold-soft)]">01.</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                In order to ensure the security of transactions between members, the platform adopts real-name user authentication, and the authentication information cannot be modified for lifetime. Every user must strictly adhere to the regulations and activate their own personal identity information, UPI information, etc.
              </p>
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-600 dark:text-orange-400 font-medium">
                The buyer must use their own identity information's UPI for payment. If a third-party UPI account is used for payment, the seller has the right to refuse to confirm receipt.
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                The user is responsible for any losses happen due to incorrect information provided by themselves, and the platform bears no responsibility.
              </p>
            </div>

            {/* Rule 02 */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="font-bold text-sm text-[color:var(--gold-soft)]">02.</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                To ensure the security of seller information, buyers must only confirm orders when necessary. If malicious order is found, and users lock seller quotas without making payment, the platform will automatically freeze the account.
              </p>
            </div>

            {/* Rule 03 */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="font-bold text-sm text-[color:var(--gold-soft)]">03.</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                When buying or selling LM coins, both parties must complete the order within the specified time frame. Failure to confirm the transaction for a long time will cause the system to automatically determine the transition completed or canceled. The platform does not bear any responsibility for such cases.
              </p>
              <p className="text-sm opacity-90 leading-relaxed">
                Members must monitor transactions in real-time when buying or selling LMC. If they have any objections, they can appeal in time to avoid financial losses. The appealed order will be temporarily suspended, and handed it over to platform customer service for investigation.
              </p>
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-600 dark:text-blue-400 font-medium">
                <AlertCircle size={16} className="min-w-fit" />
                <span>Reminder again: Always pay attention to order changes during the trading process.</span>
              </div>
            </div>

            {/* Rule 04 */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="font-bold text-sm text-[color:var(--gold-soft)]">04.</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                When purchasing LMC, buyers should immediately click on 'I have transferred funds' after successful payment, and upload the transfer screenshot for the seller's verification. The seller will ship the goods within the specified time frame. If the seller fails to confirm within the specified time, buyers can submit a complaint to the platform for official customer service judgment.
              </p>
            </div>

            {/* Rule 05 */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="font-bold text-sm text-[color:var(--gold-soft)]">05.</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                When selling LMC, if a buyer places an order to purchase and uploads a transfer screenshot, please confirm whether you have received the payment. If you haven't received payment from the buyer, you can click on 'Appeal' or wait for the system to automatically initiate an appeal due to timeout. LM Wallet official team will investigate this transition.
              </p>
            </div>

            {/* Rule 06 */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="font-bold text-sm text-[color:var(--gold-soft)]">06.</h4>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 dark:text-red-400 font-medium">
                If either party maliciously refuses to confirm receipt of payment during the selling process, intentionally causing inconvenience to the buyer, the platform will freeze the account.
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </Shell>
  );
}
