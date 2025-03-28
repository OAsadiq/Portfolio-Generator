import { Link } from "react-router-dom";
import { FaTwitter } from "react-icons/fa";

const Navbar = () => {
    const shareOnTwitter = () => {
        const text = encodeURIComponent("Create your stunning portfolio effortlessly with Portfolio-Generator!");
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    };

    return (
        <div>
            <nav className="flex justify-between items-center max-w-7xl mx-auto mb-8 p-4 bg-white rounded-xl shadow-lg">
                <Link to="/" className="text-xl font-bold text-gray-900 transition">
                    Portfolio-Generator
                </Link>

                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-900 font-semibold text-md hover:text-gray-500">
                        Home
                    </Link>
                    <Link to="#" className="text-gray-300 font-semibold text-md cursor-not-allowed">
                        Pricing (Coming soon)
                    </Link>
                    <Link to="/contact" className="text-gray-900 font-semibold text-md hover:text-gray-500">
                        Contact
                    </Link>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={shareOnTwitter}
                        className="hidden sm:flex bg-white text-gray-900 px-2 rounded-lg transition items-center justify-center hover:text-blue-400"
                    >
                        <FaTwitter className="mr-2" /> Share
                    </button>

                    <Link
                        to="/form-sample"
                        className="px-4 py-2 text-black bg-gray-200 rounded-xl font-semibold shadow-xl hover:bg-gray-300 transition"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;