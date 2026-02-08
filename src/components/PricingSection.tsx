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
      sessionStorage.setItem('pendingUpgrade', 'true');
      await signInWithGoogle();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/stripe/actions`;
      const priceId = import.meta.env.VITE_STRIPE_PRO_PRICE_ID;
      
      console.log('Starting checkout with:', {
        apiUrl,
        priceId,
        userId: user.id,
        userEmail: user.email
      });

      if (!priceId) {
        throw new Error('Please contact support.');
      }
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: 'create-checkout-session',
          priceId: priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      console.log(res.status);

      // Check response status BEFORE parsing JSON
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Failed to start checkout";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, use the text or default message
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

  return (
    <div className="py-15 px-6">
      <div className="text-center mb-8">
        <p className="text-slate-400 text-sm">
          ⏰ Average time wasted on WordPress: <span className="text-red-400 font-semibold">20+ hours</span>
        </p>
        <p className="text-slate-400 text-sm">
          ⚡ Average time with Foliobase: <span className="text-green-400 font-semibold">10 minutes</span>
        </p>
      </div>
      <div className="mb-12 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 max-w-2xl mx-auto">
        <p className="text-slate-400 text-sm mb-4">What you'd pay elsewhere:</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Squarespace:</span>
            <span className="text-slate-300 font-semibold">$300/year</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Hire designer:</span>
            <span className="text-slate-300 font-semibold">$500 one-time</span>
          </div>
          <div className="h-px bg-slate-700 my-3"></div>
          <div className="flex justify-between text-sm">
            <span className="text-green-400 font-semibold">Foliobase:</span>
            <span className="text-green-400 font-bold">$0-108/year</span>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-50">
          Start Free. Upgrade When Clients Start Paying You.
        </h2>

        {error && (
          <div className="mt-6 mb-8 max-w-lg mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-red-400">
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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-slate-800/50 border border-slate-700/50 shadow-xl rounded-2xl p-6 md:p-8 text-left backdrop-blur-sm hover:border-slate-600 transition">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl md:text-4xl font-extrabold text-slate-50">
                $0<span className="text-lg font-normal text-slate-400">/forever</span>
              </h3>
              <div className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-2xl font-semibold">
                Free Plan
              </div>
            </div>

            <p className="text-slate-400 mt-2">
              Perfect for getting your first 3 clients. Then upgrade with your first paycheck.
            </p>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Writer-focused template
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                One writing samples
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Free hosting with unique URL
              </li>
            </ul>

            <Link to="/templates">
              <button className="mt-8 w-full bg-slate-700 hover:bg-slate-600 text-slate-50 py-3 rounded-lg transition font-semibold hidden">
                Start Free
              </button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-slate-800/50 border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/10 rounded-2xl p-6 md:p-8 text-left backdrop-blur-sm relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl"></div>

            <div className="flex justify-between items-center relative z-10">
              <h3 className="text-2xl md:text-4xl font-extrabold text-slate-50">
                $9<span className="text-lg font-normal text-slate-400">/month</span>
              </h3>
              <div className="px-2 py-1 text-xs bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 rounded-2xl font-semibold">
                Pro Plan
              </div>
            </div>

            <p className="text-slate-300 mt-2 relative z-10">
              For professional writers who want their own domain and analytics.
            </p>

            <ul className="mt-6 space-y-3 text-slate-300 relative z-10">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Everything in Free
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Custom domain (yourname.com)
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Unlimited writing samples
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Portfolio analytics
              </li>
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-8 w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 py-3 rounded-lg cursor-pointer relative z-10 font-bold shadow-lg shadow-yellow-400/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed hidden"
            >
              {loading ? "Loading..." : "Upgrade Now"}
            </button>
          </div>
        </div>

        <p className="text-slate-500 text-sm mt-8">
          💡 Start with the free plan. Upgrade anytime to unlock pro features.
        </p>
      </div>
    </div>
  );
};

export default PricingSection;