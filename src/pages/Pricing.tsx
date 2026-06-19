/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import { track } from "../lib/track";

const CHECK = (
  <svg className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const CROSS = (
  <svg className="w-4 h-4 text-stone-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const TICK = (
  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const PricingPage = () => {
  const { user, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleUpgrade = async () => {
    if (!user) {
      sessionStorage.setItem('pendingUpgrade', 'true');
      await signInWithGoogle();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const priceId = import.meta.env.VITE_STRIPE_PRO_PRICE_ID;
      if (!priceId) throw new Error('Please contact support.');
      track('checkout_started', { source: 'pricing_page' });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'create-checkout-session', priceId, userId: user.id, userEmail: user.email }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        let msg = "Failed to start checkout";
        try { msg = JSON.parse(errorText).error || msg; } catch { msg = errorText || msg; }
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

  const faqs = [
    { q: "Do I need coding skills?", a: "Nope! Zero coding required. If you can fill out a form, you can build a portfolio with Porfilr." },
    { q: "Can I use my own domain?", a: "Yes! Pro plan includes custom domain support (yourname.com). Free plan gives you a yourname.porfilr.com URL." },
    { q: "How long does setup take?", a: "Most people finish in under 10 minutes. Pick a template, add your work, publish. That's it." },
    { q: "Can I update my portfolio later?", a: "Absolutely! Update anytime. Add new articles, change your bio, update testimonials — all in real-time." },
    { q: "What's included in the free plan?", a: "One portfolio with our Minimal template, up to 3 work samples, free hosting, and a yourname.porfilr.com URL. Forever free. No credit card required." },
    { q: "How is this different from Squarespace?", a: "Squarespace tries to do everything. We do one thing — make your work look great — with clean templates, relevant sections, and a fraction of the cost." },
    { q: "Is it really a one-time payment?", a: "Yes — pay $19 once and Pro is yours forever. No subscription, no monthly fees, no renewals. Your free plan stays free too." },
    { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee on Pro plans. Not happy? Full refund, no questions asked." },
    { q: "Is my portfolio mobile-friendly?", a: "100%! All templates are fully responsive and optimized for mobile, tablet, and desktop." },
  ];

  const tableRows = [
    { label: "Setup Time", porfilr: <span className="text-green-600 font-semibold text-sm">10 minutes</span>, sq: "3–5 days", wp: "20+ hours", gd: "5 minutes" },
    { label: "Cost", porfilr: <span className="text-green-600 font-semibold text-sm">$0–$19 once</span>, sq: "$300+/yr", wp: "$200+/yr", gd: "Free" },
    { label: "No Coding", porfilr: TICK, sq: "Sometimes", wp: "Often", gd: TICK },
    { label: "Built for Creatives", porfilr: TICK, sq: CROSS, wp: CROSS, gd: CROSS },
    { label: "Professional Look", porfilr: TICK, sq: TICK, wp: "Maybe", gd: CROSS },
    { label: "Custom Domain", porfilr: <span className="text-green-600 font-semibold text-sm">Included (Pro)</span>, sq: "$25+/mo", wp: "$17+/mo", gd: CROSS },
  ];

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Header */}
      <Navbar />
      {/* <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-stone-900 font-bold text-xl tracking-tight">
            Porfil<span className="text-orange-600">r</span>
          </Link>
          <Link to="/" className="text-stone-500 hover:text-stone-800 text-sm transition">
            ← Back to Home
          </Link>
        </div>
      </header> */}

      {/* Hero */}
      <section className="py-14 md:py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold rounded-full mb-5">
            Pricing
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4 leading-tight">
            Start Free. Upgrade When<br className="hidden sm:block" /> Clients Start Paying You
          </h1>
          <p className="text-stone-500 text-base md:text-lg max-w-xl mx-auto">
            No credit card required to start. Build your portfolio in 10 minutes and land your first client before paying us a dollar.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-8 max-w-lg mx-auto bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto hover:opacity-60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="bg-white border border-stone-200 rounded-2xl p-8 hover:border-stone-300 transition">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-1">Free</h3>
                  <p className="text-stone-500 text-sm">Perfect for getting started</p>
                </div>
                <span className="px-3 py-1 text-xs bg-stone-100 text-stone-600 border border-stone-200 rounded-full font-semibold">Forever Free</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-stone-900">$0</span>
                <span className="text-stone-400 text-base ml-1">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["1 portfolio with Minimal template", "3 work samples", "Free hosting with unique URL", "Client testimonials section", "Mobile-optimized design"].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-stone-700">{CHECK}{f}</li>
                ))}
              </ul>
              <Link to="/templates">
                <button className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 py-3 rounded-xl font-semibold text-sm transition">
                  Start Free
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-white border-2 border-orange-500 rounded-2xl p-8 shadow-lg shadow-orange-100">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-orange-600 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-md">
                  ⭐ Most Popular
                </div>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-1">Pro</h3>
                  <p className="text-stone-500 text-sm">For professionals & creatives</p>
                </div>
                <span className="px-3 py-1 text-xs bg-orange-50 text-orange-600 border border-orange-100 rounded-full font-semibold">Best Value</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-stone-900">$19</span>
                <span className="text-stone-400 text-base ml-1">one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free, plus:",
                  "All premium templates (Modern, Professional)",
                  "Custom domain support (yourname.com)",
                  "Portfolio view analytics",
                  'Remove "Made with Porfilr" branding',
                  "Priority support",
                ].map((f, i) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${i === 0 ? 'font-semibold text-stone-900' : 'text-stone-700'}`}>{CHECK}{f}</li>
                ))}
              </ul>
              <button onClick={handleUpgrade} disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Loading..." : "Upgrade to Pro"}
              </button>
            </div>
          </div>

          <p className="text-stone-400 text-sm text-center mt-6">
            Start with the free plan. Upgrade anytime to unlock pro features.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-14 px-4 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold rounded-full mb-4">
              Why Porfilr?
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-stone-900 mb-3">
              Stop Overpaying for Generic Website Builders
            </h2>
            <p className="text-stone-500 text-sm md:text-base max-w-xl mx-auto">
              Squarespace and Wix try to be everything for everyone. Porfilr is built to make your work look great.
            </p>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0 pb-2">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <div className="overflow-hidden border border-stone-200 rounded-2xl">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="text-left py-3 px-4 text-stone-500 font-semibold text-xs sticky left-0 bg-stone-50 min-w-[130px]">Feature</th>
                      <th className="text-center py-3 px-4 min-w-[110px]">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 inline-block">
                          <span className="text-orange-600 font-bold text-xs">Porfilr</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 text-stone-400 font-semibold text-xs min-w-[110px]">Squarespace</th>
                      <th className="text-center py-3 px-4 text-stone-400 font-semibold text-xs min-w-[100px]">WordPress</th>
                      <th className="text-center py-3 px-4 text-stone-400 font-semibold text-xs min-w-[110px]">Google Drive</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-100">
                    {tableRows.map((row, i) => (
                      <tr key={i} className="hover:bg-stone-50 transition">
                        <td className="py-3 px-4 text-stone-700 text-xs font-medium sticky left-0 bg-white">{row.label}</td>
                        <td className="py-3 px-4 text-center">{typeof row.porfilr === 'string' ? <span className="text-stone-600 text-xs">{row.porfilr}</span> : row.porfilr}</td>
                        <td className="py-3 px-4 text-center">{typeof row.sq === 'string' ? <span className="text-stone-400 text-xs">{row.sq}</span> : row.sq}</td>
                        <td className="py-3 px-4 text-center">{typeof row.wp === 'string' ? <span className="text-stone-400 text-xs">{row.wp}</span> : row.wp}</td>
                        <td className="py-3 px-4 text-center">{typeof row.gd === 'string' ? <span className="text-stone-400 text-xs">{row.gd}</span> : row.gd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-stone-400 text-sm mb-4">Stop fighting with tools built to do everything. Use one built to showcase your work.</p>
            <Link to="/templates">
              <button className="bg-orange-600 hover:bg-orange-500 text-white px-7 py-3 rounded-xl font-bold text-sm transition">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full mb-4">Questions?</span>
            <h2 className="text-2xl md:text-4xl font-bold text-stone-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-stone-500 text-sm">Everything you need to know about Porfilr</p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 transition">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                >
                  <span className="text-stone-900 font-semibold text-sm pr-2">{faq.q}</span>
                  <svg className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 pb-4">
                    <p className="text-stone-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8 p-5 bg-white border border-stone-200 rounded-xl">
            <p className="text-stone-600 text-sm mb-2">Still have questions?</p>
            <a href="mailto:support@porfilr.com" className="text-orange-600 hover:text-orange-500 font-semibold text-sm transition">
              support@porfilr.com
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 px-4 bg-white border-t border-stone-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-stone-900 mb-4 leading-tight">
            Ready to Build Your Portfolio?
          </h2>
          <p className="text-stone-500 text-base mb-8 max-w-lg mx-auto">
            Start free, upgrade when you're making money.
          </p>
          <Link to="/templates">
            <button className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-base transition">
              Start Building Free →
            </button>
          </Link>
          <p className="text-stone-400 text-xs mt-4">One-time payment · 10-minute setup · Yours forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-stone-400 border-t border-stone-200 py-6">
        © 2025{' '}
        <a href="https://porfilr.com" className="hover:text-orange-600 transition">Porfilr</a>
        {' · '}
        <a href="/contact" className="hover:text-orange-600 transition">Contact</a>
        {' · '}
        <a href="/privacy-policy" className="hover:text-orange-600 transition">Privacy Policy</a>
      </footer>
    </div>
  );
};

export default PricingPage;
