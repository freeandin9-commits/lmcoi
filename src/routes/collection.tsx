import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { ArrowLeft, Wallet, Landmark, Save, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/collection")({
  component: CollectionDetails,
  head: () => ({
    meta: [{ title: "Collection · LM Coin" }],
  }),
});

function CollectionDetails() {
  const nav = useNavigate();

  // Page/Tab State (UPI യും Bank-ഉം വേർതിരിക്കാൻ)
  const [activePage, setActivePage] = useState<"upi" | "bank">("upi");

  // UPI Details State (Array to hold up to 10 UPI IDs)
  const [upiList, setUpiList] = useState<string[]>([""]);

  // Bank Account Details State (Array to hold up to 5 Bank Accounts)
  const [bankList, setBankList] = useState([{ accountName: "", bankName: "", accountNumber: "", ifsc: "" }]);

  // --- UPI Handlers ---
  const handleAddUpi = () => {
    if (upiList.length < 10) {
      setUpiList([...upiList, ""]);
    }
  };

  const handleRemoveUpi = (index: number) => {
    setUpiList(upiList.filter((_, i) => i !== index));
  };

  const handleUpiChange = (index: number, value: string) => {
    const newList = [...upiList];
    newList[index] = value;
    setUpiList(newList);
  };

  // --- Bank Account Handlers ---
  const handleAddBank = () => {
    if (bankList.length < 5) {
      setBankList([...bankList, { accountName: "", bankName: "", accountNumber: "", ifsc: "" }]);
    }
  };

  const handleRemoveBank = (index: number) => {
    setBankList(bankList.filter((_, i) => i !== index));
  };

  const handleBankChange = (index: number, field: keyof (typeof bankList)[0], value: string) => {
    const newList = [...bankList];
    newList[index] = { ...newList[index], [field]: value };
    setBankList(newList);
  };

  // --- Submit Handler ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      upiDetails: upiList.filter((upi) => upi.trim() !== ""), // ഒഴിഞ്ഞ ഫീൽഡുകൾ ഒഴിവാക്കാൻ
      bankDetails: bankList.filter((bank) => bank.accountNumber.trim() !== ""),
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
        {/* Page Switcher / Tabs */}
        <div className="flex p-1 mb-6 bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
          <button
            type="button"
            onClick={() => setActivePage("upi")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activePage === "upi"
                ? "bg-[color:var(--gold-soft)] text-black shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-white/10"
            }`}
          >
            <Wallet size={16} />
            UPI Details
          </button>
          <button
            type="button"
            onClick={() => setActivePage("bank")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activePage === "bank"
                ? "bg-[color:var(--gold-soft)] text-black shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-white/10"
            }`}
          >
            <Landmark size={16} />
            Bank Details
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* UPI DETAILS SECTION */}
          {activePage === "upi" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <section className="glass-card p-5 rounded-[2rem] bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[color:var(--gold-soft)]/20 flex items-center justify-center text-[color:var(--gold-soft)]">
                      <Wallet size={16} />
                    </div>
                    <h3 className="text-base font-bold text-foreground drop-shadow-md">UPI Details</h3>
                  </div>
                  {upiList.length < 10 && (
                    <button
                      type="button"
                      onClick={handleAddUpi}
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 hover:bg-[color:var(--gold-soft)] hover:text-black text-foreground transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add UPI
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {upiList.map((upi, index) => (
                    <div key={index} className="group">
                      <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
                        UPI ID {index + 1} {index === 0 ? "(Primary)" : ""}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={upi}
                          onChange={(e) => handleUpiChange(index, e.target.value)}
                          placeholder="example@upi"
                          className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/30 focus:shadow-[0_0_20px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
                        />
                        {upiList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveUpi(index)}
                            className="p-3.5 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
                            aria-label="Remove UPI"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-center text-gray-500 pt-2">{upiList.length}/10 UPI IDs added</p>
                </div>
              </section>
            </div>
          )}

          {/* BANK ACCOUNT DETAILS SECTION */}
          {activePage === "bank" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Bank Accounts ({bankList.length}/5)
                </h3>
                {bankList.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddBank}
                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 hover:bg-[color:var(--gold-soft)] hover:text-black text-foreground transition-colors flex items-center gap-1 border border-white/10"
                  >
                    <Plus size={14} /> Add Bank
                  </button>
                )}
              </div>

              {bankList.map((bank, index) => (
                <section
                  key={index}
                  className="glass-card p-5 rounded-[2rem] space-y-5 bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[color:var(--gold-soft)]/20 flex items-center justify-center text-[color:var(--gold-soft)]">
                        <Landmark size={16} />
                      </div>
                      <h3 className="text-base font-bold text-foreground drop-shadow-md">
                        Account {index + 1} {index === 0 ? "(Primary)" : ""}
                      </h3>
                    </div>
                    {bankList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBank(index)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        aria-label="Remove Bank Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="group">
                    <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bank.accountName}
                      onChange={(e) => handleBankChange(index, "accountName", e.target.value)}
                      placeholder="Name as per bank record"
                      className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] text-black dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div className="group">
                    <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200">Bank Name</label>
                    <input
                      type="text"
                      value={bank.bankName}
                      onChange={(e) => handleBankChange(index, "bankName", e.target.value)}
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
                      value={bank.accountNumber}
                      onChange={(e) => handleBankChange(index, "accountNumber", e.target.value)}
                      placeholder="Enter account number"
                      className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] text-black dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div className="group">
                    <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200">IFSC Code</label>
                    <input
                      type="text"
                      value={bank.ifsc}
                      onChange={(e) => handleBankChange(index, "ifsc", e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0001234"
                      className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] text-black dark:text-white uppercase transition-all duration-300"
                    />
                  </div>
                </section>
              ))}
            </div>
          )}

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
