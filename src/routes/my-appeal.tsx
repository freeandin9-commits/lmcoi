import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { ArrowLeft, Send } from "lucide-react";
import { useTransactions } from "@/lib/lmc-api"; // Added import

export const Route = createFileRoute("/my-appeal")({
  component: MyAppeal,
});

function MyAppeal() {
  const nav = useNavigate();
  // Fetch transactions to populate the dropdown
  const { transactions } = useTransactions(50);

  const [type, setType] = useState<"Sell" | "Buy">("Buy");
  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [orderId, setOrderId] = useState("");

  const handleOrderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setOrderId(selectedId);

    // Find the selected transaction from the fetched data
    const selectedTx = transactions.find((t: any) => t.id === selectedId);

    if (selectedTx) {
      // 1. Auto-fill Type
      if (selectedTx.type.toLowerCase() === "buy") setType("Buy");
      else if (selectedTx.type.toLowerCase() === "sell") setType("Sell");

      // 2. Auto-fill Amount (checking if lmc or inr exists)
      const txAmount =
        selectedTx.type.toLowerCase() === "buy" || selectedTx.type.toLowerCase() === "sell"
          ? selectedTx.amount_lmc
          : selectedTx.amount_inr;
      setAmount(txAmount?.toString() || "");

      // 3. Auto-fill UTR Number
      // (Assuming your database returns utr_number or utr. Added fallback "N/A" if empty)
      setUtrNumber((selectedTx as any).utr_number || (selectedTx as any).utr || "N/A");

      // 4. Auto-fill Date and Time
      if (selectedTx.created_at) {
        const date = new Date(selectedTx.created_at);
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
        setDateTime(localISOTime);
      }
    } else {
      // Reset if nothing is selected
      setType("Buy");
      setAmount("");
      setUtrNumber("");
      setDateTime("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can handle the form submission logic to your backend/Supabase
    console.log({ type, amount, utrNumber, dateTime, orderId });
    alert("Appeal submitted successfully!");
    nav({ to: "/dashboard" });
  };

  return (
    <Shell>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          z-index: 0;
          opacity: 0.4;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Background blobs for consistent styling */}
      <div className="bg-blob w-64 h-64 bg-blue-500/30 top-10 right-[-10%]"></div>
      <div className="bg-blob w-72 h-72 bg-purple-500/20 bottom-20 left-[-10%]" style={{ animationDelay: "2s" }}></div>

      <AppHeader
        title="My Appeal"
        left={
          <button
            onClick={() => nav({ to: "/dashboard" })}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-all rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </button>
        }
      />

      <div className="px-4 pt-6 pb-8 relative z-10 animate-fade-in">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] p-6 space-y-5 backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]"
        >
          {/* Order ID Selection */}
          <div className="space-y-2 group">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
              Select Order ID
            </label>
            <select
              required
              value={orderId}
              onChange={handleOrderSelect}
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:shadow-[0_0_15px_rgba(255,215,0,0.2)] text-black dark:text-white transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-black">
                -- Choose an Order ID --
              </option>
              {transactions?.map((t: any) => (
                <option key={t.id} value={t.id} className="text-black">
                  {t.id} ({t.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Type: Buy or Sell (Read Only / Disabled) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm">Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                disabled
                className={`flex-1 py-3 rounded-2xl font-bold transition-all duration-300 border cursor-not-allowed ${
                  type === "Buy"
                    ? "bg-[color:var(--success)] text-white border-transparent shadow-[0_4px_15px_rgba(var(--success),0.4)]"
                    : "bg-white/10 dark:bg-white/5 border-white/20 text-foreground opacity-40"
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                disabled
                className={`flex-1 py-3 rounded-2xl font-bold transition-all duration-300 border cursor-not-allowed ${
                  type === "Sell"
                    ? "bg-red-500 text-white border-transparent shadow-[0_4px_15px_rgba(239,68,68,0.4)]"
                    : "bg-white/10 dark:bg-white/5 border-white/20 text-foreground opacity-40"
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Amount (Read Only) */}
          <div className="space-y-2 group">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
              Amount
            </label>
            <input
              type="text"
              required
              readOnly
              value={amount}
              placeholder="Auto-filled"
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/10 text-black dark:text-white/70 placeholder:text-gray-500 transition-all duration-300 cursor-not-allowed opacity-80"
            />
          </div>

          {/* UTR Number (Read Only) */}
          <div className="space-y-2 group">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
              UTR Number
            </label>
            <input
              type="text"
              required
              readOnly
              value={utrNumber}
              placeholder="Auto-filled"
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/10 text-black dark:text-white/70 placeholder:text-gray-500 transition-all duration-300 cursor-not-allowed opacity-80"
            />
          </div>

          {/* Date and Time (Read Only) */}
          <div className="space-y-2 group">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
              Date and Time
            </label>
            <input
              type="datetime-local"
              required
              readOnly
              value={dateTime}
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/10 text-black dark:text-white/70 placeholder:text-gray-500 transition-all duration-300 cursor-not-allowed opacity-80"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-4 rounded-2xl font-extrabold flex justify-center items-center gap-2 text-black transition-all duration-300 shadow-[0_4px_15px_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,255,0,0.5)] hover:-translate-y-1 active:translate-y-0 text-base"
            style={{ background: "var(--gold-soft)" }}
          >
            <Send size={18} /> Submit Appeal
          </button>
        </form>
      </div>
    </Shell>
  );
}
