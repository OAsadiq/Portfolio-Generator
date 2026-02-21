/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/PricingPage.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/stripe/actions`;
      const priceId = import.meta.env.VITE_STRIPE_PRO_PRICE_ID;

      if (!priceId) {
        throw new Error('Please contact support.');
      }
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'create-checkout-session',
          priceId: priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Failed to start checkout";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: "Do I need coding skills?",
      a: "Nope! Zero coding required. If you can fill out a form, you can build a portfolio with Foliobase."
    },
    {
      q: "Can I use my own domain?",
      a: "Yes! Pro plan includes custom domain support (yourname.com). Free plan gives you yourname.foliobase.com."
    },
    {
      q: "How long does setup take?",
      a: "Most writers finish in under 10 minutes. Pick a template, add your samples, publish. That's it."
    },
    {
      q: "Can I update my portfolio later?",
      a: "Absolutely! Update your portfolio anytime. Add new articles, change your bio, update testimonials—all in real-time."
    },
    {
      q: "What's included in the free plan?",
      a: "One portfolio with our Minimal template, unlimited writing samples, free hosting, and a yourname.foliobase.com URL. Forever free. No credit card required."
    },
    {
      q: "How is this different from Squarespace?",
      a: "Squarespace is built for everyone (restaurants, photographers, etc.). We're built specifically for writers. No complex menus, no unnecessary features. Just clean templates for showcasing your writing. Plus, we're 3x cheaper."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes! No contracts. Cancel your Pro subscription anytime from your dashboard. Your free plan stays forever."
    },
    {
      q: "Do you offer refunds?",
      a: "We offer a 30-day money-back guarantee on Pro plans. Not happy? Full refund, no questions asked."
    },
    {
      q: "Can I switch from Free to Pro later?",
      a: "Yes! Upgrade anytime with one click. Your portfolio stays the same, you just unlock more features."
    },
    {
      q: "Is my portfolio mobile-friendly?",
      a: "100%! All our templates are fully responsive and optimized for mobile, tablet, and desktop."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 relative overflow-hidden">
      {/* Animated Background Effects */}  
      <div className="fixed inset-0 pointer-events-none">
        {/* 2. Animated Grid Lines */}
        <div className="absolute inset-0">
          {/* Horizontal lines */}
          <div className="absolute inset-0 bg-grid-horizontal"></div>
          {/* Vertical lines */}
          <div className="absolute inset-0 bg-grid-vertical"></div>
          {/* Animated glow on grid */}
          <div className="absolute inset-0 bg-grid-glow"></div>
        </div>

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 shadow-lg shadow-slate-900/20 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-md lg:text-xl font-bold text-slate-50 hover:text-yellow-400 transition"
            >
            Folio<span className="text-yellow-400">base</span>
          </Link>
          <Link to="/">
            <button className="text-slate-400 hover:text-slate-300 text-sm">
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-12 md:py-20 px-4 md:px-12 text-center z-10 relative">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4 md:mb-6">
            <span className="text-yellow-400 text-sm font-semibold">Pricing</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2">
            Start Free. Upgrade When <span className="text-yellow-400">Clients Start Paying You</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-2">
            No credit card required to start. Build your portfolio in 10 minutes and land your first client before paying us a dollar.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-12 px-4 md:px-12 lg:px-24 z-10 relative">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-8 max-w-lg mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-red-400">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-2 hover:text-red-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl p-8 backdrop-blur-sm hover:border-slate-600 transition">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-50 mb-2">Free</h3>
                  <p className="text-slate-400 text-sm">Perfect for getting started</p>
                </div>
                <div className="px-3 py-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full font-semibold">
                  Forever Free
                </div>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-extrabold text-slate-50">$0</span>
                <span className="text-slate-400 text-lg">/forever</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">1 portfolio with Minimal template</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">3 writing samples</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Free hosting with unique URL</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Client testimonials section</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Mobile-optimized design</span>
                </li>
              </ul>

              <Link to="/templates">
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-50 py-3 rounded-lg transition font-semibold">
                  Start Free
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-br from-yellow-500/10 to-slate-800/50 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/10 rounded-2xl p-8 backdrop-blur-sm">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Most Popular
                </div>
              </div>

              <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-slate-50 mb-2">Pro</h3>
                  <p className="text-slate-300 text-sm">For professional writers</p>
                </div>
                <div className="px-3 py-1 text-xs bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 rounded-full font-semibold">
                  Best Value
                </div>
              </div>

              <div className="mb-6 relative z-10">
                <span className="text-5xl font-extrabold text-slate-50">$9</span>
                <span className="text-slate-300 text-lg">/month</span>
              </div>

              <ul className="space-y-4 mb-8 relative z-10">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-200 font-semibold">Everything in Free, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-200">Unlimited portfolios</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-200">All premium templates (Modern, Professional)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-200">Custom domain support (yourname.com)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-200">Portfolio analytics & insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-200">Remove "Made with Foliobase" footer</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-200">Priority support</span>
                </li>
              </ul>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 py-3 rounded-lg font-bold shadow-lg shadow-yellow-400/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed relative z-10"
              >
                {loading ? "Loading..." : "Upgrade to Pro"}
              </button>
            </div>
          </div>

          <p className="text-slate-500 text-sm text-center mt-8">
            💡 Start with the free plan. Upgrade anytime to unlock pro features.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-12 md:py-20 px-4 md:px-12 lg:px-24 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4">
              <span className="text-yellow-400 text-sm font-semibold">Why Foliobase?</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-slate-50 mb-3 md:mb-4 px-4">
              Stop Overpaying for <span className="text-yellow-400">Generic</span> Website Builders
            </h2>
            
            <p className="text-slate-400 text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4">
              Squarespace and Wix are built for restaurants and photographers. Foliobase is built for writers.
            </p>
          </div>

          {/* Mobile: Scroll hint */}
          <div className="md:hidden text-center mb-4">
            <p className="text-slate-500 text-xs flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Scroll to compare
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </p>
          </div>

          {/* Table wrapper with better mobile scroll */}
          <div className="overflow-x-auto -mx-4 md:mx-0 pb-4">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <div className="overflow-hidden border border-slate-700/50 rounded-xl md:rounded-2xl">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                      <th className="text-left py-3 md:py-4 px-3 md:px-4 text-slate-400 font-semibold text-xs md:text-sm sticky left-0 bg-slate-800/95 backdrop-blur-sm z-10 min-w-[120px]">
                        Feature
                      </th>
                      <th className="text-center py-3 md:py-4 px-3 md:px-4 min-w-[110px]">
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-2 md:px-4 py-1.5 md:py-2 inline-block">
                          <span className="text-yellow-400 font-bold text-xs md:text-sm whitespace-nowrap">Foliobase</span>
                        </div>
                      </th>
                      <th className="text-center py-3 md:py-4 px-3 md:px-4 text-slate-400 font-semibold text-xs md:text-sm min-w-[110px] whitespace-nowrap">
                        Squarespace
                      </th>
                      <th className="text-center py-3 md:py-4 px-3 md:px-4 text-slate-400 font-semibold text-xs md:text-sm min-w-[100px] whitespace-nowrap">
                        WordPress
                      </th>
                      <th className="text-center py-3 md:py-4 px-3 md:px-4 text-slate-400 font-semibold text-xs md:text-sm min-w-[110px] whitespace-nowrap">
                        Google Drive
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/20">
                    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                      <td className="py-3 md:py-4 px-3 md:px-4 text-slate-300 text-xs md:text-sm sticky left-0 bg-slate-800/95 backdrop-blur-sm">
                        Setup Time
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span className="text-green-400 font-semibold text-xs md:text-sm whitespace-nowrap">10 minutes</span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center text-slate-500 text-xs md:text-sm whitespace-nowrap">3-5 days</td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center text-slate-500 text-xs md:text-sm whitespace-nowrap">20+ hours</td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center text-slate-500 text-xs md:text-sm whitespace-nowrap">5 minutes</td>
                    </tr>

                    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                      <td className="py-3 md:py-4 px-3 md:px-4 text-slate-300 text-xs md:text-sm sticky left-0 bg-slate-800/95 backdrop-blur-sm">
                        Cost/Year
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span className="text-green-400 font-semibold text-xs md:text-sm whitespace-nowrap">$0-$108</span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center text-slate-500 text-xs md:text-sm whitespace-nowrap">$300+</td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center text-slate-500 text-xs md:text-sm whitespace-nowrap">$200+</td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center text-slate-500 text-xs md:text-sm whitespace-nowrap">Free</td>
                    </tr>

                    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                      <td className="py-3 md:py-4 px-3 md:px-4 text-slate-300 text-xs md:text-sm sticky left-0 bg-slate-800/95 backdrop-blur-sm">
                        Coding Required
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center text-slate-500 text-xs md:text-sm">Sometimes</td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center text-slate-500 text-xs md:text-sm">Often</td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                    </tr>

                    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                      <td className="py-3 md:py-4 px-3 md:px-4 text-slate-300 text-xs md:text-sm sticky left-0 bg-slate-800/95 backdrop-blur-sm">
                        Made for Writers
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                    </tr>

                    <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                      <td className="py-3 md:py-4 px-3 md:px-4 text-slate-300 text-xs md:text-sm sticky left-0 bg-slate-800/95 backdrop-blur-sm">
                        Professional Look
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center text-slate-500 text-xs md:text-sm">Maybe</td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-800/30 transition">
                      <td className="py-3 md:py-4 px-3 md:px-4 text-slate-300 text-xs md:text-sm sticky left-0 bg-slate-800/95 backdrop-blur-sm">
                        Custom Domain
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span className="text-yellow-400 text-[10px] md:text-xs block">Pro plan</span>
                        <span className="text-yellow-400 text-[10px] md:text-xs">($9/mo)</span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span className="text-slate-500 text-[10px] md:text-xs whitespace-nowrap">$25+/mo</span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <span className="text-slate-500 text-[10px] md:text-xs whitespace-nowrap">$17+/mo</span>
                      </td>
                      <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-12 px-4">
            <p className="text-slate-400 text-xs md:text-sm mb-4 md:mb-6">
              Stop fighting with tools made for restaurants. Use one made for writers.
            </p>
            <Link to="/templates">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all transform hover:scale-105">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 md:py-20 px-4 md:px-12 lg:px-24 z-10 relative">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full mb-4">
              <span className="text-blue-400 text-sm font-semibold">Questions?</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-slate-50 mb-3 md:mb-4 px-2">
              Frequently Asked Questions
            </h2>
            
            <p className="text-slate-400 text-sm md:text-base lg:text-lg px-2">
              Everything you need to know about Foliobase
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-slate-800/30 border border-slate-700/50 rounded-lg md:rounded-xl overflow-hidden hover:border-slate-600 transition"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between text-left gap-4"
                >
                  <span className="text-slate-50 font-semibold text-sm md:text-base pr-2">{faq.q}</span>
                  <svg 
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openFaqIndex === index && (
                  <div className="px-4 md:px-6 pb-3 md:pb-4">
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-12 p-4 md:p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <p className="text-slate-300 text-sm md:text-base mb-2 md:mb-3">Still have questions?</p>
            <a href="mailto:hello.foliobase@gmail.com" className="text-yellow-400 hover:text-yellow-300 font-semibold transition text-sm md:text-base break-all">
              hello.foliobase@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-12 md:py-20 px-4 md:px-12 lg:px-24 z-10 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-slate-50 mb-4 md:mb-6 leading-tight px-2">
            Ready to Build Your Portfolio?
          </h2>
          
          <p className="text-slate-400 text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Join us today. Start free, upgrade when you're making money.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-2">
            <Link to="/templates" className="w-full sm:w-auto">
              <button className="cursor-pointer w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all transform hover:scale-105">
                Start Building Free
                <svg className="inline-block ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
          </div>

          <p className="text-slate-500 text-xs md:text-sm mt-4 md:mt-6 px-2">
            No credit card required • 10-minute setup • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-slate-500 bg-slate-900/50 border-t border-slate-800 p-8 backdrop-blur-sm">
        © 2025 <a href="https://foliobase.vercel.app" className="hover:text-yellow-400 hover:underline transition">Foliobase</a> | 
        <a href="/contact" className="ml-2 text-slate-500 hover:text-yellow-400 hover:underline transition">Contact Us</a> | 
        <a href="/privacy-policy" className="ml-2 text-slate-500 hover:text-yellow-400 hover:underline transition">Privacy Policy</a>
      </div>

      {/* CSS Animations and Styles */}
      <style>{`
        /* ===== ANIMATED GRID LINES ===== */
        .bg-grid-horizontal {
          background-image: linear-gradient(
            rgba(148, 163, 184, 0.03) 1px,
            transparent 1px
          );
          background-size: 100% 50px;
          animation: gridMoveVertical 20s linear infinite;
        }

        .bg-grid-vertical {
          background-image: linear-gradient(
            90deg,
            rgba(148, 163, 184, 0.03) 1px,
            transparent 1px
          );
          background-size: 50px 100%;
          animation: gridMoveHorizontal 20s linear infinite;
        }

        .bg-grid-glow {
          background: 
            radial-gradient(
              circle at 20% 30%,
              rgba(251, 191, 36, 0.03) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(59, 130, 246, 0.03) 0%,
              transparent 50%
            );
          animation: glowPulse 8s ease-in-out infinite;
        }

        @keyframes gridMoveVertical {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 50px;
          }
        }

        @keyframes gridMoveHorizontal {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 0;
          }
        }

        /* ===== ACCESSIBILITY ===== */
        @media (prefers-reduced-motion: reduce) {
          .animate-blob,
          .animate-draw,
          .animate-pulse-slow,
          .bg-grid-horizontal,
          .bg-grid-vertical,
          .bg-grid-glow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PricingPage;