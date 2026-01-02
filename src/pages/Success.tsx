import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const Success = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get("session_id");
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!sessionId) {
            navigate("/");
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/templates");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [sessionId, navigate]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-green-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/10">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-50 mb-2">Payment Successful!</h1>
                    <p className="text-slate-400 mb-8">
                        Thank you for upgrading to Pro. Your account has been updated with premium features.
                    </p>

                    <Link to="/templates">
                        <button className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20 mb-4">
                            Create Pro Portfolio
                        </button>
                    </Link>

                    <p className="text-slate-500 text-sm">
                        Redirecting in {countdown}s...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Success;
