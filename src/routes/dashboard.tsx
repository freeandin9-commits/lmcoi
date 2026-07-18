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

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const { profile } = useProfile();

  // Sign out with confirmation
  const signOut = async () => {
    const confirmed = window.confirm("Are you sure you want to sign out?");
    if (confirmed) {
      await supabase.auth.signOut();
      nav({ to: "/" });
    }
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
        
        /* Glass Animation Classes */
        .animate-glass-1 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.1s; }
        .animate-glass-2 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.2s; }
        .animate-glass-3 { animation: glass-fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: 0.3s; }
        .animate-modal { animation: modal-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        /* Shimmer Effect for Glass Cards */
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

        /* Floating Background Blobs */
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

      {/* Background Floating Orbs to make Glassmorphism pop */}
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
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 active:scale-95 relative z-20"
            aria-label="Sign out"
          >
            <LogOut size={20} />
          </button>
        }
      />
      <div className="px-4 pt-4 space-y-5 pb-8 relative z-10">
        {/* Profile Info - Glassmorphism with Animation & Shine */}
        <div className="animate-glass-1 glass-shine rounded-2xl p-4 flex items-center gap-4 backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:bg-white/15 dark:hover:bg-black/40 transition-all duration-500 ease-in-out group">
          {/* Profile Picture / Avatar */}
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile Avatar"
              className="h-14 w-14 rounded-full object-cover backdrop-blur-md bg-white/20 border-2 border-white/40 shadow-lg group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <span
              className="grid place-items-center h-14 w-14 rounded-full font-bold text-xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)] border border-white/20 group-hover:scale-110 transition-transform duration-500"
              style={{ background: "var(--gold-soft)" }}
            >
              {(profile?.display_name ?? profile?.email ?? "?").charAt(0).toUpperCase()}
            </span>
          )}

          {/* Name & Email Details */}
          <div className="flex-1 min-w-0 transition-transform duration-300 group-hover:translate-x-2">
            <div className="font-bold text-lg truncate text-foreground drop-shadow-md">
              {profile?.display_name ?? "—"}
            </div>
            <div className="text-xs text-muted-foreground truncate font-medium">{profile?.email}</div>
          </div>

          {/* Edit Button & KYC Wrapper aligned to right side */}
          <div className="flex flex-col items-end gap-2 relative z-20">
            <button
              onClick={handleEditClick}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/20 rounded-full shadow-sm transition-all duration-300 hover:scale-110 hover:rotate-12 backdrop-blur-md border border-transparent hover:border-white/20"
              aria-label="Edit Profile"
            >
              <Edit2 size={16} />
            </button>
            <span
              className={`text-[11px] font-semibold tracking-wide rounded-full px-2.5 py-0.5 backdrop-blur-md transition-all duration-300 shadow-sm ${
                profile?.kyc_status === "verified"
                  ? "bg-[color:var(--success)]/20 text-[color:var(--success)] border border-[color:var(--success)]/40 group-hover:bg-[color:var(--success)]/30 group-hover:shadow-[0_0_10px_rgba(var(--success),0.3)]"
                  : "bg-white/10 dark:bg-black/30 text-muted-foreground border border-white/20 group-hover:bg-white/20"
              }`}
            >
              KYC: {profile?.kyc_status ?? "unverified"}
            </span>
          </div>
        </div>

        {/* SETTINGS & MENU BUTTONS - Glassmorphism with Animation */}
        <div className="animate-glass-2 rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] transition-all duration-500">
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
              className={`group w-full flex items-center justify-between px-5 py-4 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 ease-in-out relative overflow-hidden ${
                idx !== 0 ? "border-t border-white/10 dark:border-white/5" : ""
              }`}
            >
              {/* Subtle hover background sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none"></div>

              <div className="flex items-center gap-3 transform group-hover:translate-x-3 transition-transform duration-300 relative z-10">
                <item.icon
                  size={18}
                  className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 drop-shadow-sm"
                />
                <span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                  {item.label}
                </span>
              </div>
              <ChevronRight
                size={16}
                className="text-muted-foreground/50 group-hover:text-foreground/90 group-hover:translate-x-1.5 transition-all duration-300 relative z-10"
              />
            </button>
          ))}
        </div>

        {/* Sign Out Button - Glassmorphism with Animation */}
        <button
          onClick={signOut}
          className="animate-glass-3 glass-shine w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-2xl bg-white/10 dark:bg-white/5 hover:bg-red-500/20 hover:text-red-500 dark:hover:bg-red-500/20 border border-white/30 dark:border-white/10 hover:border-red-500/50 transition-all duration-400 ease-out shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-foreground hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-95 group relative z-10"
        >
          <LogOut size={18} className="transition-transform duration-300 group-hover:-translate-x-1" /> Sign out
        </button>
      </div>

      {/* EDIT PROFILE MODAL - Glassmorphism with Pop Animation */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 transition-opacity duration-300">
          {/* Modal Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 z-0"></div>

          <div className="animate-modal glass-shine relative z-10 w-full max-w-md rounded-[2rem] p-6 space-y-6 backdrop-blur-3xl bg-white/20 dark:bg-black/50 border border-white/40 dark:border-white/20 shadow-[0_8px_40px_0_rgba(31,38,135,0.3)]">
            <div className="flex justify-between items-center pb-4 border-b border-white/30 dark:border-white/10">
              <h2 className="text-xl font-extrabold text-foreground drop-shadow-md">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-full hover:bg-white/30 dark:hover:bg-white/20 hover:rotate-90 text-muted-foreground hover:text-foreground transition-all duration-300 shadow-sm border border-transparent hover:border-white/20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Name Input */}
            <div className="group">
              <label className="text-sm font-bold mb-2 block text-foreground/90 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/30 focus:shadow-[0_0_20px_rgba(255,215,0,0.2)] text-foreground placeholder:text-muted-foreground transition-all duration-300"
              />
            </div>

            {/* Avatar Selection Grid */}
            <div>
              <label className="text-sm font-bold mb-2 block text-foreground/90 drop-shadow-sm">Choose Avatar</label>
              <div className="grid grid-cols-5 gap-3 max-h-52 overflow-y-auto p-3 scrollbar-hide rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-inner">
                {AVATARS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar ${idx + 1}`}
                    onClick={() => setEditAvatar(url)}
                    className={`h-12 w-12 rounded-full cursor-pointer object-cover transition-all duration-300 ease-out ${
                      editAvatar === url
                        ? "ring-4 ring-[color:var(--gold-soft)] ring-offset-2 ring-offset-transparent scale-110 shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                        : "opacity-70 hover:opacity-100 hover:scale-110 hover:shadow-lg border border-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="glass-shine w-full py-4 rounded-2xl font-extrabold flex justify-center items-center gap-2 text-black transition-all duration-300 shadow-[0_4px_15px_0_rgba(0,0,0,0.2)] disabled:opacity-50 hover:shadow-[0_8px_25px_rgba(255,255,0,0.5)] hover:-translate-y-1 active:translate-y-0 text-base"
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
