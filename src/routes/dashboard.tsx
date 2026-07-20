import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/lib/lmc-api";
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
  Trash2,
  FileText,
  // --- പുതുതായി ചേർത്ത ഐക്കണുകൾ (New Features) ---
  Wallet,
  ShieldCheck,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Account · LM Coin" }, { name: "description", content: "Your account and KYC status." }],
  }),
});

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

  // State for Sign Out Confirmation Modal
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // States for Delete Account
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const { profile } = useProfile();

  // Actual Sign Out execution
  const confirmSignOut = async () => {
    setIsSignOutModalOpen(false);
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  // Actual Delete Account execution
  const handleDeleteAccount = async () => {
    const userEmail = profile?.email || user?.email;
    if (deleteEmailInput !== userEmail) return;

    setIsDeleting(true);
    try {
      const { error } = await (supabase.rpc as any)("delete_user_account");
      if (error) console.error("Error deleting account backend:", error);

      await supabase.auth.signOut();
      nav({ to: "/" });
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditClick = () => {
    setEditName(profile?.display_name || "");
    setEditAvatar(profile?.avatar_url || AVATARS[0]);
    setIsEditing(true);
  };

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
      <style>{`
        @keyframes glass-fade-in {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modal-pop {
          0% { opacity: 0; transform: scale(0.85) translateY(15px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        
        .animate-glass-1 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.1s; }
        .animate-glass-2 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.2s; }
        .animate-glass-3 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.3s; }
        .animate-glass-4 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.4s; }
        .animate-modal { animation: modal-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .glass-shine {
          position: relative;
          overflow: hidden;
        }
        .glass-shine::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer 4s infinite;
          pointer-events: none;
          z-index: 10;
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
      `}</style>

      {/* Ambient Background Blobs for Glassmorphism Effect */}
      <div className="bg-blob w-64 h-64 bg-purple-500/30 top-10 left-[-10%]"></div>
      <div className="bg-blob w-72 h-72 bg-blue-500/20 bottom-20 right-[-10%]" style={{ animationDelay: "2s" }}></div>
      <div
        className="bg-blob w-52 h-52 bg-yellow-500/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ animationDelay: "4s" }}
      ></div>

      <AppHeader
        title="Account"
        right={
          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="p-2 rounded-full backdrop-blur-md bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-95 relative z-20 shadow-sm"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-5 pb-8 relative z-10">
        {/* PROFILE CARD - Glassmorphism */}
        <div className="animate-glass-1 glass-shine rounded-3xl p-5 flex items-center gap-4 backdrop-blur-2xl bg-background/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] hover:bg-background/50 transition-all duration-500 ease-in-out group">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile Avatar"
              className="h-16 w-16 rounded-full object-cover backdrop-blur-md bg-white/20 border-2 border-white/40 shadow-lg group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <span className="grid place-items-center h-16 w-16 rounded-full font-bold text-xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] border border-white/30 group-hover:scale-110 transition-transform duration-500 backdrop-blur-xl bg-[color:var(--gold-soft)]/80 text-black">
              {(profile?.display_name ?? profile?.email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}

          <div className="flex-1 min-w-0 transition-transform duration-300 group-hover:translate-x-2">
            <div className="font-extrabold text-xl truncate text-foreground drop-shadow-sm">
              {profile?.display_name ?? "—"}
            </div>
            <div className="text-xs text-muted-foreground truncate font-medium mt-0.5">{profile?.email}</div>
          </div>

          <div className="flex flex-col items-end gap-2 relative z-20">
            <button
              onClick={handleEditClick}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 rounded-full shadow-sm transition-all duration-300 hover:scale-110 hover:rotate-12 backdrop-blur-xl border border-white/10 hover:border-white/30"
              aria-label="Edit Profile"
            >
              <Edit2 size={16} />
            </button>
            <span
              className={`text-[11px] font-bold tracking-wide rounded-full px-3 py-1 backdrop-blur-xl transition-all duration-300 shadow-sm border ${
                profile?.kyc_status === "verified"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 group-hover:bg-green-500/20 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  : "bg-white/5 text-muted-foreground border-white/10 group-hover:bg-white/10"
              }`}
            >
              KYC: {profile?.kyc_status ?? "unverified"}
            </span>
          </div>
        </div>

        {/* ---------------- NEW FEATURE: WALLET SUMMARY CARD ---------------- */}
        <div className="animate-glass-2 rounded-3xl p-5 backdrop-blur-2xl bg-gradient-to-br from-background/60 to-black/40 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
            <Wallet size={80} className="text-[color:var(--gold)]" />
          </div>

          <div className="relative z-10">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Balance</p>
            <div className="flex items-baseline gap-2 mb-5">
              <h3 className="text-3xl font-black text-foreground drop-shadow-md">0.00</h3>
              <span className="text-sm font-bold text-[color:var(--gold)]">LMC</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => nav({ to: "/buy" })}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-[color:var(--gold-soft)]/90 text-black shadow-[0_4px_15px_rgba(255,215,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,215,0,0.4)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <ArrowDownRight size={16} /> Deposit
              </button>
              <button
                onClick={() => nav({ to: "/sell" })}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-white/10 dark:bg-white/5 border border-white/20 text-foreground hover:bg-white/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <ArrowUpRight size={16} /> Withdraw
              </button>
            </div>
          </div>
        </div>
        {/* ---------------- END NEW FEATURE ---------------- */}

        {/* MENU LIST - Glassmorphism (Updated with New Menu Items) */}
        <div className="animate-glass-3 rounded-3xl overflow-hidden backdrop-blur-2xl bg-background/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] transition-all duration-500">
          {[
            { icon: User, label: "Real Name", path: "/real-name" },
            { icon: Wallet, label: "My Wallet", path: "/wallet" }, // <-- New
            { icon: CreditCard, label: "Collection", path: "/collection" },
            { icon: Lock, label: "Payment Password", path: "/payment-password" },
            { icon: ShieldCheck, label: "Security Center", path: "/security" }, // <-- New
            { icon: History, label: "Transaction", path: "/transactions" },
            { icon: FileText, label: "My Appeal", path: "/my-appeal" },
            { icon: PlayCircle, label: "Buy Tutorial", path: "/buy-tutorial" },
            { icon: PlayCircle, label: "Sell Tutorial", path: "/sell-tutorial" },
            { icon: Activity, label: "Market Activity", path: "/market" }, // <-- New
            { icon: Bell, label: "User Notice", path: "/user-notice" },
            { icon: Gift, label: "Rewards Card", path: "/referral" },
            { icon: Users, label: "Team Center", path: "/team" },
            { icon: HelpCircle, label: "Help & Support", path: "/support" }, // <-- New
            { icon: Settings, label: "Settings", path: "/settings" },
          ].map((item, idx) => (
            <button
              key={item.label}
              onClick={() => item.path && nav({ to: item.path })}
              className={`group w-full flex items-center justify-between px-5 py-4 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ease-in-out relative overflow-hidden ${
                idx !== 0 ? "border-t border-white/10 dark:border-white/5" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none"></div>

              <div className="flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-300 relative z-10">
                <div className="p-1.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/5 group-hover:bg-white/10 transition-colors">
                  <item.icon
                    size={18}
                    className="text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                  />
                </div>
                <span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                  {item.label}
                </span>
              </div>
              <div className="p-1 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors backdrop-blur-sm border border-transparent group-hover:border-white/10 relative z-10">
                <ChevronRight
                  size={16}
                  className="text-muted-foreground/50 group-hover:text-foreground/90 transition-all duration-300"
                />
              </div>
            </button>
          ))}
        </div>

        {/* ACTION BUTTONS - Glassmorphism */}
        <div className="space-y-3">
          <button
            onClick={() => setIsSignOutModalOpen(true)}
            className="animate-glass-4 glass-shine w-full rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-xl bg-background/40 hover:bg-red-500/10 border border-white/20 hover:border-red-500/40 transition-all duration-400 ease-out shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-foreground hover:text-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-95 group relative z-10"
          >
            <LogOut size={18} className="transition-transform duration-300 group-hover:-translate-x-1" /> Sign out
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="animate-glass-4 glass-shine w-full rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/50 transition-all duration-400 ease-out shadow-[0_4px_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-95 group relative z-10"
            style={{ animationDelay: "0.5s" }}
          >
            <Trash2 size={18} className="transition-transform duration-300 group-hover:scale-110" /> Permanent Delete
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL - Glassmorphism */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-background/60 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 z-0"></div>

          <div className="animate-modal glass-shine relative z-10 w-full max-w-md rounded-[2.5rem] p-6 space-y-6 backdrop-blur-2xl bg-background/70 dark:bg-black/50 border border-white/30 dark:border-white/10 shadow-[0_8px_40px_0_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center pb-4 border-b border-white/20 dark:border-white/10">
              <h2 className="text-xl font-extrabold text-foreground drop-shadow-md">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-full backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/20 dark:hover:bg-white/10 hover:rotate-90 text-muted-foreground hover:text-foreground transition-all duration-300 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="group">
              <label className="text-sm font-bold mb-2 block text-foreground/80 drop-shadow-sm group-focus-within:text-[color:var(--gold)] transition-colors">
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/10 dark:bg-black/40 border border-white/20 dark:border-white/10 focus:border-[color:var(--gold)] focus:bg-white/20 focus:shadow-[0_0_15px_rgba(255,215,0,0.15)] text-foreground placeholder:text-muted-foreground transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block text-foreground/80 drop-shadow-sm">Choose Avatar</label>
              <div className="grid grid-cols-5 gap-3 max-h-52 overflow-y-auto p-3 scrollbar-hide rounded-2xl backdrop-blur-xl bg-white/5 dark:bg-black/30 border border-white/10 shadow-inner">
                {AVATARS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar ${idx + 1}`}
                    onClick={() => setEditAvatar(url)}
                    className={`h-12 w-12 rounded-full cursor-pointer object-cover transition-all duration-300 ease-out ${
                      editAvatar === url
                        ? "ring-4 ring-[color:var(--gold-soft)] ring-offset-2 ring-offset-transparent scale-110 shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                        : "opacity-70 hover:opacity-100 hover:scale-110 hover:shadow-lg border border-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="glass-shine w-full py-4 rounded-2xl font-extrabold flex justify-center items-center gap-2 backdrop-blur-xl bg-[color:var(--gold-soft)]/90 border border-[color:var(--gold)]/50 text-black transition-all duration-300 shadow-[0_4px_15px_0_rgba(255,215,0,0.2)] disabled:opacity-50 hover:shadow-[0_8px_25px_rgba(255,215,0,0.4)] hover:-translate-y-1 active:translate-y-0 text-base"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* SIGN OUT CONFIRMATION MODAL - Glassmorphism */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-[100] bg-background/60 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-orange-500/10 z-0"></div>

          <div className="animate-modal glass-shine relative z-10 w-full max-w-sm rounded-[2.5rem] p-6 space-y-5 backdrop-blur-2xl bg-background/70 dark:bg-black/50 border border-white/30 dark:border-white/10 shadow-[0_8px_40px_0_rgba(0,0,0,0.2)] text-center flex flex-col items-center">
            <div className="w-16 h-16 backdrop-blur-xl bg-red-500/10 rounded-full flex items-center justify-center mb-1 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <LogOut size={30} className="text-red-500 drop-shadow-md" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-foreground drop-shadow-md mb-1">Sign Out</h2>
              <p className="text-foreground/80 text-sm font-medium px-2">
                Are you sure you want to sign out of your account?
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setIsSignOutModalOpen(false)}
                className="flex-1 py-3 rounded-2xl font-bold backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 text-foreground hover:bg-white/20 transition-all duration-300 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex-1 py-3 rounded-2xl font-bold backdrop-blur-xl bg-red-500/90 border border-red-400/50 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.5)] hover:bg-red-500 transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL - Glassmorphism */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] bg-background/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 via-transparent to-red-900/10 z-0"></div>

          <div className="animate-modal glass-shine relative z-10 w-full max-w-sm rounded-[2.5rem] p-6 space-y-5 backdrop-blur-2xl bg-background/70 dark:bg-black/60 border border-red-500/30 shadow-[0_8px_40px_0_rgba(239,68,68,0.15)] text-center flex flex-col items-center">
            <div className="w-16 h-16 backdrop-blur-xl bg-red-500/10 rounded-full flex items-center justify-center mb-1 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <Trash2 size={30} className="text-red-500 drop-shadow-md" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-red-500 drop-shadow-md mb-2">Delete Account</h2>
              <p className="text-foreground/80 text-sm font-medium px-1">
                This action is <span className="font-bold text-foreground">permanent</span> and cannot be undone. All
                your data will be lost.
              </p>
              <p className="text-foreground/70 text-xs mt-3">
                Please type your email to confirm:
                <br />
                <span className="font-bold text-foreground block mt-1">{profile?.email || user?.email}</span>
              </p>
            </div>

            <div className="w-full">
              <input
                type="email"
                value={deleteEmailInput}
                onChange={(e) => setDeleteEmailInput(e.target.value)}
                placeholder="Type your email"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/5 dark:bg-black/40 border border-red-500/30 focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] text-foreground placeholder:text-muted-foreground transition-all duration-300"
              />
            </div>

            <div className="flex gap-3 w-full pt-1">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteEmailInput(""); // reset input on cancel
                }}
                className="flex-1 py-3 rounded-2xl font-bold backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 text-foreground hover:bg-white/20 transition-all duration-300 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteEmailInput !== (profile?.email || user?.email) || isDeleting}
                className="flex-1 py-3 rounded-2xl font-bold backdrop-blur-xl bg-red-600/90 border border-red-500/50 hover:bg-red-600 text-white disabled:opacity-40 disabled:hover:bg-red-600/50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(239,68,68,0.2)] hover:shadow-[0_8px_25px_rgba(239,68,68,0.4)] transition-all duration-300"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
