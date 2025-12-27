import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Hero = () => {
    const [userCount, setUserCount] = useState<number | null>(null);

    useEffect(() => {
        fetch("/api/stats/portfolio-count")
            .then(res => res.json())
            .then(data => setUserCount(data.count));
    }, []);

    const [animatedCount, setAnimatedCount] = useState(0);

    useEffect(() => {
        if (userCount === null) return;

        const duration = 1200;
        const startTime = performance.now();

        const animate = (time: number) => {
            const progress = Math.min((time - startTime) / duration, 1);
            const value = Math.floor(progress * userCount);
            setAnimatedCount(value);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [userCount]);

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
                    Trusted by Freelance Writers
                </span>
            </div>

            {/* Main Heading - WRITER FOCUSED */}
            <h1 className="
                text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
                font-extrabold mb-4 leading-tight text-gray-800
            ">
                Professional <span className="text-yellow-500">Writing Portfolios</span> in Less Than 10 Minutes
            </h1>

            {/* Subheading - WRITER FOCUSED */}
            <p className="
                text-sm sm:text-base md:text-lg 
                text-gray-600 mx-auto mb-8 max-w-2xl
            ">
                Land more freelance clients with a portfolio that showcases your best work. No coding, no design skills—just your writing.
            </p>

            {/* CTA Button */}
            <div className="relative">
                <Link to="/templates">
                    <button className="
                        px-8 sm:px-10 md:px-12 
                        py-3 
                        text-base sm:text-lg
                        font-semibold 
                        bg-yellow-500 text-gray-800 
                        rounded-xl shadow-lg 
                        hover:bg-yellow-400 
                        transition duration-300 
                        transform hover:scale-105 
                        cursor-pointer
                    ">
                        Create Your Portfolio
                    </button>
                </Link>
            </div>
            <div className="flex items-center justify-center gap-3 mt-8 text-black">
                <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-pink-400" />
                    <div className="h-6 w-6 rounded-full bg-blue-400" />
                    <div className="h-6 w-6 rounded-full bg-green-400" />
                    <div className="h-6 w-6 rounded-full bg-orange-400" />
                </div>

                <p className="text-sm sm:text-base md:text-lg ">
                    <span className="font-bold">{animatedCount}+</span> Writers Using Our Platform
                </p>
            </div>
        </div>
    );
};

export default Hero;