import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import Logo from "./Logo";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-6xl w-full mx-auto px-6 py-4 grid grid-cols-3 items-center">

        {/* Logo — left */}
        <div className="flex items-center">
          <Link to="/"><Logo size={28} /></Link>
        </div>

        {/* Desktop links — truly centered */}
        <div className="hidden lg:flex items-center justify-center gap-8">
          <Link to="/" className="text-stone-600 text-sm font-medium hover:text-stone-900 transition">
            Home
          </Link>
          <Link to="/pricing" className="text-stone-600 text-sm font-medium hover:text-stone-900 transition">
            Pricing
          </Link>
          <Link to="/contact" className="text-stone-600 text-sm font-medium hover:text-stone-900 transition">
            Contact
          </Link>
        </div>
        {/* Desktop CTA — right */}
        <div className="hidden lg:flex items-center justify-end gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-100 transition"
              >
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=EA580C&color=fff`}
                  alt="Profile"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-stone-700 text-sm font-medium">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-stone-100">
                    <p className="text-stone-800 text-sm font-semibold">{user.user_metadata?.full_name}</p>
                    <p className="text-stone-400 text-xs truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/templates"
                    className="block px-4 py-2.5 text-stone-600 hover:bg-stone-50 hover:text-stone-900 text-sm transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Templates
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2.5 text-stone-600 hover:bg-stone-50 hover:text-stone-900 text-sm transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 text-sm transition"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-stone-600 text-sm font-medium hover:text-stone-900 transition">
                Sign in
              </Link>
              <Link
                to="/login"
                className="bg-stone-900 hover:bg-stone-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
              >
                Get started free
              </Link>
            </>
          )}
        </div>

        {/* Mobile: hamburger sits in right col */}
        <div className="lg:hidden flex justify-end col-start-3">
          <button
            className="text-stone-600 hover:text-stone-900 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-6 py-4 space-y-4">
          <Link to="/" className="block text-stone-700 font-medium hover:text-stone-900 transition" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          <Link to="/pricing" className="block text-stone-700 font-medium hover:text-stone-900 transition" onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          <Link to="/contact" className="block text-stone-700 font-medium hover:text-stone-900 transition" onClick={() => setMobileOpen(false)}>
            Contact
          </Link>

          {user ? (
            <div className="border-t border-stone-100 pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=EA580C&color=fff`}
                  alt="Profile"
                  className="w-9 h-9 rounded-full"
                />
                <div>
                  <p className="text-stone-800 text-sm font-semibold">{user.user_metadata?.full_name}</p>
                  <p className="text-stone-400 text-xs">{user.email}</p>
                </div>
              </div>
              <Link to="/dashboard" className="block text-center border border-stone-200 py-2.5 rounded-lg text-stone-700 text-sm font-medium hover:bg-stone-50 transition" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link to="/templates" className="block text-center border border-stone-200 py-2.5 rounded-lg text-stone-700 text-sm font-medium hover:bg-stone-50 transition" onClick={() => setMobileOpen(false)}>
                Templates
              </Link>
              <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="w-full text-center bg-red-50 border border-red-200 py-2.5 rounded-lg text-red-500 text-sm font-medium transition">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-stone-100 pt-4 space-y-3">
              <Link to="/login" className="block text-center border border-stone-200 py-2.5 rounded-lg text-stone-700 text-sm font-medium hover:bg-stone-50 transition" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <Link to="/login" className="block text-center bg-stone-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-700 transition" onClick={() => setMobileOpen(false)}>
                Get started free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
