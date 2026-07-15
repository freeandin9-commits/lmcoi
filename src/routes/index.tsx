import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import heroImg from "@/assets/hero-snacks.jpg";
import catChips from "@/assets/cat-chips.jpg";
import catMurukku from "@/assets/cat-murukku.jpg";
import catBakery from "@/assets/cat-bakery.jpg";
import catAchappam from "@/assets/cat-achappam.jpg";
import catMixture from "@/assets/cat-mixture.jpg";
import catPickle from "@/assets/cat-pickle.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

// ---- Products / data --------------------------------------------------------
type Product = { id: string; name: string; weight: string; price: number; img: string; category: string };

const products: Product[] = [
  { id: "chips-250", name: "Kerala Banana Chips", weight: "250g", price: 180, img: catChips, category: "Chips" },
  { id: "murukku-200", name: "Handmade Murukku", weight: "200g", price: 160, img: catMurukku, category: "Savoury" },
  { id: "puffs-6", name: "Fresh Baked Puffs", weight: "Pack of 6", price: 120, img: catBakery, category: "Bakery" },
  { id: "achappam-200", name: "Achappam Classic", weight: "200g", price: 150, img: catAchappam, category: "Sweet" },
  { id: "mixture-250", name: "Kerala Mixture", weight: "250g", price: 140, img: catMixture, category: "Savoury" },
  { id: "pickle-lime", name: "Homemade Lime Pickle", weight: "300g", price: 220, img: catPickle, category: "Pickle" },
  { id: "chips-500", name: "Family Pack Banana Chips", weight: "500g", price: 340, img: catChips, category: "Chips" },
  { id: "murukku-500", name: "Murukku Party Pack", weight: "500g", price: 300, img: catMurukku, category: "Savoury" },
];

const categories = [
  { name: "Banana Chips", desc: "Nendran chips fried fresh in coconut oil.", img: catChips },
  { name: "Murukku", desc: "Crisp spirals of rice & urad, hand-pressed.", img: catMurukku },
  { name: "Bakery", desc: "Puffs, rusk & cookies from our morning oven.", img: catBakery },
  { name: "Achappam", desc: "Rose-shaped tea-time crisps, lightly sweet.", img: catAchappam },
  { name: "Kerala Mixture", desc: "Spiced sev, peanuts & curry leaves.", img: catMixture },
  { name: "Pickles", desc: "Small-batch lime, mango & gooseberry.", img: catPickle },
];

const WHATSAPP_NUMBER = "919999999999"; // change to real number

// ---- Cart state -------------------------------------------------------------
type CartItem = { id: string; qty: number };
const STORAGE_KEY = "lm-cart-v1";

function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  const add = (id: string) => setItems((prev) => {
    const existing = prev.find((p) => p.id === id);
    return existing ? prev.map((p) => p.id === id ? { ...p, qty: p.qty + 1 } : p) : [...prev, { id, qty: 1 }];
  });
  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const setQty = (id: string, qty: number) => setItems((prev) => qty <= 0 ? prev.filter(p => p.id !== id) : prev.map(p => p.id === id ? { ...p, qty } : p));
  const clear = () => setItems([]);

  const detailed = useMemo(() => items.map(i => {
    const p = products.find(p => p.id === i.id)!;
    return { ...p, qty: i.qty, subtotal: p.price * i.qty };
  }), [items]);
  const total = detailed.reduce((s, i) => s + i.subtotal, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return { items, detailed, total, count, add, remove, setQty, clear };
}

// ---- Icons ------------------------------------------------------------------
const BagIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
);

// ---- Page -------------------------------------------------------------------
function Home() {
  const cart = useCart();
  const [open, setOpen] = useState(false);

  const checkout = () => {
    if (cart.detailed.length === 0) return;
    const lines = cart.detailed.map(i => `• ${i.name} (${i.weight}) × ${i.qty} — ₹${i.subtotal}`).join("\n");
    const msg = `Hi LM Snacks & Bakery! I'd like to order:\n\n${lines}\n\nTotal: ₹${cart.total}\n\nPlease confirm delivery details. Thank you!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top strip */}
      <div className="bg-primary text-primary-foreground text-xs sm:text-sm">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
          <span>Free shipping on orders above ₹500 · Baked fresh daily</span>
          <span className="hidden sm:inline opacity-80">FSSAI Lic : 21320374</span>
        </div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/85 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-serif text-lg">LM</span>
            <span className="leading-tight">
              <span className="block font-serif text-lg">LM Snacks & Bakery</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Kerala · Since 1998</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#shop" className="hover:text-primary transition">Shop</a>
            <a href="#products" className="hover:text-primary transition">Products</a>
            <a href="#story" className="hover:text-primary transition">Our Story</a>
            <a href="#contact" className="hover:text-primary transition">Contact</a>
          </nav>
          <button
            onClick={() => setOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            <BagIcon />
            <span className="hidden sm:inline">Cart</span>
            {cart.count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-accent text-accent-foreground text-[11px] font-bold">
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-20 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Handmade in Kerala
            </span>
            <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[1.02] text-balance">
              Snack neram, <br />
              <em className="text-primary not-italic italic">baked fresh</em> for you.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Nendran banana chips, murukku, achappam, hot puffs and small-batch pickles — made the old way, packed the day they're made, delivered across Kerala.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#products" className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition">
                Order now
              </a>
              <a href="#story" className="inline-flex items-center rounded-full border border-primary/20 px-6 py-3 text-sm font-medium hover:bg-secondary transition">
                Our story
              </a>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              <div><div className="font-serif text-3xl text-primary">1998</div><div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Est.</div></div>
              <div><div className="font-serif text-3xl text-primary">50k+</div><div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Happy homes</div></div>
              <div><div className="font-serif text-3xl text-primary">40+</div><div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Snacks</div></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-accent/20 blur-2xl" aria-hidden />
            <img src={heroImg} alt="Kerala snacks flatlay" width={1600} height={1200}
              className="relative rounded-[1.5rem] shadow-2xl object-cover w-full aspect-[4/3]" />
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl px-5 py-4 shadow-lg hidden md:block">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Fried today</div>
              <div className="font-serif text-lg">Ships tomorrow</div>
            </div>
          </div>
        </div>
      </section>

      {/* Strip */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["Coconut oil", "No palm, no shortcuts"],
            ["Free over ₹500", "Across Kerala"],
            ["FSSAI certified", "Small-batch made"],
            ["Fresh weekly", "Baked the day it ships"],
          ].map(([t, s]) => (
            <div key={t}>
              <div className="font-serif text-lg">{t}</div>
              <div className="text-xs text-muted-foreground mt-1">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="shop" className="mx-auto max-w-7xl px-4 py-20 md:py-24">
        <div className="mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-accent">Menu</span>
          <h2 className="mt-2 font-serif text-4xl md:text-5xl">Shop by category</h2>
          <p className="mt-3 text-muted-foreground max-w-md">Every Kerala tea-time craving, covered.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <a key={c.name} href="#products" className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:shadow-xl transition">
              <img src={c.img} alt={c.name} loading="lazy" width={800} height={800}
                className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6">
                <h3 className="font-serif text-2xl text-white">{c.name}</h3>
                <p className="text-sm text-white/85 mt-1">{c.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-accent">Order online</span>
            <h2 className="mt-2 font-serif text-4xl md:text-5xl">Our products</h2>
            <p className="mt-3 text-muted-foreground">Add to cart, checkout on WhatsApp. We'll confirm your order and delivery details right away.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => {
              const inCart = cart.items.find(i => i.id === p.id);
              return (
                <div key={p.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition flex flex-col">
                  <div className="overflow-hidden">
                    <img src={p.img} alt={p.name} loading="lazy" width={800} height={800}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.weight}</div>
                    <h3 className="font-serif text-xl mt-1">{p.name}</h3>
                    <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                      <span className="font-serif text-lg text-primary">₹{p.price}</span>
                      {inCart ? (
                        <div className="inline-flex items-center gap-2 border border-border rounded-full px-1 py-1">
                          <button onClick={() => cart.setQty(p.id, inCart.qty - 1)} className="h-7 w-7 rounded-full hover:bg-secondary" aria-label="Decrease">−</button>
                          <span className="min-w-5 text-center text-sm font-medium">{inCart.qty}</span>
                          <button onClick={() => cart.setQty(p.id, inCart.qty + 1)} className="h-7 w-7 rounded-full hover:bg-secondary" aria-label="Increase">+</button>
                        </div>
                      ) : (
                        <button onClick={() => { cart.add(p.id); setOpen(true); }}
                          className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-medium hover:opacity-90 transition">
                          Add +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="mx-auto max-w-7xl px-4 py-20 md:py-24 grid md:grid-cols-2 gap-14 items-center">
        <img src={catBakery} alt="LM Bakery" loading="lazy" width={800} height={800}
          className="rounded-[1.5rem] shadow-xl w-full aspect-[4/5] object-cover" />
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-accent">Our story</span>
          <h2 className="mt-2 font-serif text-4xl md:text-5xl">Three generations of a Kerala kitchen.</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            LM started in 1998 as a small bakery on a quiet Kerala lane — one wood oven, one recipe book, and a family that refused to cut corners. Today we still fry in pure coconut oil, still knead the dough by hand, and still pack every order the day it's made.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            No preservatives. No palm oil. Just the same tea-time you grew up with — now delivered to your door.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-24 text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-balance">A snack box, from our kitchen to yours.</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">Order online and we'll confirm on WhatsApp. Fresh, packed and delivered across Kerala.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition">Call to order</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="inline-flex items-center rounded-full border border-primary-foreground/30 px-6 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition">WhatsApp us</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-serif">LM</span>
              <span className="font-serif text-lg">LM Snacks & Bakery</span>
            </div>
            <p className="mt-4 text-muted-foreground max-w-sm">Handmade Kerala snacks and bakery favourites, made fresh every single day since 1998.</p>
          </div>
          <div>
            <div className="font-serif text-base mb-3">Shop</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#products" className="hover:text-primary">Banana Chips</a></li>
              <li><a href="#products" className="hover:text-primary">Murukku</a></li>
              <li><a href="#products" className="hover:text-primary">Bakery</a></li>
              <li><a href="#products" className="hover:text-primary">Pickles</a></li>
            </ul>
          </div>
          <div>
            <div className="font-serif text-base mb-3">Visit</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>Main Road, Kerala</li>
              <li>Open · 7am – 9pm</li>
              <li>+91 99999 99999</li>
              <li>hello@lmbakery.in</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-5 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
            <span>© {new Date().getFullYear()} LM Snacks & Bakery. All rights reserved.</span>
            <span>FSSAI Lic : 21320374</span>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div>
              <div className="font-serif text-xl">Your cart</div>
              <div className="text-xs text-muted-foreground">{cart.count} item{cart.count === 1 ? "" : "s"}</div>
            </div>
            <button onClick={() => setOpen(false)} className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary" aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.detailed.length === 0 ? (
              <div className="h-full grid place-items-center text-center py-16">
                <div>
                  <BagIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-4 font-serif text-lg">Cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your favourite snacks to get started.</p>
                  <button onClick={() => setOpen(false)} className="mt-6 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm">Browse products</button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {cart.detailed.map(i => (
                  <li key={i.id} className="py-4 flex gap-4">
                    <img src={i.img} alt={i.name} className="h-20 w-20 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">{i.weight}</div>
                      <div className="font-serif text-base">{i.name}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 border border-border rounded-full px-1 py-1">
                          <button onClick={() => cart.setQty(i.id, i.qty - 1)} className="h-7 w-7 rounded-full hover:bg-secondary">−</button>
                          <span className="min-w-5 text-center text-sm font-medium">{i.qty}</span>
                          <button onClick={() => cart.setQty(i.id, i.qty + 1)} className="h-7 w-7 rounded-full hover:bg-secondary">+</button>
                        </div>
                        <div className="font-serif text-primary">₹{i.subtotal}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cart.detailed.length > 0 && (
            <div className="border-t border-border p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-serif text-lg">₹{cart.total}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {cart.total >= 500 ? "🎉 You've unlocked free shipping across Kerala." : `Add ₹${500 - cart.total} more for free shipping.`}
              </div>
              <button
                onClick={checkout}
                className="w-full rounded-full bg-primary text-primary-foreground py-3 font-medium hover:opacity-90 transition"
              >
                Checkout via WhatsApp
              </button>
              <button onClick={cart.clear} className="w-full text-xs text-muted-foreground hover:text-primary">Clear cart</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
