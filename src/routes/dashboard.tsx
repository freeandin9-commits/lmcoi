import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useTransactions, formatINR, formatLMC } from "@/lib/lmc-api";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut,
  User,
  CreditCard,
  Lock,
  History,
  PlayCircle,
  Settings,
  ChevronRight,
  Bell,
  Gift,
  Users,
  Edit2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Account · LM Coin" },
      { name: "description", content: "Your account, KYC status and transaction history." },
    ],
  }),
});

const TYPE_LABEL: Record<string, string> = {
  buy: "Buy LMC",
  sell: "Sell LMC",
  deposit: "Deposit INR",
  withdraw: "Withdraw INR",
  transfer: "Transfer",
  referral: "Referral reward",
};

// Generate 20 distinct avatar URLs (using DiceBear API for beautiful avatars)
const AVATARS = Array.from({ length: 20 }).map(
  (_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=LMCoinUser${i + 1}`,
);

function Dashboard() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // States for Profile Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const { profile } = useProfile();
  const { transactions } = useTransactions(30);

  const signOut = async () => {
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  // Open Edit Modal and set current values
  const handleEditClick = () => {
    setEditName(profile?.display_name || "");
    // If user has an avatar, use it. Otherwise, default to the first one in the list.
    setEditAvatar(profile?.avatar_url || AVATARS[0]);
    setIsEditing(true);
  };

  // Save profile changes to Supabase
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: editName,
          avatar_url: editAvatar,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Close modal and refresh the page to fetch the updated profile
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Shell>
      {/* Advanced Keyframe Animations for Glassmorphism */}
      <style>{`
        @keyframes glass-fade-in {
          0% { opacity: 0; transform: translateY(20px); backdrop-filter: blur(0px); }
          100% { opacity: 1; transform: translateY(0); backdrop-filter: blur(16px); }
        }
        @keyframes modal-pop {
          0% { opacity: 0; transform: scale(0.85) translateY(15px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float-animation {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-glass-card {
          animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        /* Staggered Delays for Main Sections */
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.25s; }
        .delay-3 { animation-delay: 0.4s; }
        .delay-4 { animation-delay: 0.55s; }

        /* Waterfall Effect for List Items */
        .glass-list-item {
          opacity: 0;
          animation: glass-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-modal { animation: modal-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float-animation 6s ease-in-out infinite; }
      `}</style>

      <AppHeader
        title="Account"
        right={
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Sign out"
          >
            <LogOut size={20} />
          </button>
        }
      />
      <div className="px-4 pt-4 space-y-4 pb-8 relative z-10">
        {/* Profile Info - Glassmorphism with Floating Animation */}
        <div className="animate-glass-card delay-1 animate-float rounded-3xl p-5 flex items-center gap-4 backdrop-blur-xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_0_rgba(255,215,0,0.1)] hover:bg-white/15 transition-all duration-500 ease-out group">
          {/* Profile Picture / Avatar */}
          <div className="relative">
            <div className="absolute inset-0 bg-[color:var(--gold-soft)] blur-md opacity-30 rounded-full group-hover:opacity-60 transition-opacity duration-500"></div>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile Avatar"
                className="relative h-14 w-14 rounded-full object-cover backdrop-blur-md bg-white/20 border-2 border-white/30 group-hover:scale-105 transition-transform duration-500 shadow-lg"
              />
            ) : (
              <span
                className="relative grid place-items-center h-14 w-14 rounded-full font-bold text-xl shadow-inner group-hover:scale-105 transition-transform duration-500 border border-white/20"
                style={{ background: "var(--gold-soft)" }}
              >
                {(profile?.display_name ?? profile?.email ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name & Email Details */}
          <div className="flex-1 min-w-0 transition-transform duration-500 group-hover:translate-x-1">
            <div className="font-bold text-lg text-foreground drop-shadow-md truncate">
              {profile?.display_name ?? "—"}
            </div>
            <div className="text-xs text-muted-foreground/80 truncate font-medium">{profile?.email}</div>
          </div>

          {/* Edit Button & KYC Wrapper aligned to right side */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleEditClick}
              className="p-2 text-muted-foreground hover:text-[color:var(--gold-soft)] hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-12 backdrop-blur-md shadow-sm"
              aria-label="Edit Profile"
            >
              <Edit2 size={16} />
            </button>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider rounded-full px-2.5 py-1 backdrop-blur-md transition-all duration-300 shadow-inner ${
                profile?.kyc_status === "verified"
                  ? "bg-[color:var(--success)]/20 text-[color:var(--success)] border border-[color:var(--success)]/30 group-hover:bg-[color:var(--success)]/30 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  : "bg-white/10 dark:bg-black/30 text-muted-foreground border border-white/10 group-hover:bg-white/20"
              }`}
            >
              {profile?.kyc_status ?? "unverified"}
            </span>
          </div>
        </div>

        {/* SETTINGS & MENU BUTTONS - Glassmorphism with Staggered Animation */}
        <div className="animate-glass-card delay-2 rounded-3xl overflow-hidden backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] transition-all duration-500">
          {[
            { icon: User, label: "Real Name" },
            { icon: CreditCard, label: "Collection" },
            { icon: Lock, label: "Payment Password" },
            { icon: History, label: "Transaction" },
            { icon: PlayCircle, label: "Buy Tutorial" },
            { icon: PlayCircle, label: "Sell Tutorial" },
            { icon: Bell, label: "User Notice" },
            { icon: Gift, label: "Rewards Card" },
            { icon: Users, label: "Team Center" },
            { icon: Settings, label: "Settings" },
          ].map((item, idx) => (
            <button
              key={item.label}
              className={`glass-list-item group w-full flex items-center justify-between px-5 py-4 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 ease-out ${
                idx !== 0 ? "border-t border-white/10 dark:border-white/5" : ""
              }`}
              style={{ animationDelay: `${0.3 + idx * 0.05}s` }} /* Waterfall effect delay */
            >
              <div className="flex items-center gap-4 transform group-hover:translate-x-2 transition-transform duration-300">
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-[color:var(--gold-soft)]/20 transition-colors duration-300">
                  <item.icon
                    size={18}
                    className="text-muted-foreground group-hover:text-[color:var(--gold-soft)] transition-colors duration-300"
                  />
                </div>
                <span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                  {item.label}
                </span>
              </div>
              <ChevronRight
                size={18}
                className="text-muted-foreground/40 group-hover:text-foreground/80 group-hover:translate-x-1 transition-all duration-300"
              />
            </button>
          ))}
        </div>

        {/* Transactions - Glassmorphism with Staggered Animation */}
        <div className="animate-glass-card delay-3">
          <div className="px-2 pb-3 text-sm uppercase tracking-widest font-bold text-foreground/70 drop-shadow-sm flex items-center gap-2">
            <History size={16} /> Recent Transactions
          </div>
          <div className="rounded-3xl overflow-hidden backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] transition-all duration-500">
            {transactions.length === 0 && (
              <div className="px-4 py-10 text-center text-sm font-medium text-muted-foreground">
                No transactions yet. Deposit INR and start trading.
              </div>
            )}
            {transactions.map((t, i) => {
              const amt =
                t.type === "buy" || t.type === "sell"
                  ? `${t.type === "buy" ? "+" : "-"}${formatLMC(Number(t.amount_lmc), 4)} LMC`
                  : `${t.type === "deposit" || t.type === "referral" ? "+" : "-"}${formatINR(Number(t.amount_inr), 2)}`;

              const isPositive = amt.startsWith("+");

              return (
                <div
                  key={t.id}
                  className={`glass-list-item group px-5 py-4 flex items-center gap-3 hover:bg-white/15 dark:hover:bg-white/5 transition-all duration-300 ${
                    i === 0 ? "" : "border-t border-white/10 dark:border-white/5"
                  }`}
                  style={{ animationDelay: `${0.5 + i * 0.08}s` }} /* Waterfall effect delay */
                >
                  <div className="flex-1 min-w-0 transform group-hover:translate-x-1 transition-transform duration-300">
                    <div className="text-sm font-bold text-foreground/90 group-hover:text-foreground">
                      {TYPE_LABEL[t.type] ?? t.type}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(t.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right transform group-hover:-translate-x-1 transition-transform duration-300">
                    <div
                      className={`text-sm font-mono font-bold drop-shadow-sm ${isPositive ? "text-green-500" : "text-foreground"}`}
                    >
                      {amt}
                    </div>
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mt-0.5 group-hover:text-foreground/70">
                      {t.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sign Out Button - Glassmorphism Glow Effect */}
        <button
          onClick={signOut}
          className="animate-glass-card delay-4 w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-xl bg-white/10 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 border border-white/20 hover:border-red-500/40 transition-all duration-400 ease-out shadow-sm text-foreground hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-95"
        >
          <LogOut size={18} className="transition-transform duration-300 group-hover:-translate-x-2" /> Sign out
        </button>
      </div>

      {/* EDIT PROFILE MODAL - Pop & Glow Glassmorphism */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="animate-modal w-full max-w-md rounded-[2rem] p-7 space-y-6 backdrop-blur-2xl bg-white/10 dark:bg-black/40 border border-white/30 dark:border-white/10 shadow-[0_15px_50px_0_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center pb-4 border-b border-white/20 dark:border-white/10">
              <h2 className="text-xl font-bold text-foreground drop-shadow-md">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 hover:rotate-90 text-muted-foreground transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Name Input */}
            <div className="group">
              <label className="text-xs uppercase font-bold tracking-wider mb-2 block text-foreground/80 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl px-5 py-3.5 text-sm font-medium outline-none backdrop-blur-md bg-white/5 dark:bg-black/30 border border-white/20 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/10 focus:shadow-[0_0_20px_rgba(255,215,0,0.15)] text-foreground placeholder:text-muted-foreground/50 transition-all duration-300"
              />
            </div>

            {/* Avatar Selection Grid */}
            <div>
              <label className="text-xs uppercase font-bold tracking-wider mb-3 block text-foreground/80 drop-shadow-sm">
                Choose Avatar
              </label>
              <div className="grid grid-cols-5 gap-3 max-h-52 overflow-y-auto p-3 scrollbar-hide rounded-2xl backdrop-blur-md bg-black/5 dark:bg-white/5 border border-white/10 shadow-inner">
                {AVATARS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar ${idx + 1}`}
                    onClick={() => setEditAvatar(url)}
                    className={`h-12 w-12 rounded-full cursor-pointer object-cover transition-all duration-300 ease-out ${
                      editAvatar === url
                        ? "ring-4 ring-[color:var(--gold-soft)] ring-offset-2 ring-offset-transparent scale-110 shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                        : "opacity-60 hover:opacity-100 hover:scale-110 hover:shadow-lg"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide uppercase flex justify-center items-center gap-2 text-black transition-all duration-300 shadow-[0_5px_15px_rgba(255,215,0,0.3)] disabled:opacity-50 hover:shadow-[0_8px_25px_rgba(255,215,0,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-95"
              style={{ background: "var(--gold-soft)" }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}
