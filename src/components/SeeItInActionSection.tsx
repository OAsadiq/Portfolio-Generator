const SeeItInAction = () => {
  const sectionId = "LiveDemo";

  return (
    <div id={sectionId} className="py-20 px-4 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full mb-4">
            <span className="text-green-400 text-sm font-semibold">Live Demo</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-50 mb-4">
            See a Real Writer's Portfolio
          </h2>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            This is what clients will see when you share your Foliobase portfolio.
            Built in 10 minutes using our Modern Writer template.
          </p>
        </div>

        {/* Full Browser Mockup */}
        <div className="relative">
          <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Browser Chrome */}
            <div className="bg-slate-900/80 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-slate-700/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>

              <div className="flex-1 bg-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-slate-400 text-sm font-mono">sarahmitchell.foliobase.vercel.app</span>
              </div>

              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-semibold">LIVE</span>
              </div>
            </div>

            {/* Portfolio Content */}
            <div className="bg-white">
              <iframe
                src="/templates/modern-writer-template/preview.html"
                title="Live Portfolio Demo"
                className="w-full h-[600px] md:h-[700px]"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a href="/templates" target="_blank" rel="noopener noreferrer">
            <button className="bg-gradient-to-r from-green-400 to-blue-400 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-400/20 hover:shadow-green-400/40 hover:scale-105 transition-all">
              Build Yours Now (10 Minutes)
              <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SeeItInAction;