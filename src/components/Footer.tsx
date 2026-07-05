import { useState } from "react";
import { Link } from "react-router-dom";
import { NICHES } from "../pages/niches/nicheConfig";
import { supabase } from "../lib/supabase";
import { track } from "../lib/track";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const subscribe = async () => {
    const value = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setStatus("error"); setMsg("Enter a valid email."); return; }
    setStatus("saving"); setMsg("");
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: value, source: "footer", is_active: true });
      if (error && error.code !== "23505") throw error; // 23505 = already subscribed (treat as success)
      setStatus("done");
      setMsg(error?.code === "23505" ? "You're already subscribed 🎉" : "Subscribed 🎉");
      setEmail("");
      track("newsletter_subscribed", { source: "footer" });
    } catch {
      setStatus("error"); setMsg("Something went wrong. Try again.");
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-400 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div>
            <p className="text-white text-xl font-bold tracking-tight mb-1">
              Porfil<span className="text-orange-500">r</span>
            </p>
            <p className="text-stone-500 text-sm">Your work, finally visible.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
          </div>
        </div>

        {/* Newsletter subscribe — on every page */}
        <div className="border-t border-stone-800 mt-10 pt-8">
          <p className="text-white text-sm font-semibold mb-1">Portfolio tips in your inbox</p>
          <p className="text-stone-500 text-xs mb-3">Occasional tips on building portfolios & winning clients. No spam.</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && subscribe()}
              placeholder="you@example.com"
              disabled={status === "saving"}
              className="flex-1 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 text-sm focus:outline-none focus:border-orange-500 transition"
            />
            <button
              onClick={subscribe}
              disabled={status === "saving"}
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 whitespace-nowrap"
            >
              {status === "saving" ? "…" : "Subscribe"}
            </button>
          </div>
          {msg && <p className={`text-xs mt-2 ${status === "error" ? "text-red-400" : "text-emerald-400"}`}>{msg}</p>}
        </div>

        {/* Built-for niche pages — internal links for SEO + discovery */}
        <div className="border-t border-stone-800 mt-10 pt-8">
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-widest mb-3">Built for</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {NICHES.map(n => (
              <Link key={n.slug} to={`/${n.slug}`} className="text-stone-400 hover:text-white transition">
                {n.niche}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-8 text-center text-xs text-stone-600">
          © 2026 Porfilr. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
