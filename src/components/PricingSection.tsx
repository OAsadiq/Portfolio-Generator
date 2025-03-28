const PricingSection = () => {
  return (
    <div className="bg-gray-100 py-20">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900">Simple Pricing, Powerful Portfolio Features</h2>
        <p className="text-lg text-gray-600 mt-2">Unlock the full potential of your portfolio with our premium plans.</p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white shadow-lg rounded-2xl p-8 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-extrabold text-gray-900">$0<span className="text-xl font-normal">/year</span></h3>
              <div className="px-2 py-1 w-fit h-fit text-xs mb-2 bg-yellow-100 text-yellow-500 border border-yellow-400 rounded-2xl font-semibold transition cursor-pointer">
                Free Plan
              </div>
            </div>
            <p className="text-md text-gray-600 mt-2">Start for free and create your personalized portfolio today!</p>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>✓ Access to basic templates</li>
              <li>✓ Limited customizations</li>
              <li>✓ Free hosting (with subdomain)</li>
            </ul>

            <button className="mt-8 w-full bg-black text-white py-3 rounded-lg hover:bg-yellow-500">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white shadow-lg rounded-2xl p-8 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-4xl font-extrabold text-gray-900">$99<span className="text-xl font-normal">/year</span></h3>
              <div className="px-2 py-1 w-fit h-fit text-xs mb-2 bg-yellow-100 text-yellow-500 border border-yellow-400 rounded-2xl font-semibold transition cursor-pointer">
                Pro Plan
              </div>
            </div>
            <p className="text-md text-gray-600 mt-2">Upgrade to Pro and access advanced portfolio features.</p>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>✓ Access to all premium templates</li>
              <li>✓ Custom domain support</li>
              <li>✓ Enhanced design customization</li>
              <li>✓ Priority email support</li>
            </ul>

            <button className="mt-8 w-full bg-gray-300 text-gray-800 py-3 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
