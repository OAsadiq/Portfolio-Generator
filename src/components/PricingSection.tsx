import { Link } from "react-router-dom";

const PricingSection = () => {
  return (
    <div className="bg-gray-100 py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Simple Pricing for Freelance Writers
        </h2>

        <p className="text-base md:text-lg text-gray-600 mt-2">
          Start free, upgrade when you need custom domains and advanced features.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl md:text-4xl font-extrabold text-gray-900">
                $0<span className="text-lg font-normal">/forever</span>
              </h3>
              <div className="px-2 py-1 text-xs bg-yellow-100 text-yellow-500 border border-yellow-400 rounded-2xl font-semibold">
                Free Plan
              </div>
            </div>

            <p className="text-gray-600 mt-2">
              Everything you need to start landing writing clients today.
            </p>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>✓ Writer-focused templates</li>
              <li>✓ Up to 5 writing samples</li>
              <li>✓ Client testimonials section</li>
              <li>✓ Free hosting with unique URL</li>
              <li>✓ Mobile-optimized design</li>
            </ul>

            <Link to="/templates">
              <button className="mt-8 w-full bg-black text-white py-3 rounded-lg hover:bg-yellow-500 hover:text-gray-800">
                Start Free
              </button>
            </Link>
            
          </div>

          {/* Pro Plan */}
          <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 text-left border-2 border-yellow-400">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl md:text-4xl font-extrabold text-gray-900">
                $19<span className="text-lg font-normal">/month</span>
              </h3>
              <div className="px-2 py-1 text-xs bg-yellow-100 text-yellow-500 border border-yellow-400 rounded-2xl font-semibold">
                Pro Plan
              </div>
            </div>

            <p className="text-gray-600 mt-2">
              For professional writers who want their own domain and analytics.
            </p>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>✓ Everything in Free</li>
              <li>✓ Custom domain (yourname.com)</li>
              <li>✓ Unlimited writing samples</li>
              <li>✓ Portfolio analytics</li>
              <li>✓ Remove "Made with" footer</li>
              <li>✓ Priority support</li>
            </ul>

            <button className="mt-8 w-full bg-gray-300 text-gray-800 py-3 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          💡 Start with the free plan. Upgrade only when you need a custom domain.
        </p>
      </div>
    </div>
  );
};

export default PricingSection;