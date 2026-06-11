import { Link } from "react-router-dom";

const TEMPLATES = [
  {
    id: "minimal-template",
    name: "Minimal",
    tier: "Free",
    description: "Clean and distraction-free. Your work is the only thing on the page.",
    bestFor: "Writers, consultants, developers",
    preview: "/templates/minimal-template/preview.html",
    palette: ["#1c1917", "#f5f5f4", "#e7e5e4"],
    accent: "#f5f5f4",
    bg: "bg-stone-900",
    featured: false,
  },
  {
    id: "modern-writer-template",
    name: "Modern",
    tier: "Pro",
    description: "Bold layout with stats, featured work, and a built-in testimonial block.",
    bestFor: "Content strategists, designers, creators",
    preview: "/templates/modern-writer-template/preview.html",
    palette: ["#ea580c", "#1c1917", "#fff7ed"],
    accent: "#ea580c",
    bg: "bg-orange-600",
    featured: true,
  },
  {
    id: "professional-writer-template",
    name: "Professional",
    tier: "Pro",
    description: "Structured and polished. Ideal when your credibility needs to do the talking.",
    bestFor: "Photographers, videographers, traders",
    preview: "/templates/professional-writer-template/preview.html",
    palette: ["#0f172a", "#334155", "#e2e8f0"],
    accent: "#e2e8f0",
    bg: "bg-slate-900",
    featured: false,
  },
];

const TemplateCard = ({ t }: { t: typeof TEMPLATES[0] }) => (
  <div className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 ${t.featured ? "border-orange-300 shadow-md" : "border-stone-200 hover:border-stone-300 hover:shadow-sm"}`}>

    {/* Visual preview area */}
    <div className={`relative ${t.bg} h-52 flex items-center justify-center overflow-hidden`}>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Mini mockup */}
      <div className="relative w-48 bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-white/30"></div>
          <div className="space-y-1 flex-1">
            <div className="h-2 bg-white/40 rounded-full w-3/4"></div>
            <div className="h-1.5 bg-white/20 rounded-full w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-1.5 bg-white/30 rounded-full"></div>
          <div className="h-1.5 bg-white/20 rounded-full w-5/6"></div>
          <div className="h-1.5 bg-white/20 rounded-full w-4/6"></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <div className="h-10 bg-white/20 rounded-lg"></div>
          <div className="h-10 bg-white/20 rounded-lg"></div>
        </div>
        <div className="mt-2 h-6 bg-white/30 rounded-lg"></div>
      </div>

      {/* Tier badge */}
      <div className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${t.tier === "Free" ? "bg-white/20 text-white/80" : "bg-orange-600 text-white"}`}>
        {t.tier}
      </div>

      {t.featured && (
        <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white text-orange-600">
          Popular
        </div>
      )}
    </div>

    {/* Card body */}
    <div className="bg-white flex flex-col flex-1 p-6 gap-4">
      <div>
        <h3 className="font-bold text-stone-900 text-lg mb-1">{t.name}</h3>
        <p className="text-stone-500 text-sm leading-relaxed">{t.description}</p>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <svg className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-stone-400 text-xs">{t.bestFor}</span>
      </div>

      <div className="flex gap-2 pt-2 border-t border-stone-100">
        <a
          href={t.preview}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 py-2.5 rounded-xl text-sm font-medium transition"
        >
          Preview
        </a>
        <Link to="/templates" className="flex-1">
          <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${t.featured ? "bg-stone-900 hover:bg-stone-700 text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-800"}`}>
            Use this →
          </button>
        </Link>
      </div>
    </div>
  </div>
);

const SampleSection = () => {
  const scrollToHowItWorks = () => {
    document.getElementById("HowItWorks")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="py-24 px-6 bg-white border-t border-stone-100">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Templates</p>
          <h2
            className="text-4xl md:text-5xl font-bold text-stone-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Pick a template.<br />Make it yours in minutes.
          </h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            Every template is designed to look professional out of the box — no design skills needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMPLATES.map((t) => <TemplateCard key={t.id} t={t} />)}
        </div>

        <div className="text-center mt-10">
          <p className="text-stone-400 text-sm mb-3">Not sure which one? You can always change templates later.</p>
          <button
            onClick={scrollToHowItWorks}
            className="text-orange-600 hover:text-orange-500 text-sm font-medium transition"
          >
            See how it works →
          </button>
        </div>
      </div>
    </section>
  );
};

export default SampleSection;
