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

      {/* Divider label */}
      <div className="mt-20 flex items-center gap-4">
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
