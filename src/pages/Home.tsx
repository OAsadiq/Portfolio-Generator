import { Link } from "react-router-dom";
import { FaTwitter } from "react-icons/fa";

const Home = () => {
  const shareOnTwitter = () => {
    const text = encodeURIComponent("Create your stunning portfolio effortlessly with Portfolio-Generator!");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-white p-6">
      {/* Navbar */}
      <nav className="flex justify-between items-center max-w-7xl mx-auto mb-8 p-4 bg-white rounded-xl shadow-lg">
        <Link to="/" className="text-xl font-bold text-gray-900 transition">
          Portfolio-Generator
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-900 font-semibold text-md hover:text-gray-600">
            Home
          </Link>
          <Link to="#" className="text-gray-400 font-semibold text-md">
            Pricing (Coming soon)
          </Link>
          <Link to="/contact" className="text-gray-900 font-semibold text-md hover:text-gray-600">
            Contact
          </Link>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={shareOnTwitter}
            className="hidden sm:flex bg-white text-gray-900 px-2 rounded-lg transition items-center justify-center hover:text-gray-600"
          >
            <FaTwitter className="mr-2" /> Share
          </button>

          <Link
            to="/form"
            className="px-4 py-2 text-black bg-gray-200 rounded-xl font-semibold shadow-xl hover:bg-gray-300 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mt-10">
        <div className="flex justify-center mb-4">
          <span className="text-sm font-medium px-4 py-1 rounded-full bg-yellow-100 text-yellow-400 border border-yellow-300">
            Maximize your Efficiency & Productivity
          </span>
        </div>

        <h1 className="text-6xl font-extrabold mx-auto mb-4 leading-tight text-black">
          Create Stunning <span className="text-yellow-400">Portfolios</span> Effortlessly
        </h1>

        <p className="text-lg text-gray-600 mx-auto mb-8">
          Stand out from the crowd with a custom portfolio page! Showcase your skills, projects, and creativity with just a few clicks.
        </p>

        <div className="relative">
          <Link to="/form">
            <button className="px-12 py-3 text-lg bg-yellow-400 text-white rounded-full shadow-lg hover:bg-yellow-500 transition duration-300 transform hover:scale-105 cursor-pointer">
              Get Started
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sm text-gray-300">
        © 2025 OAsadiq | Built with <span className="text-red-400">❤️</span> | 
        <a href="#" className="ml-2 text-yellow-300 hover:underline">Contact Us</a> | 
        <a href="#" className="ml-2 text-yellow-300 hover:underline">Privacy Policy</a>
      </footer>
    </div>
  );
};

export default Home;
