import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { FaXTwitter } from 'react-icons/fa6';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      "Create your stunning portfolio effortlessly with Foliobase!"
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <nav className="max-w-7xl mx-6 lg:mx-auto bg-slate-800/50 backdrop-blur-md border border-slate-700/50 shadow-lg shadow-slate-900/20 p-4 rounded-xl sticky top-0 z-50">
      <div className="flex justify-between items-center">

        {/* LOGO */}
        <Link
          to="/"
          className="text-md lg:text-xl font-bold text-slate-50 hover:text-yellow-400 transition"
        >
          Folio<span className="text-yellow-400">base</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden lg:flex items-center space-x-6 -mr-32">
          <Link to="/" className="text-slate-300 font-semibold hover:text-yellow-400 transition">
            Home
          </Link>

          <span className="text-slate-600 font-semibold cursor-not-allowed">
            Pricing (Coming soon)
          </span>

          <Link to="/contact" className="text-slate-300 font-semibold hover:text-yellow-400 transition">
            Contact
          </Link>
        </div>

        {/* DESKTOP BUTTONS */}
        <div className="hidden lg:flex items-center space-x-3">
          <button
            onClick={shareOnTwitter}
            className="bg-slate-700/50 text-slate-300 px-3 py-2 rounded-lg flex items-center hover:text-yellow-400 hover:bg-slate-700 transition border border-slate-600/50"
          >
            <FaXTwitter className="mr-1" /> Share
          </button>

          <Link
            to="/templates"
            className="px-4 py-2 text-slate-900 bg-yellow-400 rounded-xl font-semibold shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 transition"
          >
            Get Started
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden text-slate-300 text-lg lg:text-2xl hover:text-yellow-400 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileOpen && (
        <div className="lg:hidden mt-4 bg-slate-800/80 backdrop-blur-md rounded-lg border border-slate-700/50 p-4 space-y-4 animate-slideDown">

          <Link
            to="/"
            className="block text-slate-300 font-semibold hover:text-yellow-400 transition"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>

          <span className="block text-slate-600 font-semibold cursor-not-allowed">
            Pricing (Coming soon)
          </span>

          <Link
            to="/contact"
            className="block text-slate-300 font-semibold hover:text-yellow-400 transition"
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </Link>

          <button
            onClick={shareOnTwitter}
            className="w-full bg-slate-700/50 border border-slate-600/50 py-2 rounded-lg flex justify-center items-center text-slate-300 hover:text-yellow-400 hover:bg-slate-700 transition"
          >
            <FaXTwitter className="mr-1" /> Share
          </button>

          <Link
            to="/templates"
            onClick={() => setMobileOpen(false)}
            className="block text-center bg-yellow-400 text-slate-900 py-2 rounded-xl font-semibold shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 transition"
          >
            Get Started
          </Link>

        </div>
      )}
    </nav>
  );
};

export default Navbar;