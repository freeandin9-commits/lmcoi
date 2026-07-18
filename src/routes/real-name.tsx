import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { Upload, ArrowLeft, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/real-name")({
  component: RealNameKYC,
  head: () => ({
    meta: [{ title: "Real Name KYC · LM Coin" }],
  }),
});

function RealNameKYC() {
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aadhaarName, setAadhaarName] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your submit logic here (e.g., Supabase upload)
    console.log({ aadhaarName, aadhaarNumber, selectedImage });
    alert("KYC Details Submitted!");
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
        title="Real Name Authentication"
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

      <div className="px-4 pt-6 pb-12 relative z-10 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Card Upload Section */}
          <div className="glass-card p-5 rounded-[2rem] bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <h3 className="text-base font-bold text-foreground mb-4 drop-shadow-md">Front of Aadhaar ID Card</h3>

            <div
              className="relative w-full h-48 rounded-2xl border-2 border-dashed border-[color:var(--gold-soft)]/50 bg-black/10 dark:bg-white/5 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-black/20 dark:hover:bg-white/10 transition-all duration-300 group"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Aadhaar Front Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-[color:var(--gold-soft)]/20 flex items-center justify-center mb-3 text-[color:var(--gold-soft)] group-hover:scale-110 transition-transform duration-300">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-semibold text-foreground/80">Tap to Upload</p>
                  <p className="text-xs text-muted-foreground mt-1">Clear photo of your original ID</p>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg, image/png, image/jpg"
                className="hidden"
              />

              {/* Upload Overlay on Hover */}
              {selectedImage && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Upload size={18} /> Change Photo
                  </div>
                </div>
              )}
            </div>

            {/* --- NEW: Photo Upload Guidelines (Demo Photos) --- */}
            <div className="mt-5">
              <h4 className="text-[11px] font-bold text-muted-foreground/80 mb-3 uppercase tracking-wider">
                Photo Guidelines
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Correct Demo */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-full aspect-[1.6] rounded-xl border border-green-500/60 bg-green-500/10 dark:bg-green-500/5 overflow-hidden flex items-center justify-center">
                    {/* Placeholder for real ID photo - using styled div for generic demo */}
                    <div className="w-3/4 h-2/3 bg-foreground/20 rounded flex items-center p-2 gap-2">
                      <div className="w-8 h-8 bg-foreground/30 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-full bg-foreground/30 rounded"></div>
                        <div className="h-2 w-2/3 bg-foreground/30 rounded"></div>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute -bottom-px -right-px bg-green-500 rounded-tl-xl p-1 text-white shadow-md">
                      <CheckCircle size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-green-600 dark:text-green-400 text-center leading-tight">
                    Good: Clear & Full
                  </span>
                </div>

                {/* Incorrect Demo */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-full aspect-[1.6] rounded-xl border border-red-500/60 bg-red-500/10 dark:bg-red-500/5 overflow-hidden flex items-center justify-center">
                    {/* Placeholder for Blurry/Cut ID */}
                    <div className="w-[120%] h-[120%] bg-foreground/20 rounded flex items-center p-2 gap-2 blur-[2px] translate-x-4 translate-y-4 opacity-70">
                      <div className="w-10 h-10 bg-foreground/30 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-full bg-foreground/30 rounded"></div>
                        <div className="h-3 w-2/3 bg-foreground/30 rounded"></div>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute -bottom-px -right-px bg-red-500 rounded-tl-xl p-1 text-white shadow-md">
                      <XCircle size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 text-center leading-tight">
                    Bad: Blurry or Cut
                  </span>
                </div>
              </div>
            </div>
            {/* --- END OF NEW ADDITION --- */}
          </div>

          {/* Form Inputs Section */}
          <div className="glass-card p-5 rounded-[2rem] space-y-5 bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            {/* Aadhaar Name Input */}
            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
                Aadhaar Name
              </label>
              <input
                type="text"
                value={aadhaarName}
                onChange={(e) => setAadhaarName(e.target.value)}
                placeholder="Name exactly as on Aadhaar"
                required
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/30 focus:shadow-[0_0_20px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300"
              />
            </div>

            {/* Aadhaar Number Input */}
            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-800 dark:text-gray-200 drop-shadow-sm group-focus-within:text-[color:var(--gold-soft)] transition-colors">
                Aadhaar Number
              </label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                placeholder="0000 0000 0000"
                maxLength={14}
                required
                className="w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 focus:border-[color:var(--gold-soft)] focus:bg-white/30 focus:shadow-[0_0_20px_rgba(255,215,0,0.2)] text-black dark:text-white placeholder:text-gray-500 transition-all duration-300 tracking-wider"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-extrabold flex justify-center items-center gap-2 text-black transition-all duration-300 shadow-[0_4px_15px_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,255,0,0.5)] hover:-translate-y-1 active:translate-y-0 text-base"
            style={{ background: "var(--gold-soft)" }}
          >
            Submit for Verification
          </button>
        </form>
      </div>
    </Shell>
  );
}
