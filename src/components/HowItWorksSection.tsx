const HowItWorks = () => {
  const sectionId = "HowItWorks";

  return (
    <div id={sectionId} className="py-16 md:py-20 px-4 md:px-8 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4">
            <span className="text-yellow-400 text-sm font-semibold">How It Works</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-50 mb-4">
            10 Minutes From Now, You'll Have a Portfolio
          </h2>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Most writers spend 3 weeks on this. You'll be done by lunch.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {/* Step 1: Choose Template - Top Left */}
          <div className="group relative bg-gradient-to-br from-purple-500/5 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 md:p-8 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
            {/* Background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl group-hover:bg-purple-400/20 transition-all duration-500"></div>

            <div className="relative z-10">
              {/* Step Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                  <span className="text-purple-300 text-xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-slate-50 font-bold text-lg md:text-xl">Choose Your Template</h3>
                  <p className="text-purple-400 text-sm font-semibold">⏱️ 30 seconds</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm md:text-base mb-6 leading-relaxed">
                Pick a template. Takes 30 seconds.
              </p>

              {/* Mini Template Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 hover:border-purple-500/30 transition-all group/card">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full mb-2"></div>
                  <div className="h-1.5 bg-slate-700 rounded w-12 mb-1"></div>
                  <div className="h-1 bg-slate-700/50 rounded w-16"></div>
                  <div className="mt-2 space-y-1">
                    <div className="h-0.5 bg-slate-700/30 rounded"></div>
                    <div className="h-0.5 bg-slate-700/30 rounded w-3/4"></div>
                  </div>
                  <div className="mt-2">
                    <p className="text-[8px] text-slate-500 font-semibold">Minimal Writer</p>
                    <p className="text-[6px] text-slate-600">Perfect for: Blog writers, journalists</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 hover:border-purple-500/30 transition-all group/card">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-2 border border-blue-400/30"></div>
                  <div className="h-1.5 bg-blue-500/20 rounded w-12 mb-1"></div>
                  <div className="h-1 bg-slate-700/50 rounded w-16"></div>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <div className="h-4 bg-slate-700/30 rounded"></div>
                    <div className="h-4 bg-slate-700/30 rounded"></div>
                  </div>
                  <div className="mt-2 text-[8px] text-slate-500 font-semibold">Professional</div>
                </div>
              </div>

              {/* Stat */}
              <div className="mt-6 flex items-center gap-2 text-xs text-purple-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold">100+ writers chose these templates</span>
              </div>
            </div>
          </div>

          {/* Step 2: Fill Form - Top Right */}
          <div className="group relative bg-gradient-to-br from-blue-500/5 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 md:p-8 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
            {/* Background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all duration-500"></div>

            <div className="relative z-10">
              {/* Step Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                  <span className="text-blue-300 text-xl font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-slate-50 font-bold text-lg md:text-xl">Add Your Content</h3>
                  <p className="text-blue-400 text-sm font-semibold">⏱️ 5 minutes</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm md:text-base mb-6 leading-relaxed">
                Fill out a simple form with your bio, writing samples, and client testimonials. No coding required.
              </p>

              {/* Form Preview */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
                {/* Form field 1 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-blue-500/30 rounded w-16 text-[10px]"></div>
                    <div className="w-3 h-3 bg-blue-500/20 rounded flex items-center justify-center">
                      <svg className="w-2 h-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-700/50 rounded-lg border border-slate-600/30 flex items-center px-3">
                    <span className="text-slate-500 text-[10px] font-mono">Sarah Mitchell</span>
                  </div>
                </div>

                {/* Form field 2 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-blue-500/30 rounded w-20"></div>
                    <div className="w-3 h-3 bg-blue-500/20 rounded flex items-center justify-center">
                      <svg className="w-2 h-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="h-16 bg-slate-700/50 rounded-lg border border-slate-600/30 flex items-start p-2">
                    <span className="text-slate-500 text-[10px] leading-relaxed">
                      Freelance writer specializing in tech and SaaS. Published in TechCrunch, Forbes...
                    </span>
                  </div>
                </div>

                {/* Form field 3 - In progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-slate-700 rounded w-24"></div>
                    <div className="w-3 h-3 bg-slate-700/50 rounded border border-slate-600"></div>
                  </div>
                  <div className="h-8 bg-slate-700/30 rounded-lg border border-slate-600/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-blue-400 font-semibold">60%</span>
                </div>
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                </div>
              </div>

              {/* Stat */}
              <div className="mt-6 flex items-center gap-2 text-xs text-blue-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Average completion time: 7 minutes</span>
              </div>
            </div>
          </div>

          {/* Step 3: Go Live - Full Width Bottom */}
          <div className="md:col-span-2 group relative bg-gradient-to-br from-green-500/5 via-slate-800/50 to-yellow-500/5 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 md:p-10 overflow-hidden hover:border-green-500/30 transition-all duration-300">
            {/* Background glows */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-400/10 rounded-full blur-3xl group-hover:bg-green-400/20 transition-all duration-500"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all duration-500"></div>

            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Content */}
                <div>
                  {/* Step Badge */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30">
                      <span className="text-green-300 text-2xl font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-slate-50 font-bold text-xl md:text-2xl">Go Live Instantly</h3>
                      <p className="text-green-400 text-sm md:text-base font-semibold">⚡ Instant deployment</p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed">
                    Click generate and your portfolio is live immediately. Share your unique URL with clients and start landing gigs today.
                  </p>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-300 text-sm md:text-base">Free hosting included</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-300 text-sm md:text-base">Mobile-optimized & responsive</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-300 text-sm md:text-base">Easy to share & update</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a href="/templates" className="cursor-pointer">
                    <button className="w-full md:w-auto bg-gradient-to-r from-green-400 to-yellow-400 text-slate-900 px-8 py-4 rounded-xl font-bold text-base md:text-lg shadow-lg shadow-green-400/20 hover:shadow-green-400/40 hover:scale-105 transition-all duration-300">
                      Start Building Your Portfolio
                      <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </a>

                  {/* Stat */}
                  <div className="mt-6 flex items-center gap-2 text-sm text-green-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-semibold">98% deployment success rate</span>
                  </div>
                </div>

                {/* Right - Live Portfolio Preview */}
                <div className="relative">
                  {/* Browser Window Mockup */}
                  <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    {/* Browser Chrome */}
                    <div className="bg-slate-900/50 px-4 py-3 flex items-center gap-3 border-b border-slate-700/50">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-slate-400 text-xs font-mono truncate">yourname.foliobase.com</span>
                      </div>
                      <div className="w-4 h-4 bg-green-400/20 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    {/* Portfolio Content Preview */}
                    <div className="p-6 md:p-8 bg-gradient-to-b from-slate-800 to-slate-900 space-y-4">
                      {/* Profile */}
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full mx-auto mb-2"></div>
                        <div className="text-slate-300 text-[10px] font-semibold">Sarah Mitchell</div>
                        <div className="text-slate-500 text-[8px]">Tech & SaaS Writer</div>
                      </div>

                      {/* Writing Samples */}
                      <div className="space-y-2 pt-4">
                        <div className="bg-slate-700/20 rounded p-2 space-y-1">
                          <div className="text-slate-300 text-[8px] font-semibold">Latest Articles</div>
                          <div className="text-slate-500 text-[6px]">• How AI is Transforming Customer Support</div>
                          <div className="text-slate-500 text-[6px]">• The Complete Guide to SaaS Marketing</div>
                        </div>
                        <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/20">
                          <div className="h-2 bg-slate-600 rounded w-2/3 mb-2"></div>
                          <div className="h-1.5 bg-slate-600/50 rounded w-full mb-1"></div>
                          <div className="h-1.5 bg-slate-600/50 rounded w-4/5"></div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="pt-2">
                        <div className="h-8 bg-green-400/20 rounded-lg border border-green-400/30"></div>
                      </div>
                    </div>
                  </div>

                  {/* Live Badge */}
                  <div className="absolute -top-3 -right-3 bg-green-500/20 backdrop-blur-sm border border-green-400/40 rounded-full px-4 py-2 shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-xs font-bold">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">~10 min</div>
            <div className="text-slate-400 text-sm">Average Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">100%</div>
            <div className="text-slate-400 text-sm">No Code Required</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">Free</div>
            <div className="text-slate-400 text-sm">Forever Plan Available</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;