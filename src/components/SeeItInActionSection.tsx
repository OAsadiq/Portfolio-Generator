import { Link } from "react-router-dom";

const SeeItInAction = () => {
  return (
    <section id="LiveDemo" className="py-24 px-6 bg-stone-50 border-t border-stone-100">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Live demo</p>
          <h2
            className="text-4xl md:text-5xl font-bold text-stone-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            See a real portfolio in action.
          </h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            This is exactly what clients see when you share your Porfilr link. Built in under 10 minutes.
          </p>
        </div>

        {/* Browser mockup */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Browser chrome */}
          <div className="bg-stone-100 border-b border-stone-200 px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-stone-400 text-sm font-mono">porfilr.com/p/sarah-mitchell</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 text-xs font-semibold">Live</span>
            </div>
          </div>

          <iframe
            src="/templates/modern-writer-template/preview.html"
            title="Live Portfolio Demo"
            className="w-full h-[580px] md:h-[680px] border-none"
          />
        </div>

        {/* CTA below */}
        <div className="text-center mt-10">
          <Link to="/templates">
            <button className="bg-stone-900 hover:bg-stone-700 text-white px-8 py-4 rounded-xl font-semibold text-base transition shadow-sm">
              Build yours in 10 minutes →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SeeItInAction;
