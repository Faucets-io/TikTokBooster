import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Flame, Rocket, Heart, Eye, Users, Star,
  CheckCircle, ArrowRight, Zap, Shield, Clock,
  TrendingUp, Award, MessageCircle, Play,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import OrderForm from "@/components/OrderForm";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const TICKER_ITEMS = [
  "🔥 10,000+ Orders Delivered",
  "⚡ Instant Delivery Available",
  "✅ 100% Real Accounts",
  "🚀 24/7 Customer Support",
  "💎 Trusted by 5,000+ Nigerian Creators",
  "🎯 Guaranteed Results",
  "🛡️ 100% Safe & Secure",
  "📈 99.8% Completion Rate",
];

const STATS = [
  { icon: "🚀", number: "10,000+", label: "Orders Delivered" },
  { icon: "⭐", number: "4.9 / 5", label: "Average Rating" },
  { icon: "👥", number: "5,000+", label: "Active Creators" },
  { icon: "⚡", number: "< 1 hr", label: "Avg Delivery Time" },
  { icon: "🛡️", number: "100%", label: "Safe & Secure" },
  { icon: "📈", number: "99.8%", label: "Completion Rate" },
];

const SERVICES_DATA = [
  {
    id: "LikesInstant",
    name: "Instant Likes",
    tagline: "High Quality · Instant Delivery",
    price: "₦1,310",
    unit: "per 1,000 likes",
    minOrder: "Min. 1,000",
    icon: Flame,
    color: "#FE2C55",
    hot: true,
    features: ["Delivered within minutes", "Real high-quality accounts", "No password required"],
  },
  {
    id: "ViewsFast",
    name: "Fast Views",
    tagline: "High Quality · Lightning Speed",
    price: "₦1,060",
    unit: "per 2,000 views",
    minOrder: "Min. 2,000",
    icon: Rocket,
    color: "#25F4EE",
    hot: true,
    features: ["Boosts TikTok algorithm", "Starts within minutes", "Premium view quality"],
  },
  {
    id: "Followers",
    name: "Followers",
    tagline: "Steady Growth · Profile Safe",
    price: "₦3,500",
    unit: "per 1,000 followers",
    minOrder: "Min. 1,000",
    icon: Users,
    color: "#A855F7",
    hot: false,
    features: ["Gradual, natural delivery", "Retained accounts", "100% profile-safe"],
  },
  {
    id: "Likes",
    name: "Standard Likes",
    tagline: "Reliable · Good Quality",
    price: "₦500",
    unit: "per 1,000 likes",
    minOrder: "Min. 1,000",
    icon: Heart,
    color: "#FE2C55",
    hot: false,
    features: ["Fast delivery", "Quality accounts", "No password required"],
  },
];

const STEPS = [
  { number: "01", icon: Zap,         title: "Enter Your Link",     desc: "Paste your TikTok video or profile URL into the order form.", color: "#FE2C55" },
  { number: "02", icon: Star,        title: "Choose Your Service", desc: "Select a service type and the quantity you need.",             color: "#25F4EE" },
  { number: "03", icon: Shield,      title: "Pay & Upload Receipt", desc: "Transfer to our PalmPay account and upload your screenshot.",  color: "#A855F7" },
  { number: "04", icon: TrendingUp,  title: "Watch Your Growth",   desc: "Sit back and watch your account grow in real-time.",           color: "#22C55E" },
];

const TESTIMONIALS = [
  { handle: "@david_creates",   avatar: "D", review: "Went from 500 to 50K likes overnight. TikTokBoost is absolutely legit 🔥",          rating: 5, service: "Instant Likes" },
  { handle: "@beauty.ng",       avatar: "B", review: "My view count doubled in 24 hours. Delivery was instant, exactly as promised.",       rating: 5, service: "Fast Views"    },
  { handle: "@tech.naija",      avatar: "T", review: "Best investment I made for my TikTok. Fast, real results. Will order again.",          rating: 5, service: "Followers"     },
  { handle: "@chef_emeka",      avatar: "E", review: "Super fast service and my account is completely safe. 100% recommended!",              rating: 5, service: "Instant Likes" },
  { handle: "@fashion.lagos",   avatar: "F", review: "Ordered 5,000 likes at 9PM, woke up at 6AM and they were all there. Insane speed.", rating: 5, service: "Instant Likes" },
  { handle: "@gamer.abuja",     avatar: "G", review: "I've tried other services but TikTokBoost is on another level. Premium quality.",      rating: 5, service: "Fast Views"    },
  { handle: "@naija.fitness",   avatar: "N", review: "My videos finally started going viral after using this. Genuinely life-changing.",      rating: 5, service: "Fast Views"    },
  { handle: "@music.lagos",     avatar: "M", review: "Got 10,000 views on my new song within 2 hours. Highly recommend TikTokBoost.",       rating: 5, service: "Fast Views"    },
];

const TRUST_BADGES = [
  { icon: Shield,        label: "100% Safe",       desc: "No password required",    color: "#22C55E" },
  { icon: Clock,         label: "Fast Delivery",   desc: "Results within hours",    color: "#25F4EE" },
  { icon: Award,         label: "Premium Quality", desc: "Real, active accounts",   color: "#FE2C55" },
  { icon: MessageCircle, label: "24/7 Support",    desc: "Always here to help",     color: "#A855F7" },
];

/* ─────────────────────────────────────────
   ANNOUNCEMENT BAR
───────────────────────────────────────── */
function AnnouncementBar() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden bg-[#FE2C55] z-50 select-none">
      <div className="flex animate-marquee whitespace-nowrap py-2.5">
        {items.map((item, i) => (
          <span key={i} className="text-white text-[11px] font-bold mx-10 flex-shrink-0 tracking-wide">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center px-4 pt-4">
      <div className={`w-full max-w-4xl flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-2xl border-white/10 shadow-2xl"
          : "bg-white/[0.04] backdrop-blur-md border-white/8"
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <SiTiktok className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-black text-sm tracking-tight">
            TIKTOK<span className="text-[#FE2C55]">BOOST</span>
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-7">
          {[["#services", "Services"], ["#how-it-works", "How It Works"], ["#reviews", "Reviews"]].map(([href, label]) => (
            <a key={href} href={href} className="text-white/45 hover:text-white text-sm font-medium transition-colors duration-200">
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a href="#order">
          <Button
            data-testid="button-nav-cta"
            className="bg-[#FE2C55] hover:bg-[#e02449] text-white font-bold text-xs h-9 px-5 rounded-xl shadow-lg shadow-[#FE2C55]/20 transition-all hover:shadow-[#FE2C55]/30"
          >
            Get Started
          </Button>
        </a>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────── */
function useCounter(target: number, duration = 2000, delay = 400) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const p = Math.min((Date.now() - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          setTimeout(() => requestAnimationFrame(tick), delay);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, delay]);

  return { value, ref };
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function Hero() {
  const c1 = useCounter(10000, 2200, 300);
  const c2 = useCounter(5000, 2600, 300);
  const c3 = useCounter(99, 1800, 300);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-20 overflow-hidden">

      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#FE2C55] rounded-full blur-[220px] opacity-[0.07] animate-glow-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-[#25F4EE] rounded-full blur-[220px] opacity-[0.07] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 dot-grid opacity-100" />
        <div className="absolute inset-0 line-grid opacity-100" />
      </div>

      {/* Floating notification badges */}
      <div className="absolute left-[6%] top-[38%] animate-float hidden lg:block" style={{ animationDelay: "0s" }}>
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="w-9 h-9 rounded-xl bg-[#FE2C55]/20 flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 text-[#FE2C55] fill-[#FE2C55]" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">+4,200</p>
            <p className="text-white/40 text-[10px] mt-0.5">Likes delivered</p>
          </div>
        </div>
      </div>

      <div className="absolute right-[6%] top-[32%] animate-float-delayed hidden lg:block">
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="w-9 h-9 rounded-xl bg-[#25F4EE]/20 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-[#25F4EE]" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">Trending 🔥</p>
            <p className="text-white/40 text-[10px] mt-0.5">#1 in Nigeria</p>
          </div>
        </div>
      </div>

      <div className="absolute left-[8%] bottom-[30%] animate-float-slow hidden lg:block">
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="w-9 h-9 rounded-xl bg-[#A855F7]/20 flex items-center justify-center">
            <Eye className="w-4.5 h-4.5 text-[#A855F7]" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">+24K</p>
            <p className="text-white/40 text-[10px] mt-0.5">Views boosted</p>
          </div>
        </div>
      </div>

      <div className="absolute right-[7%] bottom-[35%] animate-float hidden lg:block" style={{ animationDelay: "2s" }}>
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 flex items-center justify-center">
            <CheckCircle className="w-4.5 h-4.5 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none">Delivered ✓</p>
            <p className="text-white/40 text-[10px] mt-0.5">Order #8,441</p>
          </div>
        </div>
      </div>

      {/* Hero content */}
      <div className="text-center max-w-3xl relative z-10">

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/60 text-xs font-semibold mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          Nigeria's #1 TikTok Growth Platform
        </div>

        {/* Main headline */}
        <h1 className="text-[clamp(2.8rem,8vw,5.5rem)] font-black text-white leading-[0.95] tracking-tight mb-7">
          <span className="block">Grow Your</span>
          <span
            className="block text-glitch tiktok-gradient-text mt-2"
            data-text="TikTok"
            style={{ WebkitTextFillColor: "transparent" }}
          >
            TikTok
          </span>
          <span className="block text-white/90 mt-2">Like A Star ⭐</span>
        </h1>

        <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10 font-medium">
          Real likes, views, and followers — delivered fast. Join over{" "}
          <span className="text-white font-bold">5,000+ Nigerian creators</span> growing their presence every single day.
        </p>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <a href="#order">
            <Button
              data-testid="button-hero-cta"
              className="h-14 px-9 bg-[#FE2C55] hover:bg-[#e02449] text-white font-black text-base rounded-2xl shadow-2xl shadow-[#FE2C55]/30 transition-all hover:scale-[1.03] active:scale-[0.98] gap-2.5"
            >
              Start Growing Now <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <a href="#services">
            <Button
              variant="ghost"
              className="h-14 px-8 text-white/60 hover:text-white hover:bg-white/5 border border-white/10 rounded-2xl font-semibold text-base transition-all gap-2"
            >
              <Play className="w-4 h-4" /> View Services
            </Button>
          </a>
        </div>

        {/* Animated stat counters */}
        <div ref={c1.ref} className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { val: `${c1.value.toLocaleString()}+`, label: "Orders Delivered" },
            { val: `${c2.value.toLocaleString()}+`, label: "Happy Creators"   },
            { val: `${c3.value}%`,                  label: "Delivery Rate"    },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white font-black text-2xl md:text-3xl tracking-tight">{s.val}</p>
              <p className="text-white/30 text-[11px] font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   STATS ROLLING BAR
───────────────────────────────────────── */
function StatsBar() {
  const doubled = [...STATS, ...STATS, ...STATS];
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-white/[0.02] py-7 select-none">
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="flex animate-marquee-slow whitespace-nowrap">
        {doubled.map((s, i) => (
          <div key={i} className="flex items-center gap-4 mx-10 flex-shrink-0">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-white font-black text-xl leading-none">{s.number}</p>
              <p className="text-white/30 text-[11px] font-semibold tracking-wide mt-0.5">{s.label}</p>
            </div>
            <div className="ml-10 w-px h-8 bg-white/8" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SERVICES SECTION
───────────────────────────────────────── */
function Services() {
  return (
    <section id="services" className="py-28 px-4 relative">
      {/* Section label */}
      <div className="text-center mb-16">
        <p className="text-[#FE2C55] text-[10px] font-black uppercase tracking-[0.35em] mb-4">Our Services</p>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Choose Your <span className="tiktok-gradient-text">Growth</span>
        </h2>
        <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
          Every service is built for maximum impact — real results, real accounts, real growth.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {SERVICES_DATA.map((svc) => {
          const Icon = svc.icon;
          return (
            <a key={svc.id} href="#order" className="group block">
              <div className={`relative h-full p-6 rounded-2xl border bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1.5 ${
                svc.hot ? "border-white/12" : "border-white/6"
              }`}
                style={{ boxShadow: "0 0 0 0 transparent" }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{ boxShadow: `inset 0 0 80px ${svc.color}0A` }}
                />

                {/* Top accent line for HOT */}
                {svc.hot && (
                  <div
                    className="absolute top-0 left-8 right-8 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${svc.color}80, transparent)` }}
                  />
                )}

                {/* Header row */}
                <div className="flex items-start justify-between mb-5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${svc.color}18` }}>
                      <Icon className="w-5 h-5" style={{ color: svc.color }} />
                    </div>
                    <div>
                      <p className="text-white font-black text-base leading-tight">{svc.name}</p>
                      <p className="text-white/30 text-xs mt-0.5">{svc.tagline}</p>
                    </div>
                  </div>
                  {svc.hot && (
                    <span
                      className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0"
                      style={{ background: `${svc.color}22`, color: svc.color, border: `1px solid ${svc.color}30` }}
                    >
                      🔥 HOT
                    </span>
                  )}
                </div>

                {/* Price + features */}
                <div className="flex items-end justify-between relative z-10 gap-4">
                  <div>
                    <p className="text-white font-black text-3xl tracking-tight">{svc.price}</p>
                    <p className="text-white/30 text-xs mt-0.5">{svc.unit}</p>
                    <p className="text-white/20 text-[10px] mt-0.5">{svc.minOrder}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {svc.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: svc.color }} />
                        <p className="text-white/40 text-[11px] font-medium">{f}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-between relative z-10">
                  <p className="text-white/25 text-xs">Tap to order this service</p>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#25F4EE] text-[10px] font-black uppercase tracking-[0.35em] mb-4">Simple Process</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            How It <span className="tiktok-gradient-text">Works</span>
          </h2>
          <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
            Four simple steps and you're on your way to going viral.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="group relative p-6 rounded-2xl border border-white/8 bg-white/[0.025] hover:bg-white/[0.05] transition-all duration-300">
                <div
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${step.color}60, transparent)` }}
                />
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${step.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center">
                      <span className="text-white/40 font-black" style={{ fontSize: "8px" }}>{i + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-black text-base mb-1.5">{step.title}</p>
                    <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TESTIMONIALS (dual rolling rows)
───────────────────────────────────────── */
function TestimonialsSection() {
  const row1 = [...TESTIMONIALS, ...TESTIMONIALS];
  const row2 = [...[...TESTIMONIALS].reverse(), ...[...TESTIMONIALS].reverse()];

  const TestimonialCard = ({ t, starColor }: { t: (typeof TESTIMONIALS)[0]; starColor: string }) => (
    <div className="flex-shrink-0 w-72 mx-3">
      <div className="bg-white/[0.035] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${starColor}60, ${starColor}20)`, border: `1px solid ${starColor}30` }}
          >
            {t.avatar}
          </div>
          <div>
            <p className="text-white font-bold text-sm">{t.handle}</p>
            <p className="text-white/30 text-[10px]">{t.service}</p>
          </div>
        </div>
        <div className="flex gap-0.5 mb-2.5">
          {[...Array(t.rating)].map((_, j) => (
            <Star key={j} className="w-3 h-3 fill-[#FE2C55] text-[#FE2C55]" />
          ))}
        </div>
        <p className="text-white/55 text-xs leading-relaxed whitespace-normal">{t.review}</p>
      </div>
    </div>
  );

  return (
    <section id="reviews" className="py-28 overflow-hidden">
      <div className="text-center mb-14 px-4">
        <p className="text-[#FE2C55] text-[10px] font-black uppercase tracking-[0.35em] mb-4">Testimonials</p>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Creators <span className="tiktok-gradient-text">Love Us</span>
        </h2>
        <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
          Real reviews from real Nigerian TikTok creators who trust TikTokBoost.
        </p>
      </div>

      <div className="space-y-4 select-none">
        {/* Row 1 — left to right */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee-slow whitespace-nowrap">
            {row1.map((t, i) => <TestimonialCard key={i} t={t} starColor="#FE2C55" />)}
          </div>
        </div>

        {/* Row 2 — right to left */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee-reverse whitespace-nowrap">
            {row2.map((t, i) => <TestimonialCard key={i} t={t} starColor="#25F4EE" />)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TRUST BADGES
───────────────────────────────────────── */
function TrustSection() {
  return (
    <div className="py-16 px-4 border-t border-white/[0.05]">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {TRUST_BADGES.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className="text-center group">
              <div
                className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110 duration-200"
                style={{ background: `${b.color}15`, border: `1px solid ${b.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: b.color }} />
              </div>
              <p className="text-white font-bold text-sm">{b.label}</p>
              <p className="text-white/30 text-xs mt-0.5">{b.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ORDER SECTION
───────────────────────────────────────── */
function OrderSection() {
  return (
    <section id="order" className="py-20 px-4 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FE2C55]/25 to-transparent" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FE2C55] rounded-full blur-[250px] opacity-[0.04]" />
      </div>

      <div className="max-w-md mx-auto relative z-10">
        <div className="text-center mb-10">
          <p className="text-[#FE2C55] text-[10px] font-black uppercase tracking-[0.35em] mb-3">Place Your Order</p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Ready to Go <span className="tiktok-gradient-text">Viral?</span>
          </h2>
          <p className="text-white/40 text-sm mt-2">Fill in your details below and get started in minutes.</p>
        </div>
        <OrderForm />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
            <SiTiktok className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-black text-sm tracking-tight">
            TIKTOK<span className="text-[#FE2C55]">BOOST</span>
          </span>
        </div>

        <p className="text-white/20 text-xs text-center">
          © 2025 TikTokBoost. Premium growth for Nigerian creators.
        </p>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <p className="text-white/25 text-xs font-medium">All systems operational</p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   PAGE EXPORT
───────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <StatsBar />
      <Services />
      <HowItWorks />
      <TestimonialsSection />
      <TrustSection />
      <OrderSection />
      <Footer />
    </div>
  );
}
