import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Shell, AppHeader } from "@/components/lmc/Shell";
import { Upload, ArrowLeft, Image as ImageIcon } from "lucide-react";

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

  // selectedImage: ഉപയോക്താവ് അപ്‌ലോഡ് ചെയ്യുന്ന ഫോട്ടോയുടെ URL
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // DEMO IMAGE URL (നിങ്ങൾക്ക് ഇഷ്ടമുള്ള ഒരു ഡെമോ ലിങ്ക് ഇവിടെ നൽകാം)
  const DEMO_IMAGE = "https://images.unsplash.com/photo-1594963338395-483ef7067b12?q=80&w=400&auto=format&fit=crop";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // File validation: ഫോട്ടോ മാത്രമാണോ എന്ന് ഉറപ്പാക്കാൻ
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      alert("Please upload your Aadhaar photo!");
      return;
    }
    // ഇവിടെ നിങ്ങളുടെ ഫോട്ടോ സെർവറിലേക്ക് അപ്‌ലോഡ് ചെയ്യാനുള്ള ലോജിക് (Supabase/API) ചേർക്കുക
    console.log({ aadhaarName, aadhaarNumber, selectedImage });
    alert("KYC Details Submitted Successfully!");
  };

  return (
    <Shell>
      <style>{`
        .glass-card { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
      `}</style>

      <AppHeader
        title="Real Name Authentication"
        left={
          <button
            onClick={() => nav({ to: "/dashboard" })}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={24} />
          </button>
        }
      />

      <div className="px-4 pt-6 pb-12 relative z-10 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-5 rounded-[2rem] bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-lg">
            <h3 className="text-base font-bold text-foreground mb-4">Front of Aadhaar ID Card</h3>

            <div
              className="relative w-full h-48 rounded-2xl border-2 border-dashed border-[color:var(--gold-soft)]/50 bg-black/10 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-black/20 transition-all duration-300 group"
              onClick={() => fileInputRef.current?.click()}
            >
              {/* ഫോട്ടോ സെലക്ട് ചെയ്തിട്ടുണ്ടെങ്കിൽ അത് കാണിക്കുക, ഇല്ലെങ്കിൽ ഡെമോ കാണിക്കുക */}
              <img
                src={selectedImage || DEMO_IMAGE}
                alt="Aadhaar Preview"
                className={`w-full h-full object-cover transition-opacity duration-300 ${selectedImage ? "opacity-100" : "opacity-40"}`}
              />

              {/* Overlay Text */}
              {!selectedImage && (
                <div className="absolute flex flex-col items-center text-[color:var(--gold-soft)]">
                  <ImageIcon size={32} />
                  <span className="text-sm font-bold mt-2">Click to Upload Aadhaar</span>
                </div>
              )}

              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-[2rem] space-y-5 bg-white/10 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-lg">
            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-200">Aadhaar Name</label>
              <input
                type="text"
                value={aadhaarName}
                onChange={(e) => setAadhaarName(e.target.value)}
                placeholder="Name exactly as on Aadhaar"
                required
                className="w-full rounded-2xl px-4 py-3.5 bg-white/20 border border-white/10 text-white outline-none focus:border-[color:var(--gold-soft)]"
              />
            </div>

            <div className="group">
              <label className="text-sm font-bold mb-2 block text-gray-200">Aadhaar Number</label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                placeholder="0000 0000 0000"
                maxLength={14}
                required
                className="w-full rounded-2xl px-4 py-3.5 bg-white/20 border border-white/10 text-white outline-none focus:border-[color:var(--gold-soft)] tracking-wider"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-extrabold text-black hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ background: "var(--gold-soft)" }}
          >
            Submit for Verification
          </button>
        </form>
      </div>
    </Shell>
  );
}
