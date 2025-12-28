import { Link } from "react-router-dom";

const PricingSection = () => {
  return (
    <div className="py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-50">
          Simple Pricing for Freelance Writers
        </h2>

        <p className="text-base md:text-lg text-slate-400 mt-2">
          Start free, upgrade when you need custom domains and advanced features.
        </p>

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
              Everything you need to start landing writing clients today.
            </p>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Writer-focused templates
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Up to 5 writing samples
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Client testimonials section
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Free hosting with unique URL
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Mobile-optimized design
              </li>
            </ul>

            <Link to="/templates">
              <button className="mt-8 w-full bg-slate-700 hover:bg-slate-600 text-slate-50 py-3 rounded-lg transition font-semibold">
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
                $19<span className="text-lg font-normal text-slate-400">/month</span>
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
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Remove "Made with" footer
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">✓</span>
                Priority support
              </li>
            </ul>

            <button className="mt-8 w-full bg-slate-600 text-slate-400 py-3 rounded-lg cursor-not-allowed relative z-10 font-semibold">
              Coming Soon
            </button>
          </div>
        </div>

        <p className="text-slate-500 text-sm mt-8">
          💡 Start with the free plan. Upgrade only when you need a custom domain.
        </p>
      </div>
    </div>
  );
};

export default PricingSection;