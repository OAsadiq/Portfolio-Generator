import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { track } from "../lib/track";

// Landing page after a kit purchase (Stripe success_url → /template-success?template_id=).
// The webhook that records the purchase can lag the redirect by a few seconds, so we poll
// template_purchases until it lands, then refresh entitlements so the build gate opens.
const TemplateSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, checkSubscription } = useAuth();
  const templateId = searchParams.get("template_id");

  const [confirmed, setConfirmed] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const tracked = useRef(false);

  const kitLabel = templateId === "trader-template" ? "Trader Kit" : "kit";

  useEffect(() => {
    if (!templateId) { navigate("/templates"); return; }

    const check = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("template_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("template_id", templateId)
        .maybeSingle();
      if (!error && data) {
        setConfirmed(true);
        setVerifying(false);
        // Refresh ownedTemplates so /create/:id doesn't send them back to the paywall.
        checkSubscription();
        if (!tracked.current) { tracked.current = true; track("kit_purchase_confirmed", { templateId }); }
      }
    };

    check();
    const interval = setInterval(check, 2000);
    // Stop after 14s: the purchase is real (Stripe redirected here), the webhook is just
    // slow. Show a reassuring state and let them proceed rather than spin forever.
    const stop = setTimeout(() => { clearInterval(interval); setVerifying(false); }, 14000);
    return () => { clearInterval(interval); clearTimeout(stop); };
  }, [templateId, user, navigate, checkSubscription]);

  const startBuilding = () => navigate(`/create/${templateId}`);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <Link to="/"><Logo size={36} /></Link>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50 border border-green-100">
            {verifying && !confirmed ? (
              <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            {confirmed ? `The ${kitLabel} is yours.` : "Payment successful!"}
          </h1>

          <p className="text-stone-500 text-sm mb-6">
            {verifying && !confirmed
              ? "Unlocking your kit, just a moment…"
              : confirmed
                ? "Everything's ready — build your page, log your trades, and put a live track record in front of investors."
                : "Thank you! Your kit is being unlocked — this can take a few seconds. You can start building now."}
          </p>

          <button
            onClick={startBuilding}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition mb-3 text-sm"
          >
            Start building
          </button>
          <Link to="/dashboard" className="text-stone-400 hover:text-stone-700 text-sm transition">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TemplateSuccess;
