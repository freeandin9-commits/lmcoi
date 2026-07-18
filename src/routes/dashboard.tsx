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
      // (Or you can use your custom API hook mutation if available)
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
      <AppHeader
        title="Account"
        right={
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={20} />
          </button>
        }
      />
      <div className="px-4 pt-4 space-y-4 pb-8">
        {/* Profile Info - Glassmorphism */}
        <div className="rounded-2xl p-4 flex items-center gap-3 backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
          {/* Profile Picture / Avatar */}
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile Avatar"
              className="h-12 w-12 rounded-full object-cover backdrop-blur-sm bg-white/20 border border-white/30"
            />
          ) : (
            <span
              className="grid place-items-center h-12 w-12 rounded-full font-bold text-lg shadow-inner"
              style={{ background: "var(--gold-soft)" }}
            >
              {(profile?.display_name ?? profile?.email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}

          {/* Name & Email Details */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate text-foreground">{profile?.display_name ?? "—"}</div>
            <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
          </div>

          {/* Edit Button & KYC Wrapper aligned to right side */}
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={handleEditClick}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Edit Profile"
            >
              <Edit2 size={16} />
            </button>
            <span
              className={`text-[11px] rounded-full px-2 py-0.5 backdrop-blur-sm ${
                profile?.kyc_status === "verified"
                  ? "bg-[color:var(--success)]/20 text-[color:var(--success)] border border-[color:var(--success)]/30"
                  : "bg-white/10 dark:bg-black/30 text-muted-foreground border border-white/10"
              }`}
            >
              KYC: {profile?.kyc_status ?? "unverified"}
            </span>
          </div>
        </div>

        {/* SETTINGS & MENU BUTTONS - Glassmorphism */}
        <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
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
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ${
                idx !== 0 ? "border-t border-white/10 dark:border-white/5" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground/90">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/50" />
            </button>
          ))}
        </div>

        {/* Transactions - Glassmorphism */}
        <div>
          <div className="px-1 pb-2 text-base font-bold text-foreground/90 drop-shadow-sm">Transactions</div>
          <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
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
                  className={`px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                    i === 0 ? "" : "border-t border-white/10 dark:border-white/5"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground/90">{TYPE_LABEL[t.type] ?? t.type}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-medium drop-shadow-sm">{amt}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">{t.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sign Out Button - Glassmorphism Base */}
        <button
          onClick={signOut}
          className="w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 backdrop-blur-md bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 transition-all duration-300 shadow-sm text-foreground"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {/* EDIT PROFILE MODAL - Glassmorphism */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 space-y-5 backdrop-blur-xl bg-white/20 dark:bg-black/40 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center pb-3 border-b border-white/20 dark:border-white/10">
              <h2 className="text-lg font-bold text-foreground drop-shadow-sm">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-foreground/90 drop-shadow-sm">Display Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none backdrop-blur-sm bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:ring-1 focus:ring-[color:var(--gold-soft)] text-foreground placeholder:text-muted-foreground transition-all shadow-inner"
              />
            </div>

            {/* Avatar Selection Grid */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-foreground/90 drop-shadow-sm">
                Choose Avatar
              </label>
              <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 scrollbar-hide rounded-xl backdrop-blur-sm bg-white/5 dark:bg-white/5 border border-white/10">
                {AVATARS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar ${idx + 1}`}
                    onClick={() => setEditAvatar(url)}
                    className={`h-12 w-12 rounded-full cursor-pointer object-cover transition-all duration-300 ${
                      editAvatar === url
                        ? "ring-2 ring-[color:var(--gold-soft)] ring-offset-2 ring-offset-transparent scale-110 shadow-lg"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 text-black transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] disabled:opacity-50 hover:scale-[1.02] active:scale-95"
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
