const STEPS = [
  {
    number: "01",
    time: "30 seconds",
    title: "Pick a template",
    body: "Choose from templates built for creators — writers, designers, photographers, developers, and more.",
  },
  {
    number: "02",
    time: "5 minutes",
    title: "Add your content",
    body: "Fill in your bio, showcase your work, and add client testimonials. No coding, no drag-and-drop headaches.",
  },
  {
    number: "03",
    time: "Instant",
    title: "Share your link",
    body: "Your portfolio is live at porfilr.com/p/yourname. Share it anywhere — proposals, emails, social, your bio.",
  },
];

const HowItWorks = () => {
  return (
    <section id="HowItWorks" className="py-24 px-6 bg-stone-50">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
          <h2
            className="text-4xl md:text-5xl font-bold text-stone-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Three steps, then you're done.
          </h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            Most creators spend weeks on this. You'll be done before lunch.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {STEPS.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-stone-200 z-0" style={{ width: "calc(100% - 2rem)", left: "calc(100% - 0rem)" }}></div>
              )}
              <div className="bg-white border border-stone-200 rounded-2xl p-8 hover:shadow-sm hover:border-stone-300 transition-all relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <span
                    className="text-5xl font-bold text-stone-100"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {step.number}
                  </span>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
                    {step.time}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-stone-200 pt-12">
          {[
            { value: "~10 min", label: "Average setup time" },
            { value: "100%", label: "No code required" },
            { value: "Free", label: "Forever plan available" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p
                className="text-4xl font-bold text-stone-900 mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {s.value}
              </p>
              <p className="text-stone-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
