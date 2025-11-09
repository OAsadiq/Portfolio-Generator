import { Link } from "react-router-dom";

const Hero = () => {
    return (
        <div className="max-w-4xl mx-auto text-center mt-10">
            <div className="flex justify-center mb-4">
                <span className="text-sm font-medium px-4 py-1 rounded-xl bg-yellow-100 text-yellow-500 border border-yellow-400">
                    Maximize your Efficiency & Productivity
                </span>
            </div>

            <h1 className="text-6xl font-extrabold mx-auto mb-4 leading-tight text-black">
            Create Stunning <span className="text-yellow-500">Portfolios</span> Effortlessly
            </h1>

            <p className="text-lg text-gray-600 mx-auto mb-8">
            Stand out from the crowd with a custom portfolio page! Showcase your skills, projects, and creativity with just a few clicks.
            </p>

            <div className="relative">
                <Link to="/templates">
                    <button className="px-12 py-3 text-lg bg-yellow-500 text-white rounded-xl shadow-lg hover:bg-yellow-400 transition duration-300 transform hover:scale-105 cursor-pointer">
                    Get Started
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default Hero;