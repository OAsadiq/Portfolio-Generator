const Feature = () => {
  return (
    <div className="py-20 px-4 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* Feature 1: Showcase Writing Samples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-400 text-sm font-semibold">Proof, Not Promises</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-50">
              Turn Writing Samples Into Paying Clients
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Clients don't hire writers who say "I'm good." They hire writers who prove it. 
              Show your published work with direct links—no PDFs, no Google Drive, no excuses.
            </p>
            {/* BEFORE/AFTER comparison instead of badges */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-semibold">Without Portfolio:</p>
                  <p className="text-slate-500 text-xs">"Here's my LinkedIn... and some Google Docs..."</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-300 text-sm font-semibold">With Foliobase:</p>
                  <p className="text-slate-500 text-xs">"Here's my portfolio with 10 published articles from Forbes, TechCrunch, and HuffPost."</p>
                </div>
              </div>
            </div>
            
            {/* Stat */}
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-semibold">Writers with portfolios charge 2-3x more per article</span>
            </div>
          </div>

          {/* Illustration: Writing Sample Cards */}
          <div className="relative h-[400px]">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-3xl blur-3xl"></div>
            
            {/* Sample Card 1 */}
            <div className="absolute top-0 left-0 w-[85%] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-200 font-semibold text-sm mb-1">How AI is Transforming Customer Support</h3>
                  <p className="text-slate-500 text-xs">Published in TechCrunch</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                A deep dive into AI automation trends featuring interviews with 5 industry leaders...
              </p>
              <button className="text-yellow-400 text-xs font-semibold hover:text-yellow-300 transition">
                Read Article →
              </button>
            </div>

            {/* Sample Card 2 */}
            <div className="absolute bottom-0 right-0 w-[85%] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-200 font-semibold text-sm mb-1">The Complete Guide to SaaS Marketing</h3>
                  <p className="text-slate-500 text-xs">5,000-word comprehensive guide</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                Strategy, SEO, and distribution tactics that generated 15K+ monthly visits...
              </p>
              <button className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition">
                Read Article →
              </button>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 right-2 lg:-right-6 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 left-2 lg:-left-6 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Feature 2: Beautiful Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Illustration: Template Previews */}
          <div className="relative h-[400px] order-2 lg:order-1">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent rounded-3xl blur-3xl"></div>
            
            {/* Template Preview 1 - Minimal */}
            <div className="absolute top-0 left-0 w-[70%] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              {/* Mini browser chrome */}
              <div className="bg-slate-900/50 px-3 py-2 flex items-center gap-2 border-b border-slate-700/50">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-slate-800 rounded px-2 py-0.5 text-slate-500 text-[8px]">
                  foliobase.io
                </div>
              </div>
              {/* Content preview */}
              <div className="p-4 space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full mx-auto"></div>
                <div className="h-2 bg-slate-700 rounded w-20 mx-auto"></div>
                <div className="h-1.5 bg-slate-700/50 rounded w-32 mx-auto"></div>
                <div className="space-y-1.5 pt-2">
                  <div className="h-1 bg-slate-700/30 rounded"></div>
                  <div className="h-1 bg-slate-700/30 rounded w-4/5"></div>
                </div>
              </div>
            </div>

            {/* Template Preview 2 - Professional */}
            <div className="absolute bottom-0 right-0 w-[70%] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              {/* Mini browser chrome */}
              <div className="bg-slate-900/50 px-3 py-2 flex items-center gap-2 border-b border-slate-700/50">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-slate-800 rounded px-2 py-0.5 text-slate-500 text-[8px]">
                  yourname.com
                </div>
              </div>
              {/* Content preview with blue accent */}
              <div className="p-4 space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto border-2 border-blue-400/30"></div>
                <div className="h-2 bg-blue-500/20 rounded w-20 mx-auto"></div>
                <div className="h-1.5 bg-slate-700/50 rounded w-32 mx-auto"></div>
                <div className="grid grid-cols-2 gap-1.5 pt-2">
                  <div className="h-8 bg-slate-700/30 rounded"></div>
                  <div className="h-8 bg-slate-700/30 rounded"></div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-4 py-2 shadow-xl">
              <span className="text-purple-300 text-xs font-semibold">2 Templates</span>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 left-2 lg:-left-6 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 right-2 lg:-right-6 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
              <span className="text-purple-400 text-sm font-semibold">No Designer Needed</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-50">
              Templates That Make Writers Look Professional (Without Trying)
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Stop using restaurant templates for your writing portfolio. Our templates 
              are built specifically for writers—clean layouts that put your words first, 
              not fancy graphics.
            </p>
            {/* Cost comparison */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Hiring a designer:</p>
                  <p className="text-slate-300 font-semibold">$500+ • 2-3 weeks</p>
                </div>
                <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold">
                  EXPENSIVE
                </div>
              </div>
              
              <div className="h-px bg-slate-700"></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Using Foliobase:</p>
                  <p className="text-slate-300 font-semibold">$0-9/mo • 10 minutes</p>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold">
                  SMART
                </div>
              </div>
            </div>
            {/* What you get */}
            <div className="space-y-2">
              <p className="text-slate-500 text-md font-semibold">What you get:</p>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 text-sm">
                  ✓ Mobile-optimized
                </div>
                <div className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 text-sm">
                  ✓ Professional Layout
                </div>
                <div className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 text-sm">
                  ✓ Client-ready
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Quick Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <span className="text-green-400 text-sm font-semibold">Actually Fast</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-50">
              Stop Losing Clients While Building Your Portfolio
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Spent 2 weeks learning WordPress? Still not done? Meanwhile, 3 clients 
              went with someone else. Build your portfolio in 10 minutes and start 
              pitching today—not next month.
            </p>
            {/* Time comparison */}
            <div className="space-y-3">
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-300 font-semibold text-sm">WordPress Route:</p>
                    <p className="text-slate-500 text-xs">20+ hours learning • Still buggy • Clients waiting</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-300 font-semibold text-sm">Foliobase:</p>
                    <p className="text-slate-500 text-xs">10 minutes total • Live instantly • Pitching clients today</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-400/20 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-300 text-sm">No coding (seriously, none)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-400/20 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-300 text-sm">Live the moment you hit "Publish"</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-400/20 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-300 text-sm">Free hosting forever (no hidden fees)</span>
              </div>
            </div>
          </div>

          {/* Illustration: Form to Live Site */}
          <div className="relative h-[400px]">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent rounded-3xl blur-3xl"></div>
            
            {/* Form Preview */}
            <div className="absolute top-0 left-0 w-[60%] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-400/20 rounded flex items-center justify-center">
                    <span className="text-green-400 text-xs font-bold">1</span>
                  </div>
                  <span className="text-slate-300 text-xs font-semibold">Fill Form</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-700 rounded w-16 text-[8px]"></div>
                  <div className="h-6 bg-slate-700/50 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-700 rounded w-20"></div>
                  <div className="h-6 bg-slate-700/50 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-700 rounded w-24"></div>
                  <div className="h-12 bg-slate-700/50 rounded"></div>
                </div>
                <button className="w-full h-8 bg-green-400/20 border border-green-400/30 rounded text-green-400 text-xs font-semibold">
                  Generate
                </button>
              </div>
            </div>

            {/* Arrow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <svg className="w-12 h-12 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Live Site Preview */}
            <div className="absolute bottom-0 right-0 w-[60%] bg-slate-800/80 backdrop-blur-sm border border-green-500/30 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-green-500/10 px-3 py-2 flex items-center justify-between border-b border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-[8px] font-semibold">LIVE</span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto"></div>
                <div className="h-2 bg-green-500/20 rounded w-16 mx-auto"></div>
                <div className="space-y-1 pt-2">
                  <div className="h-1 bg-slate-700/30 rounded"></div>
                  <div className="h-1 bg-slate-700/30 rounded w-3/4"></div>
                </div>
              </div>
            </div>

            {/* Timer badge */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-4 py-2 shadow-xl">
              <span className="text-green-300 text-xs font-bold">⚡ 10 Minutes</span>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 right-2 lg:-right-6 w-24 h-24 bg-green-400/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Feature 4: Client Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Illustration: Testimonial Cards */}
          <div className="relative h-[400px] order-2 lg:order-1">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-transparent rounded-3xl blur-3xl"></div>
            
            {/* Testimonial Card 1 */}
            <div className="absolute top-0 right-0 w-[80%] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex-shrink-0"></div>
                <div>
                  <h4 className="text-slate-200 font-semibold text-sm">Sarah Chen</h4>
                  <p className="text-slate-500 text-xs">VP Marketing, TechCorp</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                "Her writing transformed our blog. Traffic doubled in 6 months!"
              </p>
            </div>

            {/* Testimonial Card 2 */}
            <div className="absolute bottom-0 left-0 w-[80%] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex-shrink-0"></div>
                <div>
                  <h4 className="text-slate-200 font-semibold text-sm">Mike Johnson</h4>
                  <p className="text-slate-500 text-xs">CEO, StartupX</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                "Best copywriter we've hired. Conversion rate doubled immediately."
              </p>
            </div>

            {/* Quote icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-16 h-16 text-pink-400/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 left-2 lg:-left-6 w-24 h-24 bg-pink-400/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 right-2 lg:-right-6 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl"></div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-block px-3 py-1 bg-pink-500/10 border border-pink-500/30 rounded-full">
              <span className="text-pink-400 text-sm font-semibold">Instant Credibility</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-50">
              Let Your Clients Brag About You
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              "I'm a great writer" means nothing. "Here's what my clients say about my work" 
              closes deals. Add testimonials from past clients and watch new clients trust you faster.
            </p>
            {/* The Psychology */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
              <p className="text-slate-300 text-sm mb-3 font-semibold">What clients think:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-slate-600 text-xs mt-0.5">❌</span>
                  <p className="text-slate-500 text-xs">"They say they're good, but how do I know?"</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-xs mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs">"3 other companies trust them. Their work must be solid."</p>
                </div>
              </div>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-2 text-sm text-pink-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Testimonials increase conversion rates by 34%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Feature;