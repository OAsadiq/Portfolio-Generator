import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { FaXTwitter } from 'react-icons/fa6';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      "Create your stunning portfolio effortlessly with OA-Portfolio-Generator!"
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <nav className="max-w-7xl mx-6 lg:mx-auto bg-white shadow-lg p-4 rounded-lg sticky top-0 z-50">
      <div className="flex justify-between items-center">

        {/* LOGO */}
        <Link
          to="/"
          className="text-md lg:text-xl font-bold text-gray-900 transition"
        >
          OA-Portfolio-Generator
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-900 font-semibold hover:text-gray-500">
            Home
          </Link>

          <span className="text-gray-300 font-semibold cursor-not-allowed">
            Pricing (Coming soon)
          </span>

          <Link to="/contact" className="text-gray-900 font-semibold hover:text-gray-500">
            Contact
          </Link>
        </div>

        {/* DESKTOP BUTTONS */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={shareOnTwitter}
            className="bg-white text-gray-900 px-2 py-1 rounded-lg flex items-center hover:text-blue-400 transition"
          >
            <FaXTwitter className="mr-1" /> Share
          </button>

          <Link
            to="/templates"
            className="px-4 py-2 text-black bg-gray-200 rounded-xl font-semibold shadow-xl hover:bg-gray-300 transition"
          >
            Get Started
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-gray-900 text-lg lg:text-2xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileOpen && (
        <div className="md:hidden mt-4 bg-white rounded-lg shadow-md p-4 space-y-4 animate-slideDown">

          <Link
            to="/"
            className="block text-gray-900 font-semibold hover:text-gray-500"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>

          <span className="block text-gray-300 font-semibold cursor-not-allowed">
            Pricing (Coming soon)
          </span>

          <Link
            to="/contact"
            className="block text-gray-900 font-semibold hover:text-gray-500"
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </Link>

          <button
            onClick={shareOnTwitter}
            className="w-full bg-gray-100 py-2 rounded-lg flex justify-center items-center text-gray-900 hover:bg-gray-200 transition"
          >
            <FaXTwitter className="mr-1" /> Share
          </button>

          <Link
            to="/templates"
            onClick={() => setMobileOpen(false)}
            className="block text-center bg-gray-200 py-2 rounded-xl font-semibold shadow hover:bg-gray-300 transition"
          >
            Get Started
          </Link>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
