import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Hero = () => {
    const [userCount, setUserCount] = useState<number | null>(null);

    useEffect(() => {
        // fetch("/api/stats/portfolio-count")
        //     .then(res => res.json())
        //     .then(data => setUserCount(data.count));

        const fetchWaitlistCount = async () => {
            const { count, error } = await supabase
                .from("waitlist")
                .select("*", { count: "exact", head: true });

            if (!error && count !== null) {
                setUserCount(count);
            }
        };

        fetchWaitlistCount();
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

    // const scrollToWaitlist = () => {
    //     const waitlistSection = document.getElementById('waitlist');
    //     if (waitlistSection) {
    //         waitlistSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    //     }
    // };

    return (
        <div className="max-w-4xl mx-auto text-center mt-10 px-4">
            
            {/* Top Badge */}
            <div className="flex justify-center mb-4">
                <span className="
                    text-xs sm:text-sm 
                    font-medium 
                    px-3 py-1 sm:px-4 sm:py-1 
                    rounded-xl 
                    bg-yellow-500/10 text-yellow-400
                    border border-yellow-500/30
                ">
                    Trusted by Freelance Writers
                </span>
            </div>

            {/* Main Heading - WRITER FOCUSED */}
            <h1 className="
                text-3xl sm:text-4xl md:text-5xl lg:text-6xl 
                font-extrabold mb-4 leading-tight text-slate-50
            ">
                Stop Losing Clients to Writers With Better Portfolios
            </h1>

            {/* Subheading - WRITER FOCUSED */}
            <p className="
                text-sm sm:text-base md:text-lg 
                text-slate-400 mx-auto mb-8 max-w-2xl
            ">
                You're a great writer. But without a portfolio, clients 
                can't see it. Build yours in 10 minutes—no code, no 
                design skills, no $300/year fees.
            </p>

            {/* CTA Button */}
            <div className="relative">
                
                <Link to="/templates" target="_blank" rel="noopener noreferrer">
                    <button 
                        className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all transform hover:scale-105"
                    >
                        Start Building Free 
                    </button>
                </Link>
            </div>
            <div className="flex items-center justify-center gap-3 mt-8 text-slate-300">
                <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-pink-400 border-2 border-slate-900" />
                    <div className="h-6 w-6 rounded-full bg-blue-400 border-2 border-slate-900" />
                    <div className="h-6 w-6 rounded-full bg-green-400 border-2 border-slate-900" />
                    <div className="h-6 w-6 rounded-full bg-orange-400 border-2 border-slate-900" />
                </div>

                <p className="text-sm sm:text-base md:text-lg ">
                    Join <span className="font-bold text-yellow-400">{animatedCount}+</span> Writers Who Signed Up
                </p>
            </div>
        </div>
    );
};

export default Hero;