import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const Success = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const sessionId = searchParams.get("session_id");
    const [countdown, setCountdown] = useState(10); // Increased to wait for webhook
    const [verifying, setVerifying] = useState(true);
    const [subscriptionActive, setSubscriptionActive] = useState(false);

    useEffect(() => {
        if (!sessionId) {
            navigate("/");
            return;
        }

        // Check if subscription is active
        const checkSubscription = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('subscriptions')
                    .select('status, plan')
                    .eq('user_id', user.id)
                    .single();

                if (!error && data && data.status === 'active' && data.plan === 'pro') {
                    setSubscriptionActive(true);
                    setVerifying(false);
                }
            } catch (err) {
                console.error('Error checking subscription:', err);
            }
        };

        // Check immediately
        checkSubscription();

        // Keep checking every 2 seconds for up to 10 seconds
        const checkInterval = setInterval(checkSubscription, 2000);
        
        // Stop checking after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            setVerifying(false);
        }, 10000);

        // Countdown timer
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

        return () => {
            clearInterval(timer);
            clearInterval(checkInterval);
        };
    }, [sessionId, navigate, user]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-green-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/10">
                        {verifying && !subscriptionActive ? (
                            <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-slate-50 mb-2">
                        {subscriptionActive ? "You're All Set! 🎉" : "Payment Successful!"}
                    </h1>
                    
                    <p className="text-slate-400 mb-8">
                        {verifying && !subscriptionActive
                            ? "Setting up your Pro account..."
                            : subscriptionActive
                            ? "Your Pro subscription is now active. Enjoy unlimited templates and premium features!"
                            : "Thank you for upgrading to Pro. Your account has been updated with premium features."
                        }
                    </p>

                    {/* Status Indicator */}
                    {verifying && !subscriptionActive && (
                        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                            <div className="flex items-center justify-center gap-2 text-blue-400 text-sm">
                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>Activating Pro features...</span>
                            </div>
                        </div>
                    )}

                    {subscriptionActive && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                            <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Pro subscription activated!</span>
                            </div>
                        </div>
                    )}

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