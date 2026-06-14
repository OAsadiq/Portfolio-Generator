const TESTIMONIALS = [
  {
    quote: "I sent my Porfilr link to three agencies on Monday. Had two calls by Wednesday. This thing actually works.",
    name: "Marcus T.",
    role: "Freelance Videographer",
    avatar: "MT",
  },
  {
    quote: "I spent six months putting off building a portfolio. Porfilr took me 20 minutes. My old excuse is gone.",
    name: "Priya S.",
    role: "UX Designer",
    avatar: "PS",
  },
  {
    quote: "Clients stopped asking me to 'send examples' once I had a real link. The professionalism bump is real.",
    name: "James O.",
    role: "Copywriter & Brand Strategist",
    avatar: "JO",
  },
  {
    quote: "I trade full-time and needed somewhere to share my track record. There was nothing built for this. Porfilr was the answer.",
    name: "Aisha K.",
    role: "Prop Trader",
    avatar: "AK",
  },
  {
    quote: "Every photographer I know either has a broken Squarespace site or nothing at all. This fills the gap perfectly.",
    name: "Leon B.",
    role: "Commercial Photographer",
    avatar: "LB",
  },
  {
    quote: "My portfolio used to be a Notion doc I was embarrassed to share. Now I send the link in every cold email.",
    name: "Sofia R.",
    role: "Consultant",
    avatar: "SR",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 px-6 bg-stone-50 border-t border-stone-100">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-14">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Real creators, real results</p>
          <h2
            className="text-4xl md:text-5xl font-bold text-stone-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Work that speaks for itself.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col gap-5 hover:border-stone-300 transition-colors">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-stone-700 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>

              <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                <div className="w-9 h-9 bg-stone-900 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-stone-900 font-semibold text-sm">{t.name}</p>
                  <p className="text-stone-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
