import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { ArrowLeft, Lock, KeyRound, Save, HelpCircle, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/payment-password")({
  component: PaymentPassword,
  head: () => ({
    meta: [{ title: "Payment Password · LM Coin" }],
  }),
});

function PaymentPassword() {
  const nav = useNavigate();

  // Form states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryHint, setRecoveryHint] = useState("");

  // Toggle password visibility state
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    console.log({
      newPassword,
      recoveryHint,
    });
    
    alert("Payment Password set successfully!");
    nav({ to: "/dashboard" });
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
        title="Payment Password"
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

      <div className="px-4 pt-6 pb-12 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <section className="glass-card p-6 rounded-[2rem] bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] space-y-6">
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[color:var(--gold-soft)]/20 flex items-center justify-center text-[color:var(--gold-soft)] shadow-inner">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground drop-shadow-md">Create Password</h3>
                <p className="text-xs text-muted-foreground">Set a secure password for your transactions.</p>
              </div>
            </div>

            {/* New Password */}
            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors flex items-center gap-1.5">
                <KeyRound size={14} /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full rounded-2xl px-4 py-3.5 pr-12 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/30 focus:shadow-[0_0_20px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[color:var(--gold-soft)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors flex items-center gap-1.5">
                <KeyRound size={14} /> Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full rounded-2xl px-4 py-3.5 pr-12 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/30 focus:shadow-[0_0_20px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-xs mt-2 ml-1 animate-pulse font-medium">
                  Passwords do not match!
                </p>
              )}
            </div>

            {/* Recovery Hint */}
            <div className="group pt-2">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors flex items-center gap-1.5">
                <HelpCircle size={14} /> Recovery Hint (Optional)
              </label>
              <input
                type="text"
                value={recoveryHint}
                onChange={(e) => setRecoveryHint(e.target.value)}
                placeholder="e.g. Name of my first pet"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/30 focus:shadow-[0_0_20px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
              />
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-extrabold flex justify-center items-center gap-2 text-black transition-all duration-300 shadow-[0_4px_15px_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,255,0,0.5)] hover:-translate-y-1 active:translate-y-0 text-base"
            style={{ background: "var(--gold-soft)" }}
          >
            <Save size={20} /> Save Password
          </button>
        </form>
      </div>
    </Shell>
  );
}
