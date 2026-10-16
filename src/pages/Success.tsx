import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { track } from "../lib/track";

const Success = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const sessionId = searchParams.get("session_id");
    // Crypto arrivals have no Stripe session. They also wait much longer: the chain has to
    // confirm and the IPN has to land, which is minutes rather than seconds.
    const isCrypto = searchParams.get("crypto") === "1";
    const product = searchParams.get("product") || "pro";
    const isPro = product === "pro";
    const [countdown, setCountdown] = useState(5);
    const [verifying, setVerifying] = useState(true);
    const [subscriptionActive, setSubscriptionActive] = useState(false);
    const purchaseTracked = useRef(false);

    useEffect(() => {
        if (!sessionId && !isCrypto) {
            navigate("/");
            return;
        }

        const checkSubscription = async () => {
            if (!user) return;
            try {
                // A kit is an entitlement row, not a subscription — checking `subscriptions`
                // for a kit buyer would poll forever and then tell them it hadn't worked.
                if (!isPro) {
                    const { data } = await supabase
                        .from('template_purchases')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('template_id', product)
                        .maybeSingle();
                    if (data) {
                        setSubscriptionActive(true);
                        setVerifying(false);
                        if (!purchaseTracked.current) { purchaseTracked.current = true; track('kit_purchased', { product, crypto: isCrypto }); }
                    }
                    return;
                }

                const { data, error } = await supabase
                    .from('subscriptions')
                    .select('status, plan')
                    .eq('user_id', user.id)
                    .single();

                if (!error && data && data.status === 'active' && data.plan === 'pro') {
                    setSubscriptionActive(true);
                    setVerifying(false);
                    if (!purchaseTracked.current) { purchaseTracked.current = true; track('pro_purchased', { sessionId, crypto: isCrypto }); }
                }
            } catch (err) {
                console.error('Error checking subscription:', err);
            }
        };

        checkSubscription();
        // Card clears in seconds; a chain confirmation does not. Giving up after 12s on a
        // crypto payment would tell someone who HAS paid that nothing happened.
        const checkInterval = setInterval(checkSubscription, isCrypto ? 4000 : 2000);
        const stopChecking = setTimeout(() => {
            clearInterval(checkInterval);
            setVerifying(false);
        }, isCrypto ? 240000 : 12000);

        return () => {
            clearInterval(checkInterval);
            clearTimeout(stopChecking);
        };
    }, [sessionId, navigate, user, isCrypto, isPro, product]);

    // Only start countdown once subscription is confirmed (or verification timed out)
    useEffect(() => {
        if (verifying) return;
        // Never bounce an unconfirmed crypto buyer to the dashboard. Their payment may
        // still be confirming, and the dashboard would show no access — the exact thing
        // that makes someone think they've been charged for nothing.
        if (isCrypto && !subscriptionActive) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/dashboard");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [verifying, navigate]);

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link to="/"><Logo size={36} /></Link>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50 border border-green-100">
                        {verifying && !subscriptionActive ? (
                            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>

                    {/* Copy branches on the product AND the rail. Telling a kit buyer
                        "You're now Pro!" would be wrong, and telling a crypto buyer their
                        payment failed because a chain took four minutes would be worse. */}
                    <h1 className="text-2xl font-bold text-stone-900 mb-2">
                        {subscriptionActive
                            ? (isPro ? "You're now Pro!" : "You're in.")
                            : isCrypto ? "Payment received" : "Payment successful!"}
                    </h1>

                    <p className="text-stone-500 text-sm mb-6">
                        {verifying && !subscriptionActive
                            ? (isCrypto
                                ? "Waiting for the network to confirm. This usually takes a few minutes — you don't have to stay on this page, it unlocks on its own."
                                : `Activating your ${isPro ? 'Pro account' : 'kit'}, just a moment...`)
                            : subscriptionActive
                            ? (isPro
                                ? "Your Pro access is active. Enjoy all Pro templates, custom domain and priority support."
                                : "Your kit is unlocked. Unlimited trades, and no Porfilr badge on your page.")
                            : isCrypto
                            ? "Your payment is confirming on-chain. It unlocks automatically once it lands — usually a few minutes, occasionally longer. Nothing else is needed from you. If it hasn't appeared within the hour, reply to your receipt and I'll sort it."
                            : `Thank you. Your account is being set up.`
                        }
                    </p>

                    {/* Status pill */}
                    {verifying && !subscriptionActive ? (
                        <div className="mb-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-sm">
                            <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            <span>Activating Pro features...</span>
                        </div>
                    ) : (
                        <div className="mb-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Pro subscription activated</span>
                        </div>
                    )}

                    <Link to="/dashboard">
                        <button className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition mb-4 text-sm">
                            Go to Dashboard
                        </button>
                    </Link>

                    {!verifying && (
                        <p className="text-stone-400 text-xs">Redirecting to dashboard in {countdown}s...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Success;
