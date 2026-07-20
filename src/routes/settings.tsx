import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import {
  Volume2,
  VolumeX,
  Shield,
  Moon,
  Bell,
  ChevronLeft,
  Globe,
  Fingerprint,
  EyeOff,
  Mail,
  DollarSign,
  HelpCircle,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [{ title: "Settings · LM Coin" }],
  }),
});

function SettingsPage() {
  const nav = useNavigate();

  // Payment Sounds states (Connected with localStorage)
  const [soundPending, setSoundPending] = useState(() =>
    JSON.parse(localStorage.getItem("lmc_soundPending") ?? "true"),
  );
  const [soundCancelled, setSoundCancelled] = useState(() =>
    JSON.parse(localStorage.getItem("lmc_soundCancelled") ?? "true"),
  );
  const [soundSuccess, setSoundSuccess] = useState(() =>
    JSON.parse(localStorage.getItem("lmc_soundSuccess") ?? "true"),
  );

  // Update localStorage when toggled
  useEffect(() => {
    localStorage.setItem("lmc_soundPending", JSON.stringify(soundPending));
  }, [soundPending]);
  useEffect(() => {
    localStorage.setItem("lmc_soundCancelled", JSON.stringify(soundCancelled));
  }, [soundCancelled]);
  useEffect(() => {
    localStorage.setItem("lmc_soundSuccess", JSON.stringify(soundSuccess));
  }, [soundSuccess]);

  // States for other toggle switches
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // പുതിയ ഫീച്ചറുകൾക്കുള്ള സ്റ്റേറ്റുകൾ
  const [hideBalance, setHideBalance] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Toggle Switch Component for reuse
  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        enabled
          ? "bg-[color:var(--gold-soft)] border border-[color:var(--gold)]/50 shadow-[0_0_10px_rgba(255,215,0,0.3)]"
          : "bg-white/10 border border-white/20"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <Shell>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-item-1 { animation: fade-in-up 0.5s ease-out forwards; opacity: 0; animation-delay: 0.1s; }
        .animate-item-2 { animation: fade-in-up 0.5s ease-out forwards; opacity: 0; animation-delay: 0.2s; }
        .animate-item-3 { animation: fade-in-up 0.5s ease-out forwards; opacity: 0; animation-delay: 0.3s; }
        .animate-item-4 { animation: fade-in-up 0.5s ease-out forwards; opacity: 0; animation-delay: 0.4s; }
        .animate-item-5 { animation: fade-in-up 0.5s ease-out forwards; opacity: 0; animation-delay: 0.5s; }
        
        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          z-index: 0;
          opacity: 0.3;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>

      {/* Ambient Background Blobs */}
      <div className="bg-blob w-64 h-64 bg-blue-500/20 top-10 right-[-10%]"></div>
      <div className="bg-blob w-72 h-72 bg-purple-500/20 bottom-20 left-[-10%]" style={{ animationDelay: "2s" }}></div>

      <AppHeader
        title="Settings"
        left={
          <button
            onClick={() => nav({ to: "/dashboard" })}
            className="p-2 -ml-2 rounded-full backdrop-blur-md bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-300 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-6 pb-8 relative z-10">
        {/* Audio Settings Section */}
        <div className="animate-item-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 pl-2">Audio & Sound</h3>
          <div className="rounded-3xl overflow-hidden backdrop-blur-2xl bg-background/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
            {/* Pending Sound */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  {soundPending ? (
                    <Volume2 size={18} className="text-yellow-400" />
                  ) : (
                    <VolumeX size={18} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Pending Voice</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Voice alert for pending payments</div>
                </div>
              </div>
              <ToggleSwitch enabled={soundPending} onChange={setSoundPending} />
            </div>

            {/* Cancelled Sound */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  {soundCancelled ? (
                    <Volume2 size={18} className="text-red-400" />
                  ) : (
                    <VolumeX size={18} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Cancelled Voice</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Voice alert for cancelled payments</div>
                </div>
              </div>
              <ToggleSwitch enabled={soundCancelled} onChange={setSoundCancelled} />
            </div>

            {/* Success Sound */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  {soundSuccess ? (
                    <Volume2 size={18} className="text-green-400" />
                  ) : (
                    <VolumeX size={18} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Success Voice</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Voice alert for successful payments</div>
                </div>
              </div>
              <ToggleSwitch enabled={soundSuccess} onChange={setSoundSuccess} />
            </div>
          </div>
        </div>

        {/* Security & Privacy Section */}
        <div className="animate-item-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 pl-2">
            Security & Privacy
          </h3>
          <div className="rounded-3xl overflow-hidden backdrop-blur-2xl bg-background/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <Shield size={18} className="text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">2FA Authentication</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Extra layer of security for logins</div>
                </div>
              </div>
              <ToggleSwitch enabled={twoFactorAuth} onChange={setTwoFactorAuth} />
            </div>

            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <Fingerprint size={18} className="text-muted-foreground" />
                </div>
                <div className="text-sm font-semibold text-foreground">Biometric Login</div>
              </div>
              <span className="text-xs text-muted-foreground border border-white/10 px-2 py-1 rounded-lg backdrop-blur-md">
                Setup
              </span>
            </button>

            {/* പുതിയതായി ചേർത്തത്: Hide Balance */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <EyeOff size={18} className="text-pink-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Hide Balance</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Mask portfolio amounts in dashboard</div>
                </div>
              </div>
              <ToggleSwitch enabled={hideBalance} onChange={setHideBalance} />
            </div>
          </div>
        </div>

        {/* General Options Section */}
        <div className="animate-item-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 pl-2">General</h3>
          <div className="rounded-3xl overflow-hidden backdrop-blur-2xl bg-background/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <Moon size={18} className="text-purple-400" />
                </div>
                <div className="text-sm font-semibold text-foreground">Dark Mode</div>
              </div>
              <ToggleSwitch enabled={darkMode} onChange={setDarkMode} />
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <Bell size={18} className="text-blue-400" />
                </div>
                <div className="text-sm font-semibold text-foreground">Push Notifications</div>
              </div>
              <ToggleSwitch enabled={pushNotifications} onChange={setPushNotifications} />
            </div>

            {/* പുതിയതായി ചേർത്തത്: Email Alerts */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <Mail size={18} className="text-cyan-400" />
                </div>
                <div className="text-sm font-semibold text-foreground">Email Alerts</div>
              </div>
              <ToggleSwitch enabled={emailAlerts} onChange={setEmailAlerts} />
            </div>

            {/* പുതിയതായി ചേർത്തത്: Default Currency */}
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <DollarSign size={18} className="text-green-400" />
                </div>
                <div className="text-sm font-semibold text-foreground">Default Currency</div>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground border border-white/10 px-2 py-1 rounded-lg backdrop-blur-md">
                USD
              </div>
            </button>

            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <Globe size={18} className="text-orange-400" />
                </div>
                <div className="text-sm font-semibold text-foreground">Language</div>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">English (US)</div>
            </button>
          </div>
        </div>

        {/* പുതിയതായി ചേർത്തത്: Support & About Section */}
        <div className="animate-item-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 pl-2">
            Support & About
          </h3>
          <div className="rounded-3xl overflow-hidden backdrop-blur-2xl bg-background/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <HelpCircle size={18} className="text-yellow-400" />
                </div>
                <div className="text-sm font-semibold text-foreground">Help Center</div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left border-b border-white/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <FileText size={18} className="text-gray-400" />
                </div>
                <div className="text-sm font-semibold text-foreground">Terms of Service</div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <Shield size={18} className="text-blue-500" />
                </div>
                <div className="text-sm font-semibold text-foreground">Privacy Policy</div>
              </div>
            </button>
          </div>
        </div>

        <div className="animate-item-5 text-center pt-4 opacity-50">
          <p className="text-[10px] font-mono text-muted-foreground">LM Coin App v1.0.0</p>
        </div>
      </div>
    </Shell>
  );
}
