const FEATURES = [
  {
    tag: "Proof, not promises",
    headline: "Show your work. Win more clients.",
    body: "Clients don't hire creators who say they're good — they hire creators who prove it. Your portfolio puts your best work front and centre, with direct links and clean presentation.",
    before: "\"Here's my LinkedIn… and some Google Drive links…\"",
    after: "\"Here's my portfolio — 10 published pieces, 3 client testimonials, and my contact form.\"",
    stat: "Creators with portfolios charge 2–3× more per project",
  },
  {
    tag: "No designer needed",
    headline: "Templates built for serious creators.",
    body: "Stop wrestling with generic website builders. Our templates are designed for the work you actually do — clean, professional, and ready in minutes.",
    before: "Hiring a designer: $500+ · 2–3 weeks",
    after: "Using Porfilr: $0–9/mo · 10 minutes",
    stat: "3 templates · more on the way",
  },
  {
    tag: "Actually fast",
    headline: "Live in 10 minutes. Pitching by lunch.",
    body: "Stop losing opportunities while you're still building. Fill out a form, hit generate — your portfolio is live and shareable immediately.",
    before: "WordPress: 20+ hours learning · still buggy · clients waiting",
    after: "Porfilr: 10 minutes total · live instantly · pitching today",
    stat: "No coding required. Ever.",
  },
  {
    tag: "Instant credibility",
    headline: "Let your clients sell you for you.",
    body: "\"I'm great at my work\" closes no deals. Testimonials from real clients do. Add social proof and watch new leads trust you before they even reach out.",
    before: "\"They say they're good, but how do I know?\"",
    after: "\"Three companies trust them. Their work must be solid.\"",
    stat: "Testimonials increase conversion by 34%",
  },
];

const Feature = () => {
  return (
    <section className="py-24 px-6 bg-white border-y border-stone-100">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-20">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Why Porfilr</p>
          <h2
            className="text-4xl md:text-5xl font-bold text-stone-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Everything a portfolio needs.<br />Nothing it doesn't.
          </h2>
        </div>

        {/* Feature rows */}
        <div className="space-y-24">
          {FEATURES.map((f, i) => (
            <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}>

              {/* Text */}
              <div className={i % 2 !== 0 ? "lg:order-2" : ""}>
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4">{f.tag}</span>
                <h3
                  className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 leading-snug"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {f.headline}
                </h3>
                <p className="text-stone-500 text-base leading-relaxed mb-6">{f.body}</p>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-medium text-stone-700">{f.stat}</span>
                </div>
              </div>

              {/* Card */}
              <div className={`${i % 2 !== 0 ? "lg:order-1" : ""} bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-3`}>
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-stone-600 text-sm">{f.before}</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-stone-700 text-sm font-medium">{f.after}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature;
