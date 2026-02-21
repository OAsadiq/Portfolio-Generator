// src/components/Navbar.tsx - Updated with Auth
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { FaXTwitter } from 'react-icons/fa6';
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      "Create your stunning portfolio effortlessly with Foliobase!"
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
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

          <Link
            to="/pricing"
            className="text-slate-300 font-semibold hover:text-yellow-400 transition"
          >
            Pricing
          </Link>

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

          {user ? (
            /* Logged In - Show User Menu */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl hover:bg-slate-700 transition"
              >
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=FACC15&color=1E293B`}
                  alt="Profile"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-slate-300 text-sm font-semibold">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-slate-300 text-sm font-semibold">{user.user_metadata?.full_name}</p>
                    <p className="text-slate-500 text-xs truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/templates"
                    target="_blank" rel="noopener noreferrer"
                    className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-yellow-400 transition text-sm"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Templates
                  </Link>
                  <Link
                    to="/dashboard"
                    target="_blank" rel="noopener noreferrer"
                    className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-yellow-400 transition text-sm"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 transition text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-slate-900 bg-yellow-400 rounded-xl font-semibold shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 transition"
            >
              Get Started
            </Link>
          )}
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

          <Link
            to="/pricing"
            className="block text-slate-300 font-semibold hover:text-yellow-400 transition"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>

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

          {user ? (
            <>
              {/* User Info */}
              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=FACC15&color=1E293B`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-slate-300 text-sm font-semibold">{user.user_metadata?.full_name}</p>
                    <p className="text-slate-500 text-xs truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/templates"
                  onClick={() => setMobileOpen(false)}
                  target="_blank" rel="noopener noreferrer"
                  className="block text-center bg-slate-700/50 border border-slate-600/50 py-2 rounded-lg text-slate-300 hover:text-yellow-400 hover:bg-slate-700 transition mb-2"
                >
                  My Templates
                </Link>
                <Link
                  to="/dashboard"
                  target="_blank" rel="noopener noreferrer"
                  className="block text-center bg-slate-700/50 border border-slate-600/50 py-2 rounded-lg text-slate-300 hover:text-yellow-400 hover:bg-slate-700 transition mb-2"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="w-full text-center bg-red-500/10 border border-red-500/30 py-2 rounded-lg text-red-400 hover:bg-red-500/20 transition"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-center bg-yellow-400 text-slate-900 py-2 rounded-xl font-semibold shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 transition"
            >
              Get Started
            </Link>
          )}

        </div>
      )}
    </nav>
  );
};

export default Navbar;