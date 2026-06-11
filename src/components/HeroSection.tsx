import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CREATORS = ["Writers", "Designers", "Photographers", "Developers", "Videographers", "Traders"];

const Hero = () => {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [creatorIndex, setCreatorIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });
      if (!error && count !== null) setUserCount(count);
    };
    fetchCount();
  }, []);

  useEffect(() => {
    if (userCount === null) return;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setAnimatedCount(Math.floor(progress * userCount));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [userCount]);

  // Rotate creator types
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCreatorIndex((i) => (i + 1) % CREATORS.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">

      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-200 rounded-full mb-8">
        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
        <span className="text-orange-700 text-sm font-medium">For creators who mean business</span>
      </div>

      {/* Rotating creator type */}
      <div className="mb-4 h-10 flex items-center justify-center">
        <span
          className="text-2xl font-semibold text-orange-600 transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0, fontFamily: "'Playfair Display', serif" }}
        >
          {CREATORS[creatorIndex]}
        </span>
      </div>

      {/* Main headline */}
      <h1
        className="text-5xl sm:text-6xl md:text-7xl font-bold text-stone-900 leading-tight mb-6"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        A portfolio that works<br />
        <span className="text-orange-600">as hard as you do.</span>
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        Build a professional portfolio in 10 minutes — no code, no designer,
        no $300/year fees. Just your work, finally visible.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        <Link to="/templates">
          <button className="bg-stone-900 hover:bg-stone-700 text-white px-8 py-4 rounded-xl font-semibold text-base transition shadow-sm">
            Build mine free →
          </button>
        </Link>
        <a href="#HowItWorks">
          <button className="border border-stone-300 hover:border-stone-400 text-stone-700 px-8 py-4 rounded-xl font-semibold text-base transition">
            See how it works
          </button>
        </a>
      </div>

      {/* Social proof */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex -space-x-2">
          {["bg-pink-400", "bg-blue-400", "bg-amber-400", "bg-emerald-400", "bg-violet-400"].map((c, i) => (
            <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-stone-50`} />
          ))}
        </div>
        <p className="text-stone-500 text-sm">
          <span className="font-bold text-stone-800">{animatedCount > 0 ? `${animatedCount}+` : "..."}</span> creators signed up
        </p>
      </div>

      {/* Product mockup */}
      <div className="mt-16 relative">
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-md max-w-4xl mx-auto">
          {/* Browser chrome */}
          <div className="bg-stone-100 border-b border-stone-200 px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-xs mx-auto">
              <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-stone-400 text-xs font-mono truncate">porfilr.com/p/your-name</span>
            </div>
          </div>
          {/* Portfolio preview */}
          <div className="bg-stone-50 p-8 md:p-12 flex flex-col md:flex-row items-start gap-8 text-left">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center text-white font-bold text-sm">JD</div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">Jordan Davis</p>
                  <p className="text-stone-500 text-xs">Brand Designer · New York</p>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                I design brands that people remember.
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-5">5 years crafting visual identities for startups and Fortune 500s. Available for new projects.</p>
              <div className="flex gap-2">
                <span className="bg-stone-900 text-white text-xs px-3 py-1.5 rounded-lg font-medium">View work</span>
                <span className="border border-stone-300 text-stone-600 text-xs px-3 py-1.5 rounded-lg font-medium">Get in touch</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0 w-full md:w-64">
              {[
                { bg: "bg-blue-100", label: "Brand Identity" },
                { bg: "bg-orange-100", label: "Web Design" },
                { bg: "bg-emerald-100", label: "Packaging" },
                { bg: "bg-violet-100", label: "Motion" },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl aspect-square flex items-end p-2`}>
                  <span className="text-[10px] font-semibold text-stone-600 bg-white/80 px-1.5 py-0.5 rounded">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Floating badge */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
          Built in 8 minutes — no code needed
        </div>
      </div>

      {/* Divider label */}
      <div className="mt-24 flex items-center gap-4">
        <div className="flex-1 h-px bg-stone-200"></div>
        <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">Choose a template. Make it yours.</span>
        <div className="flex-1 h-px bg-stone-200"></div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
