import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { ArrowLeft, Send } from "lucide-react";

export const Route = createFileRoute("/my-appeal")({
  component: MyAppeal,
});

function MyAppeal() {
  const nav = useNavigate();
  const [type, setType] = useState<"Sell" | "Buy">("Buy");
  const [amount, setAmount] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [orderId, setOrderId] = useState("");

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
          {/* Type: Buy or Sell */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm">Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType("Buy")}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all duration-300 border ${
                  type === "Buy"
                    ? "bg-[color:var(--success)] text-white border-transparent shadow-[0_4px_15px_rgba(var(--success),0.4)]"
                    : "bg-white/10 dark:bg-white/5 border-white/20 text-foreground hover:bg-white/20"
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setType("Sell")}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all duration-300 border ${
                  type === "Sell"
                    ? "bg-red-500 text-white border-transparent shadow-[0_4px_15px_rgba(239,68,68,0.4)]"
                    : "bg-white/10 dark:bg-white/5 border-white/20 text-foreground hover:bg-white/20"
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2 group">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">Amount</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:shadow-[0_0_15px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
            />
          </div>

          {/* UTR Number */}
          <div className="space-y-2 group">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">UTR Number</label>
            <input
              type="text"
              required
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="Enter UTR transaction number"
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:shadow-[0_0_15px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
            />
          </div>

          {/* Date and Time */}
          <div className="space-y-2 group">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">Date and Time</label>
            <input
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:shadow-[0_0_15px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
            />
          </div>

          {/* Order ID */}
          <div className="space-y-2 group">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">Order ID</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID"
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:shadow-[0_0_15px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
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
