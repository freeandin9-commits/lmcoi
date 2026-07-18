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
      {/* Custom Keyframe Animations for Glassmorphism */}
      <style>{`
        @keyframes glass-fade-in {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes modal-pop {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-glass-1 { animation: glass-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.1s; }
        .animate-glass-2 { animation: glass-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.2s; }
        .animate-glass-3 { animation: glass-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.3s; }
        .animate-glass-4 { animation: glass-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.4s; }
        .animate-modal { animation: modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
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
        {/* Profile Info - Glassmorphism with Animation */}
        <div className="animate-glass-1 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] hover:bg-white/15 transition-all duration-500 ease-in-out group">
          {/* Profile Picture / Avatar */}
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile Avatar"
              className="h-12 w-12 rounded-full object-cover backdrop-blur-md bg-white/20 border border-white/30 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span
              className="grid place-items-center h-12 w-12 rounded-full font-bold text-lg shadow-inner group-hover:scale-105 transition-transform duration-500"
              style={{ background: "var(--gold-soft)" }}
            >
              {(profile?.display_name ?? profile?.email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}

          {/* Name & Email Details */}
          <div className="flex-1 min-w-0 transition-transform duration-300 group-hover:translate-x-1">
            <div className="font-semibold truncate text-foreground drop-shadow-md">{profile?.display_name ?? "—"}</div>
            <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
          </div>

          {/* Edit Button & KYC Wrapper aligned to right side */}
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={handleEditClick}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-12 backdrop-blur-md"
              aria-label="Edit Profile"
            >
              <Edit2 size={16} />
            </button>
            <span
              className={`text-[11px] rounded-full px-2 py-0.5 backdrop-blur-md transition-colors duration-300 ${
                profile?.kyc_status === "verified"
                  ? "bg-[color:var(--success)]/20 text-[color:var(--success)] border border-[color:var(--success)]/30 group-hover:bg-[color:var(--success)]/30"
                  : "bg-white/10 dark:bg-black/30 text-muted-foreground border border-white/10 group-hover:bg-white/20"
              }`}
            >
              KYC: {profile?.kyc_status ?? "unverified"}
            </span>
          </div>
        </div>

        {/* SETTINGS & MENU BUTTONS - Glassmorphism with Animation */}
        <div className="animate-glass-2 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.03)] transition-all duration-500">
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
              className={`group w-full flex items-center justify-between px-4 py-4 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 ease-in-out ${
                idx !== 0 ? "border-t border-white/10 dark:border-white/5" : ""
              }`}
            >
              <div className="flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-300">
                <item.icon
                  size={18}
                  className="text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                />
                <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                  {item.label}
                </span>
              </div>
              <ChevronRight
                size={16}
                className="text-muted-foreground/50 group-hover:text-foreground/80 group-hover:translate-x-1 transition-all duration-300"
              />
            </button>
          ))}
        </div>

        {/* Transactions - Glassmorphism with Animation */}
        <div className="animate-glass-3">
          <div className="px-1 pb-2 text-base font-bold text-foreground/90 drop-shadow-sm">Transactions</div>
          <div className="rounded-2xl overflow-hidden backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.03)] transition-all duration-500">
            {transactions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No transactions yet. Deposit INR and start trading.
              </div>
            )}
            {transactions.map((t, i) => {
              const amt =
                t.type === "buy" || t.type === "sell"
                  ? `${t.type === "buy" ? "+" : "-"}${formatLMC(Number(t.amount_lmc), 4)} LMC`
                  : `${t.type === "deposit" || t.type === "referral" ? "+" : "-"}${formatINR(Number(t.amount_inr), 2)}`;
              return (
                <div
                  key={t.id}
                  className={`group px-4 py-3 flex items-center gap-3 hover:bg-white/15 dark:hover:bg-white/5 transition-all duration-300 ${
                    i === 0 ? "" : "border-t border-white/10 dark:border-white/5"
                  }`}
                >
                  <div className="flex-1 min-w-0 transform group-hover:translate-x-1 transition-transform duration-300">
                    <div className="text-sm font-semibold text-foreground/90 group-hover:text-foreground">
                      {TYPE_LABEL[t.type] ?? t.type}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right transform group-hover:-translate-x-1 transition-transform duration-300">
                    <div className="text-sm font-mono font-medium drop-shadow-sm">{amt}</div>
                    <div className="text-[11px] text-muted-foreground capitalize group-hover:text-foreground/80">
                      {t.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sign Out Button - Glassmorphism with Animation */}
        <button
          onClick={signOut}
          className="animate-glass-4 w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 backdrop-blur-xl bg-white/10 dark:bg-white/5 hover:bg-red-500/20 hover:text-red-500 dark:hover:bg-red-500/20 border border-white/20 hover:border-red-500/50 transition-all duration-400 ease-out shadow-sm text-foreground hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-95"
        >
          <LogOut size={16} className="transition-transform duration-300 group-hover:-translate-x-1" /> Sign out
        </button>
      </div>

      {/* EDIT PROFILE MODAL - Glassmorphism with Pop Animation */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="animate-modal w-full max-w-md rounded-3xl p-6 space-y-5 backdrop-blur-2xl bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]">
            <div className="flex justify-between items-center pb-3 border-b border-white/20 dark:border-white/10">
              <h2 className="text-lg font-bold text-foreground drop-shadow-sm">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-full hover:bg-white/30 dark:hover:bg-white/10 hover:rotate-90 text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Name Input */}
            <div className="group">
              <label className="text-sm font-semibold mb-2 block text-foreground/90 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/20 focus:shadow-[0_0_15px_rgba(255,215,0,0.1)] text-foreground placeholder:text-muted-foreground transition-all duration-300"
              />
            </div>

            {/* Avatar Selection Grid */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-foreground/90 drop-shadow-sm">
                Choose Avatar
              </label>
              <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 scrollbar-hide rounded-xl backdrop-blur-md bg-white/5 dark:bg-white/5 border border-white/10">
                {AVATARS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar ${idx + 1}`}
                    onClick={() => setEditAvatar(url)}
                    className={`h-12 w-12 rounded-full cursor-pointer object-cover transition-all duration-300 ease-out ${
                      editAvatar === url
                        ? "ring-2 ring-[color:var(--gold-soft)] ring-offset-2 ring-offset-transparent scale-110 shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                        : "opacity-70 hover:opacity-100 hover:scale-110 hover:shadow-lg"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 text-black transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] disabled:opacity-50 hover:shadow-[0_6px_20px_rgba(255,215,0,0.4)] hover:-translate-y-1 active:translate-y-0"
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
