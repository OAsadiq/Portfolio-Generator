/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PricingSection = () => {
  const { user, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      sessionStorage.setItem("pendingUpgrade", "true");
      await signInWithGoogle();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/stripe/actions`;
      const priceId = import.meta.env.VITE_STRIPE_PRO_PRICE_ID;
      if (!priceId) throw new Error("Please contact support.");
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-checkout-session", priceId, userId: user.id, userEmail: user.email }),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed to start checkout";
        try { msg = JSON.parse(text).error || msg; } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (err: any) {
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-24 px-6 bg-white border-t border-stone-100">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h2
            className="text-4xl md:text-5xl font-bold text-stone-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Start free. Upgrade when you're ready.
          </h2>
          <p className="text-stone-500 text-lg">No trial periods. No credit card required to start.</p>
        </div>

        {/* Comparison callout */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-10 max-w-xl mx-auto">
          <p className="text-stone-500 text-sm mb-3 font-medium">What you'd pay elsewhere:</p>
          <div className="space-y-2">
            {[
              { label: "Squarespace", price: "$300/year" },
              { label: "Hire a designer", price: "$500 one-time" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-stone-400">{r.label}</span>
                <span className="text-stone-600 font-medium">{r.price}</span>
              </div>
            ))}
            <div className="h-px bg-stone-200 my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-600 font-semibold">Porfilr</span>
              <span className="text-orange-600 font-bold">$0–108/year</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-600 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">✕</button>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Free */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">Free</span>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold text-stone-900" style={{ fontFamily: "'Playfair Display', serif" }}>$0</span>
              <span className="text-stone-400 text-sm ml-1">/ forever</span>
            </div>
            <p className="text-stone-500 text-sm mb-6">Perfect for getting your first few clients. Upgrade with your first paycheck.</p>
            <ul className="space-y-3 mb-8">
              {[
                "1 portfolio",
                "Minimal template",
                "Free hosting with unique URL",
                "Contact form",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-stone-700">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/templates">
              <button className="w-full border border-stone-300 hover:bg-stone-100 text-stone-700 py-3 rounded-xl font-semibold text-sm transition">
                Start for free
              </button>
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-stone-900 text-white rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl">
              POPULAR
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">Pro</span>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>$19</span>
              <span className="text-stone-400 text-sm ml-1">one-time</span>
            </div>
            <p className="text-stone-400 text-sm mb-6">For creators who want their own domain and deeper analytics.</p>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Free",
                "All 3 premium templates",
                "Custom domain (yourname.com)",
                "Portfolio analytics",
                "Priority support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-stone-300">
                  <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Upgrade to Pro"}
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <a href="/pricing" className="text-orange-600 hover:text-orange-500 text-sm font-medium">
            See full pricing comparison →
          </a>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
