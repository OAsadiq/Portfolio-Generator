const SampleSection = () => {
  const scrollToHowItWorks = () => {
    document.getElementById("HowItWorks")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1 — Minimal */}
          <div className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-stone-300 transition-all duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-bold text-sm border border-stone-200">
                  SC
                </div>
                <div>
                  <h3 className="text-stone-900 font-semibold">Saro Chen</h3>
                  <p className="text-stone-400 text-sm">Copywriter</p>
                </div>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed">
                B2B SaaS writer. Published in TechCrunch and Forbes.
              </p>
              <div className="flex flex-wrap gap-2">
                {["SaaS", "B2B", "Tech"].map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">{t}</span>
                ))}
              </div>
              <div className="space-y-2">
                {["How AI is Transforming SaaS — TechCrunch", "The Future of Remote Work — Forbes"].map((a) => (
                  <div key={a} className="bg-stone-50 border border-stone-100 rounded-lg p-3">
                    <p className="text-stone-700 text-xs font-medium">{a}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-stone-400 text-xs">Minimal Template</span>
                <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full">FREE</span>
              </div>
              <a href="/templates/minimal-template/preview.html" target="_blank" rel="noopener noreferrer">
                <button className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 group">
                  View Portfolio
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </a>
            </div>
          </div>

          {/* Card 2 — Modern (featured) */}
          <div className="group bg-white border-2 border-orange-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-orange-300 transition-all duration-300 relative">
            <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
              POPULAR
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm border border-orange-200">
                  SM
                </div>
                <div>
                  <h3 className="text-stone-900 font-semibold">Sarah Mitchell</h3>
                  <p className="text-orange-600 text-sm font-medium">Content Strategist</p>
                </div>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed">
                Helping SaaS companies 10x organic traffic. 5+ years in growth.
              </p>
              <div className="flex flex-wrap gap-2">
                {["SEO", "Growth", "Strategy"].map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-100">{t}</span>
                ))}
              </div>
              <div className="space-y-2">
                <div className="bg-stone-50 border border-stone-100 rounded-lg p-3">
                  <p className="text-stone-700 text-xs font-medium">Complete Guide to SaaS SEO</p>
                  <p className="text-stone-400 text-[10px] mt-0.5">15K+ views</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                    <p className="text-orange-600 font-bold text-base">50+</p>
                    <p className="text-stone-400 text-[10px]">Articles</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                    <p className="text-orange-600 font-bold text-base">2M+</p>
                    <p className="text-stone-400 text-[10px]">Readers</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-stone-400 text-xs">Modern Template</span>
                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">PRO</span>
              </div>
              <a href="/templates/modern-writer-template/preview.html" target="_blank" rel="noopener noreferrer">
                <button className="w-full bg-stone-900 hover:bg-stone-700 text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 group">
                  View Portfolio
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </a>
            </div>
          </div>

          {/* Card 3 — Professional */}
          <div className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-stone-300 transition-all duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm border border-emerald-200">
                  JS
                </div>
                <div>
                  <h3 className="text-stone-900 font-semibold">Jane Smith</h3>
                  <p className="text-stone-400 text-sm">Technical Writer</p>
                </div>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed">
                Explaining complex tech simply. API docs and dev tutorials.
              </p>
              <div className="flex flex-wrap gap-2">
                {["API Docs", "Dev Tools", "Tutorials"].map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">{t}</span>
                ))}
              </div>
              <div className="space-y-2">
                {["Getting Started with GraphQL — Dev.to", "REST API Best Practices — Hashnode"].map((a) => (
                  <div key={a} className="bg-stone-50 border border-stone-100 rounded-lg p-3">
                    <p className="text-stone-700 text-xs font-medium">{a}</p>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                <p className="text-emerald-700 text-xs italic">"Clearest API docs we've ever had"</p>
                <p className="text-emerald-500 text-[10px] mt-1">— CTO, TechStartup</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-stone-400 text-xs">Professional Template</span>
                <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full">PRO</span>
              </div>
              <a href="/templates/professional-writer-template/preview.html" target="_blank" rel="noopener noreferrer">
                <button className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 group">
                  View Portfolio
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-stone-400 text-sm">Each portfolio built in <span className="text-stone-800 font-semibold">under 10 minutes</span></p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={scrollToHowItWorks} className="border border-stone-300 hover:bg-stone-100 text-stone-700 px-7 py-3 rounded-xl font-medium text-sm transition">
              See how it works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleSection;
