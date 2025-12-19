import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Hero = () => {
    const [userCount, setUserCount] = useState<number | null>(null);

    useEffect(() => {
        fetch("/api/stats/portfolio-count")
            .then(res => res.json())
            .then(data => setUserCount(data.count));
    }, []);


    return (
        <div className="max-w-4xl mx-auto text-center mt-10 px-4">
            
            {/* Top Badge */}
            <div className="flex justify-center mb-4">
                <span className="
                    text-xs sm:text-sm 
                    font-medium 
                    px-3 py-1 sm:px-4 sm:py-1 
                    rounded-xl 
                    bg-yellow-100 text-yellow-600 
                    border border-yellow-400
                ">
                    Maximize your Efficiency & Productivity
                </span>
            </div>

            {/* Main Heading */}
            <h1 className="
                text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
                font-extrabold mb-4 leading-tight text-black
            ">
                Create Stunning <span className="text-yellow-500">Portfolios</span> Effortlessly
            </h1>

            {/* Subheading */}
            <p className="
                text-sm sm:text-base md:text-lg 
                text-gray-600 mx-auto mb-8 max-w-2xl
            ">
                Stand out from the crowd with a custom portfolio page! Showcase your skills, projects, and creativity with just a few clicks.
            </p>

            {/* CTA Button */}
            <div className="relative">
                <Link to="/templates">
                    <button className="
                        px-8 sm:px-10 md:px-12 
                        py-3 
                        text-base sm:text-lg 
                        bg-yellow-500 text-white 
                        rounded-xl shadow-lg 
                        hover:bg-yellow-400 
                        transition duration-300 
                        transform hover:scale-105 
                        cursor-pointer
                    ">
                        Get Started
                    </button>
                </Link>
            </div>
            <div className="text-center py-6">
                <p>{userCount}+ portfolios generated</p>
            </div>
        </div>
    );
};

export default Hero;
