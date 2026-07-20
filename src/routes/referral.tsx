import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/lib/lmc-api";
import {
  Copy,
  Check,
  Share2,
  Users,
  Coins,
  QrCode,
  MessageCircle,
  Send,
  Twitter,
  Mail,
  Trophy,
  Info,
  Calculator,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Edit3,
  Award,
  Medal,
  Gift,
  Bell,
  BellOff,
  Target,
  Clock,
  BellRing,
  // --- പുതിയതായി ചേർത്ത ഐക്കണുകൾ ---
  Percent,
  CalendarCheck,
  UserPlus,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/referral")({
  component: Referral,
  head: () => ({
    meta: [
      { title: "Referral · LM Coin" },
      { name: "description", content: "Invite friends to LM Coin and earn rewards." },
    ],
  }),
});

function Referral() {
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/" });
  }, [authLoading, user, nav]);

  const { profile } = useProfile();
  const code = profile?.referral_code ?? "";
  const link = typeof window !== "undefined" && code ? `${window.location.origin}/register?ref=${code}` : "";
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  // പഴയ സ്റ്റേറ്റുകൾ
  const [friendCount, setFriendCount] = useState<number>(5);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [customMessage, setCustomMessage] = useState<string>("Join LM Coin and earn rewards! Sign up with my code:");
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [remindingId, setRemindingId] = useState<number | null>(null);

  // --- പുതിയതായി ചേർത്ത സ്റ്റേറ്റുകൾ ---
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [questCompleted, setQuestCompleted] = useState<boolean>(false);

  const copy = async (v: string, k: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(k);
      toast.success("Copied");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Join LM Coin", text: `${customMessage} ${code}`, url: link });
      } catch {}
    } else {
      copy(link, "link");
    }
  };

  // Direct Social Media Sharing Logic
  const shareSocial = (platform: "wa" | "tg" | "tw") => {
    if (!link) return;
    const text = encodeURIComponent(`${customMessage} ${code}`);
    const url = encodeURIComponent(link);
    let shareUrl = "";

    if (platform === "wa") shareUrl = `https://wa.me/?text=${text}%20${url}`;
    if (platform === "tg") shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    if (platform === "tw") shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;

    window.open(shareUrl, "_blank");
  };

  // Email Sharing Logic
  const shareEmail = () => {
    if (!link) return;
    const subject = encodeURIComponent("You're invited to join LM Coin!");
    const body = encodeURIComponent(
      `Hi there,\n\n${customMessage} ${code}\n\nJoin here: ${link}\n\nBest,\nLM Coin User`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // --- പുതിയതായി ചേർത്ത ഫംഗ്ഷൻ (Direct Invite) ---
  const handleDirectInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    setIsInviting(true);
    setTimeout(() => {
      setIsInviting(false);
      setInviteEmail("");
      toast.success(`Invitation sent to ${inviteEmail}!`);
    }, 1500);
  };

  return (
    <Shell>
      <AppHeader title="Referral" />
      <div className="px-4 pt-4 pb-8 space-y-4">
        {/* Rewards & Stats Card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-sm flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Users size={20} />
            </div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Total Invites</div>
          </div>
          <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-sm flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <Coins size={20} />
            </div>
            <div className="text-2xl font-bold">0.00</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Earned (LMC)</div>
          </div>
        </div>

        {/* --- NEW FEATURE 1: Commission Rate Banner --- */}
        <div className="rounded-xl p-3 bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Percent size={18} />
            <span className="text-xs font-semibold">Current Commission Rate</span>
          </div>
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
            20%
          </span>
        </div>

        {/* Claim Rewards Banner */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/30 flex items-center justify-between shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Gift size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Claim Rewards</h3>
              <p className="text-xs text-muted-foreground">0.00 LMC available</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsClaiming(true);
              setTimeout(() => {
                setIsClaiming(false);
                toast.success("Rewards claimed successfully!");
              }, 1500);
            }}
            disabled={isClaiming}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isClaiming ? "Claiming..." : "Claim"}
          </button>
        </div>

        {/* Referral Tier / Gamification Progress Bar */}
        <div className="rounded-2xl p-5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/5 dark:to-orange-500/5 backdrop-blur-xl border border-yellow-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none transform translate-x-2 -translate-y-2">
            <Trophy size={80} />
          </div>
          <div className="flex justify-between items-end mb-2 relative z-10">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Bronze Tier <Trophy size={14} className="text-yellow-600 dark:text-yellow-500" />
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">Invite 5 more friends to reach Silver</p>
            </div>
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-500/20 px-2.5 py-1 rounded-md">
              0 / 5
            </span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 mt-3 relative z-10 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full w-[5%] transition-all duration-1000"></div>
          </div>
        </div>

        {/* Milestone Bonuses */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-purple-500" />
            <h2 className="text-sm font-bold">Milestone Bonuses</h2>
          </div>
          <div className="space-y-3">
            {[
              { target: 10, reward: "50 LMC", progress: 0 },
              { target: 50, reward: "300 LMC", progress: 0 },
              { target: 100, reward: "1000 LMC", progress: 0 },
            ].map((milestone, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5"
              >
                <div>
                  <div className="text-xs font-bold text-foreground">Invite {milestone.target} Friends</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Sparkles size={10} className="text-yellow-500" /> Reward: {milestone.reward}
                  </div>
                </div>
                <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                  {milestone.progress} / {milestone.target}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- NEW FEATURE 2: Daily Quests --- */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck size={16} className="text-teal-500" />
            <h2 className="text-sm font-bold">Daily Quest</h2>
          </div>
          <div className="flex items-center justify-between bg-teal-500/10 p-3 rounded-xl border border-teal-500/20">
            <div>
              <div className="text-xs font-bold text-foreground">Share on WhatsApp today</div>
              <div className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">Reward: 5 LMC (Pending)</div>
            </div>
            <button
              onClick={() => {
                shareSocial("wa");
                setTimeout(() => {
                  setQuestCompleted(true);
                  toast.success("Daily Quest Completed! 5 LMC Added.");
                }, 2000);
              }}
              disabled={questCompleted}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                questCompleted
                  ? "bg-teal-500/50 text-white cursor-not-allowed"
                  : "bg-teal-500 hover:bg-teal-600 text-white active:scale-95"
              }`}
            >
              {questCompleted ? "Completed" : "Share Now"}
            </button>
          </div>
        </div>

        {/* Glassmorphism Code Card (Gold Tinted Glass) */}
        <div className="rounded-2xl p-5 relative overflow-hidden bg-yellow-500/10 dark:bg-yellow-500/5 backdrop-blur-xl border border-yellow-500/20 shadow-[0_8px_32px_0_rgba(234,179,8,0.15)] text-foreground mt-4">
          <div className="text-sm opacity-80 font-medium">Invite friends. Earn together.</div>
          <div className="mt-3 text-xs uppercase tracking-widest opacity-80">Your code</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight drop-shadow-sm">{code || "—"}</span>
            <div className="ml-auto flex gap-2">
              <button
                disabled={!code}
                onClick={() => toast.info("QR Code feature coming soon!")}
                className="grid place-items-center h-9 w-9 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm disabled:opacity-40 hover:bg-white/30 hover:scale-110 active:scale-95 transition-all"
                aria-label="Show QR"
              >
                <QrCode size={16} />
              </button>
              <button
                disabled={!code}
                onClick={() => copy(code, "code")}
                className="grid place-items-center h-9 w-9 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm disabled:opacity-40 hover:bg-white/30 hover:scale-110 active:scale-95 transition-all"
                aria-label="Copy code"
              >
                {copied === "code" ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Custom Share Message */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Edit3 size={14} /> Customize Message
            </label>
          </div>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 p-3 text-xs text-foreground outline-none resize-none focus:border-yellow-500/50 transition-colors"
            placeholder="Write a custom message for your friends..."
          />
        </div>

        {/* Glassmorphism Share Link Card */}
        <div className="rounded-2xl p-4 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] mt-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Share link</div>
          <div className="mt-2 flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/10 backdrop-blur-sm px-3 py-2 text-xs font-mono truncate outline-none text-foreground shadow-inner"
            />
            <button
              disabled={!link}
              onClick={() => copy(link, "link")}
              className="rounded-lg bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/30 px-3 py-2 text-xs font-semibold disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
            >
              {copied === "link" ? "Copied" : "Copy"}
            </button>
          </div>

          <button
            onClick={share}
            disabled={!link}
            className="mt-4 w-full rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-sm py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:-translate-y-0.5"
          >
            <Share2 size={16} /> Share
          </button>

          {/* Direct Social Share Buttons */}
          <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Quick share:</span>
            <div className="flex gap-2">
              <button
                onClick={() => shareSocial("wa")}
                disabled={!link}
                className="h-10 w-10 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:scale-110 active:scale-95 border border-green-500/20 flex items-center justify-center transition-all disabled:opacity-50 shadow-sm"
              >
                <MessageCircle size={18} />
              </button>
              <button
                onClick={() => shareSocial("tg")}
                disabled={!link}
                className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:scale-110 active:scale-95 border border-blue-500/20 flex items-center justify-center transition-all disabled:opacity-50 shadow-sm"
              >
                <Send size={18} />
              </button>
              <button
                onClick={() => shareSocial("tw")}
                disabled={!link}
                className="h-10 w-10 rounded-full bg-neutral-500/10 text-foreground hover:bg-neutral-500/20 hover:scale-110 active:scale-95 border border-neutral-500/20 flex items-center justify-center transition-all disabled:opacity-50 shadow-sm"
              >
                <Twitter size={18} />
              </button>
              <button
                onClick={shareEmail}
                disabled={!link}
                className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:scale-110 active:scale-95 border border-red-500/20 flex items-center justify-center transition-all disabled:opacity-50 shadow-sm"
              >
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- NEW FEATURE 3: Direct Invite Form --- */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus size={16} className="text-pink-500" />
            <h2 className="text-sm font-bold">Direct Invite</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Send a direct invitation email to your friends.</p>
          <form onSubmit={handleDirectInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter friend's email..."
              className="flex-1 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 px-3 py-2 text-xs outline-none focus:border-pink-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={isInviting || !inviteEmail}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
            >
              {isInviting ? "Sending..." : "Send"}
            </button>
          </form>
        </div>

        {/* Earnings Estimator / Calculator Card */}
        <div className="rounded-2xl p-4 bg-white/10 dark:bg-black/25 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator size={16} className="text-yellow-500" />
            <h2 className="text-sm font-bold">Earnings Estimator</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Estimate how much LMC you can earn based on your invites:
          </p>
          <div className="flex items-center justify-between bg-black/10 dark:bg-white/5 p-3 rounded-xl border border-white/10 mb-3">
            <span className="text-xs font-medium">
              Invited Friends: <strong className="text-foreground">{friendCount}</strong>
            </span>
            <input
              type="range"
              min="1"
              max="50"
              value={friendCount}
              onChange={(e) => setFriendCount(Number(e.target.value))}
              className="w-32 accent-yellow-500 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between text-xs bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl">
            <span className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
              <Sparkles size={14} /> Estimated Monthly Reward:
            </span>
            <strong className="text-sm font-mono text-foreground">{(friendCount * 12.5).toFixed(2)} LMC</strong>
          </div>
        </div>

        {/* Glassmorphism How it Works Card */}
        <div className="rounded-2xl p-4 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] mt-4">
          <h2 className="text-base font-bold">How it works</h2>
          <ol className="mt-4 space-y-4 text-sm">
            {[
              ["Share", "Send your link to friends via WhatsApp, Telegram or email."],
              ["They join", "When they sign up with your code, we link their account to you."],
              ["You earn", "Earn a share of every trade fee they generate."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3 group">
                <span className="grid place-items-center h-8 w-8 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 shadow-inner text-xs font-bold shrink-0 group-hover:scale-110 transition-transform">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold text-foreground/90">{t}</div>
                  <div className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* --- NEW FEATURE 4: Analytics Overview Placeholder --- */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-500" /> Referral Analytics
            </h2>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">This Month</span>
          </div>
          <div className="flex items-end gap-2 h-20 pt-4 pb-2 border-b border-white/10">
            {/* Fake Chart Bars */}
            {[20, 40, 30, 70, 50, 90, 60].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t-sm transition-colors relative group"
                style={{ height: `${height}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] hidden group-hover:block bg-black text-white px-1.5 py-0.5 rounded">
                  {height / 10}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp size={12} className="text-green-500" /> +12% vs last month
            </span>
            <span>Total Clicks: 0</span>
          </div>
        </div>

        {/* Top Referrers Leaderboard */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Award size={16} className="text-orange-500" /> Top Referrers
            </h2>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-muted-foreground">This Week</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Alex M.", invites: 142, iconColor: "text-yellow-400" },
              { name: "Sarah K.", invites: 98, iconColor: "text-gray-300" },
              { name: "John D.", invites: 76, iconColor: "text-amber-600" },
            ].map((user, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs w-4 text-muted-foreground">{idx + 1}</span>
                  <div
                    className={`h-7 w-7 rounded-full bg-white/10 flex items-center justify-center ${user.iconColor}`}
                  >
                    <Medal size={14} />
                  </div>
                  <span className="text-xs font-medium">{user.name}</span>
                </div>
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <Users size={12} className="text-muted-foreground" /> {user.invites}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Referrals List */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-sm mt-4">
          <h2 className="text-sm font-bold mb-4">Recent Referrals</h2>
          <div className="flex flex-col items-center justify-center py-6 text-center opacity-60">
            <Users size={32} className="mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No friends joined yet</p>
            <p className="text-xs text-muted-foreground mt-1">Share your code to get started!</p>
          </div>
        </div>

        {/* Pending Actions / Reminders */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-orange-500" />
            <h2 className="text-sm font-bold">Pending Actions</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Friends who joined but haven't traded yet.</p>
          <div className="space-y-2">
            {[
              { id: 1, name: "Rahul T.", status: "KYC Pending" },
              { id: 2, name: "Sneha M.", status: "No Trades Yet" },
            ].map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-white/5"
              >
                <div>
                  <div className="text-xs font-medium">{friend.name}</div>
                  <div className="text-[10px] text-muted-foreground">{friend.status}</div>
                </div>
                <button
                  onClick={() => {
                    setRemindingId(friend.id);
                    setTimeout(() => {
                      setRemindingId(null);
                      toast.success(`Reminder sent to ${friend.name}!`);
                    }, 1000);
                  }}
                  disabled={remindingId === friend.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  <BellRing size={12} />
                  {remindingId === friend.id ? "Sending..." : "Remind"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Toggle Settings */}
        <div className="rounded-2xl p-4 bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-sm mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${notificationsEnabled ? "bg-blue-500/20 text-blue-500" : "bg-gray-500/20 text-gray-500"}`}
            >
              {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Referral Alerts</h3>
              <p className="text-xs text-muted-foreground">Get notified when a friend joins</p>
            </div>
          </div>
          <button
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              toast.success(!notificationsEnabled ? "Notifications enabled" : "Notifications disabled");
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notificationsEnabled ? "bg-blue-500" : "bg-gray-600"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        {/* Frequently Asked Questions (FAQ) */}
        <div className="rounded-2xl p-4 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] mt-4">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle size={16} className="text-blue-500" />
            <h2 className="text-sm font-bold">FAQ</h2>
          </div>
          <div className="space-y-2">
            {[
              [
                "When do I get my rewards?",
                "Rewards are credited to your balance instantly whenever your referred friend completes a qualifying trade fee.",
              ],
              [
                "Is there a limit on how many friends I can invite?",
                "No limit at all! You can invite as many friends as you want and keep earning.",
              ],
            ].map(([q, a], idx) => (
              <div key={idx} className="border border-white/10 rounded-xl overflow-hidden bg-white/5 dark:bg-black/10">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-3 text-left text-xs font-semibold flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span>{q}</span>
                  <ChevronDown
                    size={14}
                    className={`transform transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-3 pb-3 text-xs text-muted-foreground border-t border-white/5 pt-2">{a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Terms & Conditions Link */}
        <div className="flex items-center justify-center gap-1.5 mt-6 pb-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
          <Info size={14} className="text-muted-foreground" />
          <span
            onClick={() => toast.info("Terms and Conditions modal opening soon!")}
            className="text-xs font-medium text-muted-foreground underline decoration-muted-foreground/30 underline-offset-4 hover:text-foreground"
          >
            Read Referral Terms & Conditions
          </span>
        </div>
      </div>
    </Shell>
  );
}
