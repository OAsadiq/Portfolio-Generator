/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import TutorialTour, { TourStep } from "../components/tutorial/TutorialTour";
import ReferralCard from "../components/ReferralCard";
import { track } from "../lib/track";

const KIT_OPTIONS = ["Photographer", "Developer / Engineer", "Designer", "Real Estate", "Consultant / Coach", "Other"];

const TEMPLATE_TOUR: TourStep[] = [
  { title: "Welcome to Porfilr", body: "Let's take 20 seconds to show you how to get a live portfolio. You can replay this anytime from the ? button.", placement: "center" },
  { selector: '[data-tour="tour-grid"]', title: "Pick a template", body: "Every template works for any profession — designer, developer, writer, photographer. Start free with Minimal, or unlock all three with Pro.", placement: "top" },
  { selector: '[data-tour="tour-card-actions"]', title: "Preview, then build", body: "Hit Preview to see a template full-screen, or “Use this” to jump straight into the editor and fill in your details.", placement: "top" },
];

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  price?: number;
  available?: boolean;
}

const STEPS = ["Pick a template", "Add your details", "Portfolio is live"];

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done
                  ? "bg-stone-900 text-white"
                  : active
                  ? "bg-orange-600 text-white"
                  : "bg-stone-100 border-2 border-stone-200 text-stone-400"
              }`}
            >
              {done ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                active ? "text-stone-900" : done ? "text-stone-500" : "text-stone-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-px mx-2 mb-5 ${done ? "bg-stone-900" : "bg-stone-200"}`} />
          )}
        </div>
      );
    })}
  </div>
);

const TemplateMockup = ({ id, hovered }: { id: string; hovered: boolean }) => {
  if (id === "minimal-template") {
    return (
      <div className={`w-full h-full bg-stone-50 p-5 transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}>
        {/* Nav */}
        <div className="flex items-center justify-between mb-5">
          <div className="h-2.5 w-16 bg-stone-900 rounded-full" />
          <div className="flex gap-2">
            <div className="h-1.5 w-8 bg-stone-300 rounded-full" />
            <div className="h-1.5 w-8 bg-stone-300 rounded-full" />
            <div className="h-1.5 w-8 bg-stone-300 rounded-full" />
          </div>
        </div>
        {/* Hero text block */}
        <div className="mb-4">
          <div className="h-4 w-3/4 bg-stone-800 rounded-md mb-2" />
          <div className="h-4 w-1/2 bg-stone-800 rounded-md mb-3" />
          <div className="h-2 w-full bg-stone-200 rounded-full mb-1" />
          <div className="h-2 w-5/6 bg-stone-200 rounded-full mb-1" />
          <div className="h-2 w-4/6 bg-stone-200 rounded-full mb-4" />
          <div className="h-7 w-28 bg-stone-900 rounded-lg" />
        </div>
        {/* Work grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 bg-stone-100 border border-stone-200 rounded-lg" />
          <div className="h-8 bg-stone-100 border border-stone-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (id === "modern-writer-template") {
    return (
      <div className={`w-full h-full bg-white p-5 transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}>
        {/* Nav */}
        <div className="flex items-center justify-between mb-5 pb-2.5 border-b border-stone-200">
          <div className="h-2.5 w-16 bg-stone-900 rounded-full" />
          <div className="flex gap-1.5">
            <div className="h-5 w-5 bg-stone-100 border border-stone-200 rounded-md" />
            <div className="h-5 w-5 bg-stone-100 border border-stone-200 rounded-md" />
          </div>
        </div>
        {/* Hero: label + big name */}
        <div className="mb-5">
          <div className="h-3 w-20 border border-stone-300 rounded-full mb-3" />
          <div className="h-6 w-4/5 bg-stone-900 rounded-md mb-1.5" />
          <div className="h-2 w-full bg-stone-200 rounded-full mb-1" />
          <div className="h-2 w-2/3 bg-stone-200 rounded-full mb-3" />
          <div className="flex gap-1.5">
            <div className="h-5 w-16 bg-stone-900 rounded-lg" />
            <div className="h-5 w-16 bg-white border border-stone-200 rounded-lg" />
          </div>
        </div>
        {/* Skill pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {["w-12", "w-10", "w-14", "w-9"].map((w, i) => (
            <div key={i} className={`h-4 ${w} border border-stone-200 rounded-full`} />
          ))}
        </div>
        {/* Work grid */}
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map(i => (
            <div key={i} className="border border-stone-200 rounded-lg overflow-hidden">
              <div className="h-8 bg-stone-100" />
              <div className="p-1.5">
                <div className="h-1.5 w-full bg-stone-300 rounded-full mb-1" />
                <div className="h-1.5 w-2/3 bg-stone-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "professional-writer-template") {
    return (
      <div className={`w-full h-full bg-white transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"} grid`} style={{ gridTemplateColumns: "38% 1fr" }}>
        {/* Sidebar */}
        <div className="p-4 flex flex-col gap-2.5" style={{ background: "#f8fafc", borderRight: "1px solid #e9edf2" }}>
          <div className="w-11 h-11 rounded-xl" style={{ background: "linear-gradient(135deg, #475569, #1e293b)" }} />
          <div className="h-2.5 w-16 rounded-full" style={{ background: "linear-gradient(135deg, #475569, #1e293b)" }} />
          <div className="h-1.5 w-12 bg-stone-300 rounded-full" />
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="h-1.5 w-14 bg-stone-200 rounded-full" />
            <div className="h-1.5 w-12 bg-stone-200 rounded-full" />
            <div className="h-1.5 w-16 rounded-full" style={{ background: "#cbd5e1" }} />
            <div className="h-1.5 w-10 bg-stone-200 rounded-full" />
          </div>
          <div className="mt-auto h-5 w-full rounded-lg" style={{ background: "linear-gradient(135deg, #475569, #1e293b)" }} />
        </div>
        {/* Content */}
        <div className="p-4">
          <div className="flex items-baseline gap-2 mb-2">
            <div className="h-1.5 w-3 rounded-full" style={{ background: "#475569" }} />
            <div className="h-3 w-16 bg-stone-800 rounded-md" />
          </div>
          <div className="h-1.5 w-full bg-stone-200 rounded-full mb-1" />
          <div className="h-1.5 w-5/6 bg-stone-200 rounded-full mb-4" />
          <div className="grid grid-cols-2 gap-1.5">
            <div className="h-9 border border-stone-200 rounded-lg" />
            <div className="h-9 border border-stone-200 rounded-lg" />
            <div className="h-9 border border-stone-200 rounded-lg" />
            <div className="h-9 border border-stone-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Fallback for any future templates
  return (
    <div className={`w-full h-full bg-stone-100 p-5 flex items-center justify-center transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}>
      <div className="text-center">
        <div className="w-10 h-10 bg-stone-200 rounded-xl mx-auto mb-2" />
        <div className="h-2 w-16 bg-stone-300 rounded-full mx-auto" />
      </div>
    </div>
  );
};

const TemplateSelection = () => {
  const navigate = useNavigate();
  const { user, hasPortfolio, existingPortfolio, isPro, checkPortfolio, checkSubscription, session } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedLoading, setSelectedLoading] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [attemptedTemplate, setAttemptedTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistKit, setWaitlistKit] = useState(KIT_OPTIONS[0]);
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  useEffect(() => {
    const key = `porfilr_welcomed_${user?.id}`;
    if (user && !localStorage.getItem(key)) {
      setShowWelcome(true);
    }
  }, [user]);

  const dismissWelcome = () => {
    const key = `porfilr_welcomed_${user?.id}`;
    localStorage.setItem(key, "1");
    setShowWelcome(false);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = session?.access_token;
        if (!token) { setError("Please log in to view templates"); setLoading(false); return; }
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || `Failed (${res.status})`); }
        const data = await res.json();
        const list = data.templates || data;
        if (!Array.isArray(list)) throw new Error("Invalid response");
        setTemplates(list);
      } catch (err: any) {
        setError(err.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
    if (user) { checkPortfolio(); checkSubscription(); }
  }, [user, checkPortfolio, checkSubscription, session]);

  const submitWaitlist = async () => {
    if (!user) return;
    setWaitlistStatus('saving');
    try {
      const { error } = await supabase.from('kit_waitlist').insert({
        user_id: user.id,
        email: user.email,
        kit: waitlistKit,
      });
      if (error) throw error;
      track('waitlist_joined', { kit: waitlistKit });
      setWaitlistStatus('done');
    } catch (err) {
      console.error('Waitlist error:', err);
      setWaitlistStatus('error');
    }
  };

  const isTemplateLocked = (id: string) => !isPro && id !== "minimal-template";
  const canSelectTemplate = (id: string) => isPro || id === "minimal-template";

  const handleSelect = async (templateId: string) => {
    if (!canSelectTemplate(templateId)) {
      setAttemptedTemplate(templates.find(t => t.id === templateId) || null);
      setShowUpgradeModal(true);
      track('upgrade_prompt_shown', { templateId, source: 'template_lock' });
      return;
    }
    track('template_selected', { templateId });
    try {
      setSelectedLoading(templateId);
      const selected = templates.find(t => t.id === templateId);
      if (!selected) return;
      localStorage.setItem("selectedTemplate", JSON.stringify(selected));
      navigate(`/create/${selected.id}`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSelectedLoading(null);
    }
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">Couldn't load templates</h3>
          <p className="text-stone-500 text-sm mb-5">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {!loading && templates.length > 0 && (
        <TutorialTour steps={TEMPLATE_TOUR} storageKey={`porfilr_tour_templates_v1_${user?.id || 'anon'}`} />
      )}

      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/"><Logo size={28} /></Link>
          <Link to="/" className="text-stone-500 hover:text-stone-800 text-sm transition">
            ← Back to Home
          </Link>
        </div>
        {user && (
          <span className="text-stone-400 text-sm">{user.email}</span>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Step indicator */}
        <StepIndicator current={0} />

        {/* Welcome banner — first visit only */}
        {showWelcome && (
          <div className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {firstName[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-stone-900 font-bold text-base mb-0.5">Welcome, {firstName}.</p>
              <p className="text-stone-600 text-sm">
                You're 3 steps from a live portfolio. Pick a template below, fill in your details, and your link is ready to share — in under 10 minutes.
              </p>
            </div>
            <button onClick={dismissWelcome} className="text-stone-400 hover:text-stone-600 transition mt-0.5 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Choose your template.
          </h1>
          <p className="text-stone-500 text-base">
            {isPro ? "All templates unlocked." : "Start free with Minimal. Upgrade any time for Pro templates."}
          </p>
        </div>

        {/* Refer & earn — free users earn their way to Pro (the dashboard is Pro-only). */}
        {!isPro && <ReferralCard />}

        {/* Existing portfolio block */}
        {hasPortfolio && existingPortfolio && (
          <div className="mb-8 bg-white border border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-900 text-sm mb-0.5">You already have a portfolio</p>
              <p className="text-stone-500 text-sm">Each account gets one. Edit your existing portfolio, or delete it first to switch templates.</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link
                to={isPro ? `/builder/${existingPortfolio.slug}` : `/edit/${existingPortfolio.slug}`}
                className="bg-stone-900 hover:bg-stone-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                Edit mine
              </Link>
              <Link
                to={isPro ? "/dashboard" : "/dashboard"}
                className="border border-stone-200 hover:bg-stone-50 text-stone-700 px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Template grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin"></div>
            <p className="text-stone-400 text-sm">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <p className="text-center text-stone-400 py-16">No templates available</p>
        ) : (
          <div data-tour="tour-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, idx) => {
              const isLoading = selectedLoading === template.id;
              const isLocked = isTemplateLocked(template.id);
              const isFree = template.id === "minimal-template";
              const isHovered = hoveredTemplate === template.id;

              return (
                <div
                  key={template.id}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200 ${
                    isHovered ? "border-stone-300 shadow-md -translate-y-0.5" : "border-stone-200"
                  } ${isLocked ? "opacity-75" : ""}`}
                >
                  {/* Visual mockup */}
                  <div className="relative h-48 overflow-hidden">
                    <TemplateMockup id={template.id} hovered={isHovered} />

                    {/* Tier badge */}
                    <div className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      isFree ? "bg-white/90 text-stone-600 border border-stone-200" : "bg-orange-600 text-white"
                    }`}>
                      {isFree ? "Free" : "Pro"}
                    </div>

                    {/* Lock overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-center shadow-sm">
                          <svg className="w-5 h-5 text-stone-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="text-stone-700 text-xs font-semibold">Pro only</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="font-bold text-stone-900 text-base mb-1">{template.name}</h3>
                    <p className="text-stone-400 text-xs leading-relaxed mb-4 line-clamp-2">{template.description}</p>
                    <div className="flex gap-2" data-tour={idx === 0 ? "tour-card-actions" : undefined}>
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="flex-1 border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 py-2.5 rounded-xl text-sm font-medium transition"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleSelect(template.id)}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                          isLocked
                            ? "bg-stone-100 text-stone-400 hover:bg-orange-50 hover:text-orange-600 hover:border hover:border-orange-200"
                            : "bg-stone-900 hover:bg-stone-700 text-white"
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                            Loading
                          </span>
                        ) : isLocked ? "Upgrade" : "Use this →"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Coming soon — niche kits teaser */}
            <button
              onClick={() => { setWaitlistStatus('idle'); setShowWaitlist(true); }}
              className="group text-left bg-stone-50 rounded-2xl overflow-hidden border-2 border-dashed border-stone-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-200 flex flex-col"
            >
              <div className="relative h-48 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="w-11 h-11 bg-white border border-stone-200 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-stone-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-stone-600">More kits on the way</p>
                </div>
                <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-stone-200 text-stone-500">
                  Soon
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-stone-900 text-base mb-1">Niche template kits</h3>
                <p className="text-stone-400 text-xs leading-relaxed mb-4 line-clamp-2">Tailored sections for photographers, developers, real estate & more. Tell us which to build first.</p>
                <span className="block w-full text-center border border-stone-200 group-hover:border-orange-300 group-hover:text-orange-600 text-stone-600 py-2.5 rounded-xl text-sm font-semibold transition">
                  Get notified →
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Upgrade modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-900 text-center mb-1">Pro template</h3>
            {attemptedTemplate && (
              <p className="text-center text-stone-500 text-sm mb-4">"{attemptedTemplate.name}" requires a Pro subscription.</p>
            )}
            <ul className="space-y-2 mb-6">
              {["All 3 premium templates", "Custom domain (yourname.com)", "Portfolio analytics", "Priority support"].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-stone-700">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowUpgradeModal(false); setAttemptedTemplate(null); }}
                className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-600 py-2.5 rounded-xl text-sm font-medium transition"
              >
                Not now
              </button>
              <Link to="/pricing" className="flex-1">
                <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold transition">
                  Unlock Pro — $19 once
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist modal */}
      {showWaitlist && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowWaitlist(false)}>
          <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            {waitlistStatus === 'done' ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-1">You're on the list</h3>
                <p className="text-stone-500 text-sm mb-6">We'll email <span className="font-medium text-stone-700">{user?.email}</span> the moment the {waitlistKit} kit is ready.</p>
                <button onClick={() => setShowWaitlist(false)} className="w-full bg-stone-900 hover:bg-stone-700 text-white py-2.5 rounded-xl text-sm font-bold transition">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 text-center mb-1">Get notified</h3>
                <p className="text-center text-stone-500 text-sm mb-5">We're building niche template kits. Which one should we ship first?</p>

                <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">I want a kit for</label>
                <select
                  value={waitlistKit}
                  onChange={e => setWaitlistKit(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition mb-5"
                >
                  {KIT_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>

                {waitlistStatus === 'error' && (
                  <p className="text-red-500 text-xs mb-3 text-center">Couldn't save that — please try again.</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowWaitlist(false)}
                    className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-600 py-2.5 rounded-xl text-sm font-medium transition"
                  >
                    Not now
                  </button>
                  <button
                    onClick={submitWaitlist}
                    disabled={waitlistStatus === 'saving'}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold transition"
                  >
                    {waitlistStatus === 'saving' ? 'Saving…' : 'Notify me'}
                  </button>
                </div>
                <p className="text-center text-stone-400 text-[11px] mt-3">We'll only email you about new kits. No spam.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 flex-shrink-0">
              <div>
                <h3 className="font-bold text-stone-900">{previewTemplate.name}</h3>
                <p className="text-stone-400 text-xs">{previewTemplate.description}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <iframe
              src={`/templates/${previewTemplate.id}/preview.html`}
              title={`${previewTemplate.name} Preview`}
              className="flex-1 w-full border-none"
            />
            <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 flex-shrink-0">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${previewTemplate.id === "minimal-template" ? "bg-stone-100 text-stone-600" : "bg-orange-100 text-orange-700"}`}>
                {previewTemplate.id === "minimal-template" ? "Free" : "Pro"}
              </span>
              <button
                onClick={() => { setPreviewTemplate(null); handleSelect(previewTemplate.id); }}
                className="bg-stone-900 hover:bg-stone-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Use this template →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;
