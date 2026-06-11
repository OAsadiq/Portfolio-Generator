import { Link } from "react-router-dom";

const FinalCTASection = () => {
  return (
    <section className="py-28 px-6 bg-stone-900">
      <div className="max-w-3xl mx-auto text-center">

        <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-4">Your work is ready. Is your portfolio?</p>

        <h2
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Build your portfolio
          <br />
          <span className="text-orange-500">in 10 minutes — free.</span>
        </h2>

        <p className="text-stone-400 text-lg mb-10 max-w-xl mx-auto">
          No credit card. No design skills needed. Just pick a template, add your work, and share the link.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/templates">
            <button className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-base transition shadow-lg shadow-orange-900/30">
              Get started free →
            </button>
          </Link>
          <a href="#LiveDemo">
            <button className="border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-base transition">
              See a live example
            </button>
          </a>
        </div>

        <p className="text-stone-600 text-sm mt-8">
          Free plan includes 1 portfolio, free hosting, and a contact form. Upgrade anytime.
        </p>
      </div>
    </section>
  );
};

export default FinalCTASection;
