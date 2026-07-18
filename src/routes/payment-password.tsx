import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
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

  // 4-Digit PIN states (Arrays to hold 4 individual digits)
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [recoveryHint, setRecoveryHint] = useState("");

  // Refs for auto-focusing next/previous inputs
  const newPinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Toggle password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Handle Input Change for PIN boxes
  const handlePinChange = (index: number, value: string, isConfirm: boolean) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newVal = value.slice(-1); // Take only the last typed character
    const currentPin = isConfirm ? [...confirmPin] : [...newPin];
    const setPin = isConfirm ? setConfirmPin : setNewPin;
    const refs = isConfirm ? confirmPinRefs : newPinRefs;

    currentPin[index] = newVal;
    setPin(currentPin);

    // Auto-focus next input if a number is entered
    if (newVal !== "" && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace for auto-focusing previous input
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, isConfirm: boolean) => {
    const currentPin = isConfirm ? confirmPin : newPin;
    const refs = isConfirm ? confirmPinRefs : newPinRefs;

    if (e.key === "Backspace" && currentPin[index] === "" && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pin1 = newPin.join("");
    const pin2 = confirmPin.join("");

    if (pin1.length < 4) {
      alert("Please enter a 4-digit PIN.");
      return;
    }

    if (pin1 !== pin2) {
      alert("PINs do not match!");
      return;
    }

    console.log({
      paymentPin: pin1,
      recoveryHint,
    });

    alert("Payment PIN set successfully!");
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
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground drop-shadow-md">Create 4-Digit PIN</h3>
                <p className="text-xs text-muted-foreground">Set a secure PIN for your transactions.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-[color:var(--gold-soft)] transition-colors"
                aria-label="Toggle visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* New 4-Digit PIN */}
            <div className="group">
              <label className="text-sm font-bold mb-3 block text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors flex items-center gap-1.5">
                <KeyRound size={14} /> New PIN
              </label>
              <div className="flex justify-between gap-3">
                {newPin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (newPinRefs.current[idx] = el)}
                    type={showPassword ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value, false)}
                    onKeyDown={(e) => handleKeyDown(idx, e, false)}
                    required
                    className="w-[3.25rem] h-[3.5rem] sm:w-14 sm:h-16 text-center text-2xl font-bold outline-none rounded-2xl bg-white/70 dark:bg-gray-800/80 border-2 border-gray-300/80 dark:border-gray-500/50 shadow-sm focus:border-[color:var(--gold-soft)] focus:bg-white/90 dark:focus:bg-gray-800 focus:shadow-[0_0_20px_rgba(255,215,0,0.3)] text-black dark:text-white transition-all duration-300"
                  />
                ))}
              </div>
            </div>

            {/* Confirm 4-Digit PIN */}
            <div className="group">
              <label className="text-sm font-bold mb-3 block text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors flex items-center gap-1.5">
                <KeyRound size={14} /> Confirm New PIN
              </label>
              <div className="flex justify-between gap-3">
                {confirmPin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (confirmPinRefs.current[idx] = el)}
                    type={showPassword ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value, true)}
                    onKeyDown={(e) => handleKeyDown(idx, e, true)}
                    required
                    className="w-[3.25rem] h-[3.5rem] sm:w-14 sm:h-16 text-center text-2xl font-bold outline-none rounded-2xl bg-white/70 dark:bg-gray-800/80 border-2 border-gray-300/80 dark:border-gray-500/50 shadow-sm focus:border-[color:var(--gold-soft)] focus:bg-white/90 dark:focus:bg-gray-800 focus:shadow-[0_0_20px_rgba(255,215,0,0.3)] text-black dark:text-white transition-all duration-300"
                  />
                ))}
              </div>

              {/* Error Message if PINs don't match */}
              {confirmPin.join("").length === 4 && newPin.join("") !== confirmPin.join("") && (
                <p className="text-red-500 text-xs mt-3 ml-1 animate-pulse font-medium">PINs do not match!</p>
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
                placeholder="e.g. 1999 or Birth year"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none bg-white/70 dark:bg-gray-800/80 border-2 border-gray-300/80 dark:border-gray-500/50 shadow-sm focus:border-[color:var(--gold-soft)] focus:bg-white/90 dark:focus:bg-gray-800 focus:shadow-[0_0_20px_rgba(255,215,0,0.3)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
              />
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-extrabold flex justify-center items-center gap-2 text-black transition-all duration-300 shadow-[0_4px_15px_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,255,0,0.5)] hover:-translate-y-1 active:translate-y-0 text-base"
            style={{ background: "var(--gold-soft)" }}
          >
            <Save size={20} /> Save PIN
          </button>
        </form>
      </div>
    </Shell>
  );
}
