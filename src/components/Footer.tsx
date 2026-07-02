import { Link } from "react-router-dom";
import { NICHES } from "../pages/niches/nicheConfig";

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div>
            <p className="text-white text-xl font-bold tracking-tight mb-1">
              Porfil<span className="text-orange-500">r</span>
            </p>
            <p className="text-stone-500 text-sm">Your work, finally visible.</p>
          </div>

          <a href="https://fazier.com/launches/porfilr.com" target="_blank">
            <img src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark" width={20} alt="Fazier badge" />
          </a>

          {/* Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link to="/contact" className="hover:text-white transition">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
          </div>
        </div>

        {/* Built-for niche pages — internal links for SEO + discovery */}
        <div className="border-t border-stone-800 mt-10 pt-8">
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-widest mb-3">Built for</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {NICHES.map(n => (
              <Link key={n.slug} to={`/${n.slug}`} className="text-stone-400 hover:text-white transition">
                {n.niche}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-8 text-center text-xs text-stone-600">
          © 2026 Porfilr. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
