const ROWS = [
  { label: "Time to publish", bad: "Days (or never)", good: "Under 10 minutes" },
  { label: "Looks professional", bad: "Depends on your design skills", good: "Always — templates handle it" },
  { label: "Easy to update", bad: "Re-export, re-send, re-attach", good: "Edit once, link stays the same" },
  { label: "Works on mobile", bad: "Usually broken", good: "Responsive by default" },
  { label: "Custom domain", bad: "Not an option", good: "Available on Pro" },
  { label: "Contact form built in", bad: "They email to ask for your work", good: "Clients reach you directly" },
];

const ComparisonSection = () => {
  return (
    <section className="py-24 px-6 bg-stone-50 border-t border-stone-100">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
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

        {/* Column headers */}
        <div className="grid grid-cols-3 mb-3 px-2">
          <span></span>
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">The old way</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600">With Porfilr</span>
          </div>
        </div>

        {/* Rows */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {ROWS.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 items-center px-6 py-5 ${i < ROWS.length - 1 ? "border-b border-stone-100" : ""}`}
            >
              {/* Label */}
              <span className="text-stone-800 font-semibold text-sm pr-4">{row.label}</span>

              {/* Bad */}
              <div className="flex items-start justify-center px-3 text-center">
                <span className="text-stone-400 text-sm leading-snug">{row.bad}</span>
              </div>

              {/* Good */}
              <div className="flex items-start justify-center px-3 text-center">
                <span className="text-stone-800 text-sm font-medium leading-snug">{row.good}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-stone-400 text-xs mt-5">
          Compared to sharing work-in-progress Google Docs, Dropbox folders, or expired WeTransfer links.
        </p>
      </div>
    </section>
  );
};

export default ComparisonSection;
