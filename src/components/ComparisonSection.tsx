const ROWS = [
  { label: "Time to publish", bad: "Days (or never)", good: "Under 10 minutes" },
  { label: "Looks professional", bad: "Depends on your design skills", good: "Always — templates handle it" },
  { label: "Easy to update", bad: "Re-export, re-send, re-attach", good: "Edit once, link stays the same" },
  { label: "Works on mobile", bad: "Usually a mess", good: "Responsive by default" },
  { label: "Custom domain", bad: "Not an option", good: "Available on Pro" },
  { label: "Contact form", bad: "They email you to ask for it", good: "Built in — clients reach you directly" },
];

const ComparisonSection = () => {
  return (
    <section className="py-24 px-6 bg-white border-t border-stone-100">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Why Porfilr</p>
          <h2
            className="text-4xl md:text-5xl font-bold text-stone-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Stop sending Google Docs.
          </h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            You're great at what you do. Your portfolio should be too.
          </p>
        </div>

        {/* Table */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-stone-50 border-b border-stone-200 text-xs font-bold uppercase tracking-widest text-stone-400 px-6 py-4">
            <span></span>
            <span className="text-center">The old way</span>
            <span className="text-center text-orange-600">With Porfilr</span>
          </div>

          {ROWS.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 px-6 py-5 items-center ${i < ROWS.length - 1 ? "border-b border-stone-100" : ""}`}
            >
              <span className="text-stone-700 font-medium text-sm">{row.label}</span>

              <div className="flex items-center justify-center gap-2 text-stone-400 text-sm">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-center text-xs">{row.bad}</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-stone-700 text-sm">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-center text-xs font-medium">{row.good}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-stone-400 text-sm mt-6">
          Compared to sharing work-in-progress Google Docs, Dropbox folders, or expired WeTransfer links.
        </p>
      </div>
    </section>
  );
};

export default ComparisonSection;
