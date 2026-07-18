import { createFileRoute } from "@tanstack/react-router";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { useState, useEffect } from "react";
import { Users, Calendar, Award, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/team")({
  component: TeamCenter,
  head: () => ({
    meta: [
      { title: "Team Center · LM Coin" },
      { name: "description", content: "View your invited members." },
    ],
  }),
});

function TeamCenter() {
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Dummy data for testing. You can replace this with Supabase fetching logic.
  useEffect(() => {
    setTimeout(() => {
      setTeamMembers([
        { id: 1, name: "John Doe", email: "john@example.com", date: "Oct 12, 2023", status: "Verified", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
        { id: 2, name: "Sarah Smith", email: "sarah.s@example.com", date: "Oct 14, 2023", status: "Pending", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
        { id: 3, name: "Mike Johnson", email: "mike22@example.com", date: "Oct 18, 2023", status: "Verified", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Shell>
      <style>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        .animate-fade-up { animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        
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
      <div className="bg-blob w-72 h-72 bg-blue-500/20 top-10 left-[-10%]"></div>
      <div className="bg-blob w-64 h-64 bg-green-500/20 bottom-20 right-[-10%]" style={{ animationDelay: "3s" }}></div>

      <AppHeader title="Team Center" />

      <div className="px-4 pt-4 space-y-5 pb-8 relative z-10">
        
        {/* STATS CARD - Glassmorphism */}
        <div className="animate-fade-up rounded-3xl p-5 flex items-center justify-between backdrop-blur-2xl bg-[color:var(--gold)]/10 dark:bg-[color:var(--gold)]/5 border border-[color:var(--gold)]/30 shadow-[0_8px_32px_0_rgba(255,215,0,0.1)]" style={{ animationDelay: '0.1s' }}>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Invited</p>
            <div className="text-3xl font-extrabold text-foreground drop-shadow-sm flex items-center gap-2">
              {loading ? "-" : teamMembers.length} <Users size={24} className="text-[color:var(--gold)]" />
            </div>
          </div>
          <div className="h-12 w-px bg-white/20 dark:bg-white/10 mx-4"></div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rewards</p>
            <div className="text-2xl font-extrabold text-foreground drop-shadow-sm flex items-center gap-1.5">
              5% <Award size={20} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* TEAM MEMBERS LIST - Glassmorphism */}
        <div>
          <h3 className="text-sm font-bold text-foreground/80 ml-2 mb-3">Your Referrals</h3>
          
          <div className="space-y-3">
            {loading ? (
              // Loading Skeleton
              [1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 animate-pulse"></div>
              ))
            ) : teamMembers.length === 0 ? (
              // Empty State
              <div className="animate-fade-up rounded-3xl p-8 text-center backdrop-blur-xl bg-white/5 border border-white/10 shadow-sm" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-3">
                  <Users size={28} className="text-muted-foreground" />
                </div>
                <h4 className="text-lg font-bold text-foreground">No members yet</h4>
                <p className="text-sm text-muted-foreground mt-1">Share your referral link to build your team.</p>
              </div>
            ) : (
              // Members List
              teamMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="animate-fade-up rounded-2xl p-4 flex items-center gap-4 backdrop-blur-xl bg-background/40 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] hover:bg-white/10 transition-all duration-300"
                  style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                >
                  <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full border border-white/20 shadow-sm bg-white/10" />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{member.name}</h4>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <Calendar size={12} /> {member.date}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-bold tracking-wider rounded-full px-2.5 py-0.5 flex items-center gap-1 border ${
                      member.status === "Verified" 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" 
                      : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
                    }`}>
                      {member.status === "Verified" && <ShieldCheck size={10} />}
                      {member.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Shell>
  );
}
