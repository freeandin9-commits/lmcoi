import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { ArrowLeft, Wallet, Landmark, Save } from "lucide-react";

export const Route = createFileRoute("/collection")({
  component: CollectionDetails,
  head: () => ({
    meta: [{ title: "Collection · LM Coin" }],
  }),
});

function CollectionDetails() {
  const nav = useNavigate();

  // UPI Details State
  const [upiId, setUpiId] = useState("");

  // Bank Account Details State
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      upiDetails: { upiId },
      bankDetails: { accountName, bankName, accountNumber, ifsc },
    });
    alert("Collection details saved successfully!");
  };

  return (
    <Shell>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          z-index: 0;
          opacity: 0.4;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }
        .glass-card {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>

      {/* Background Orbs */}
      <div className="bg-blob w-64 h-64 bg-purple-500/30 top-10 left-[-10%]"></div>
      <div className="bg-blob w-72 h-72 bg-blue-500/20 bottom-20 right-[-10%]" style={{ animationDelay: "2s" }}></div>

      <AppHeader
        title="Collection Details"
        left={
          <button
            onClick={() => nav({ to: "/dashboard" })}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        }
      />

      <div className="px-4 pt-6 pb-12 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* UPI DETAILS SECTION */}
          <section className="glass-card p-5 rounded-[2rem] bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[color:var(--gold-soft)]/20 flex items-center justify-center text-[color:var(--gold-soft)]">
                <Wallet size={16} />
              </div>
              <h3 className="text-base font-bold text-foreground drop-shadow-md">UPI Details</h3>
            </div>
            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
                UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/30 focus:shadow-[0_0_20px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
              />
            </div>
          </section>

          {/* BANK ACCOUNT DETAILS SECTION */}
          <section className="glass-card p-5 rounded-[2rem] space-y-5 bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[color:var(--gold-soft)]/20 flex items-center justify-center text-[color:var(--gold-soft)]">
                <Landmark size={16} />
              </div>
              <h3 className="text-base font-bold text-foreground drop-shadow-md">Bank Account</h3>
            </div>

            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Name as per bank record"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] text-black dark:text-white transition-all duration-300"
              />
            </div>

            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. State Bank of India"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] text-black dark:text-white transition-all duration-300"
              />
            </div>

            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200">
                Bank Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] text-black dark:text-white transition-all duration-300"
              />
            </div>

            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200">IFSC Code</label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] text-black dark:text-white uppercase transition-all duration-300"
              />
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-extrabold flex justify-center items-center gap-2 text-black transition-all duration-300 shadow-[0_4px_15px_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,255,0,0.5)] hover:-translate-y-1 active:translate-y-0 text-base"
            style={{ background: "var(--gold-soft)" }}
          >
            <Save size={20} /> Save Collection Details
          </button>
        </form>
      </div>
    </Shell>
  );
}
