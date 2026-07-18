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
  Edit2, // NEW ICON
  X, // NEW ICON
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
          <button onClick={signOut} className="text-muted-foreground" aria-label="Sign out">
            <LogOut size={20} />
          </button>
        }
      />
      <div className="px-4 pt-4 space-y-4">
        {/* Profile Info */}
        <div className="rounded-2xl card-flat p-4 flex items-center gap-3">
          {/* Profile Picture / Avatar */}
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile Avatar"
              className="h-12 w-12 rounded-full object-cover bg-secondary border border-border"
            />
          ) : (
            <span
              className="grid place-items-center h-12 w-12 rounded-full font-bold text-lg"
              style={{ background: "var(--gold-soft)" }}
            >
              {(profile?.display_name ?? profile?.email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}

          {/* Name & Email Details */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{profile?.display_name ?? "—"}</div>
            <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
          </div>

          {/* Edit Button & KYC Wrapper aligned to right side */}
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={handleEditClick}
              className="p-1.5 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
              aria-label="Edit Profile"
            >
              <Edit2 size={16} />
            </button>
            <span
              className={`text-[11px] rounded-full px-2 py-0.5 ${
                profile?.kyc_status === "verified"
                  ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              KYC: {profile?.kyc_status ?? "unverified"}
            </span>
          </div>
        </div>

        {/* NEW SETTINGS & MENU BUTTONS */}
        <div className="rounded-2xl card-flat overflow-hidden">
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
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-secondary/50 transition-colors ${
                idx !== 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/50" />
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div>
          <div className="px-1 pb-2 text-base font-bold">Transactions</div>
          <div className="rounded-2xl card-flat overflow-hidden">
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
                  className={`px-4 py-3 flex items-center gap-3 ${i === 0 ? "" : "border-t border-border"}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{TYPE_LABEL[t.type] ?? t.type}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{amt}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">{t.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={signOut}
          className="w-full rounded-xl btn-soft py-3 text-sm font-semibold flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-5 space-y-5 border border-border shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h2 className="text-lg font-bold">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Display Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-background rounded-xl px-4 py-3 text-sm outline-none border border-border focus:border-[color:var(--gold-soft)]"
              />
            </div>

            {/* Avatar Selection Grid */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Choose Avatar</label>
              <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-1 scrollbar-hide">
                {AVATARS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar ${idx + 1}`}
                    onClick={() => setEditAvatar(url)}
                    className={`h-12 w-12 rounded-full cursor-pointer object-cover transition-all ${
                      editAvatar === url
                        ? "ring-2 ring-[color:var(--gold-soft)] ring-offset-2 ring-offset-background scale-110"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 text-black transition-opacity disabled:opacity-50"
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
