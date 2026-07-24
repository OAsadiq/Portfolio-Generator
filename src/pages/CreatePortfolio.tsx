/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import PortfolioVisualBuilder from "../components/PortfolioVisualBuilder.tsx";
import SharePortfolio from "../components/SharePortfolio";
import { track } from "../lib/track";
import { suggestEmailFix } from "../lib/emailTypo";

interface TemplateField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  section?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
  /** Unlocked by the one-time Pro purchase. */
  isPro?: boolean;
  /** Edited in the visual builder rather than the form flow. Independent of pricing. */
  usesBuilder?: boolean;
  /** Sold separately as a kit — Pro does NOT unlock it. */
  kit?: string | null;
  kitName?: string | null;
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
            <span className={`text-xs font-medium hidden sm:block ${active ? "text-stone-900" : done ? "text-stone-500" : "text-stone-400"}`}>
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

const SECTION_META: Record<string, { label: string; icon: string }> = {
  personal: { label: "About you", icon: "👤" },
  samples: { label: "Your work", icon: "📎" },
  services: { label: "Services", icon: "🛠️" },
  testimonials: { label: "Client testimonials", icon: "💬" },
  contact: { label: "Contact details", icon: "📧" },
  other: { label: "Additional info", icon: "📋" },
};

const CreatePortfolio = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const draftKey = `porfilr_draft_${templateId}`;
  const [template, setTemplate] = useState<Template | null>(null);
  // Restore any saved draft SYNCHRONOUSLY on first render — so a logged-out visitor's
  // work is already there when they come back from signup. Doing this in an effect raced
  // with the auto-save effect and re-renders from auth/template loading, which wiped it.
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    try { const raw = localStorage.getItem(`porfilr_draft_${templateId}`); return raw ? JSON.parse(raw) : {}; }
    catch { return {}; }
  });
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kitLoading, setKitLoading] = useState(false);
  const [kitError, setKitError] = useState<string | null>(null);
  // Referral reward: 1 earned kit. Shown on the paywall so someone who's earned one
  // isn't quoted a price for something they already paid for with referrals.
  const [kitCredit, setKitCredit] = useState(0);
  const [completedFields, setCompletedFields] = useState(0);
  const [copied, setCopied] = useState(false);
  const { user, isPro, ownsTemplate, checkSubscription } = useAuth();

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `profile-pictures/${user?.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    // localStorage gives an instant first paint, but it can be STALE — a template cached
    // before the kit/pricing flags existed has no `kit`, which would make the access gate
    // fall through to the wrong paywall. So we always re-fetch the authoritative template
    // and let it win. (Gating still can't be trusted to the client alone — publish is
    // enforced server-side — but the UI must at least show the right paywall.)
    const stored = localStorage.getItem("selectedTemplate");
    if (stored) {
      try {
        const parsed: Template = JSON.parse(stored);
        if (parsed.id === templateId) setTemplate(parsed);
      } catch { /* ignore corrupt cache */ }
    }

    let cancelled = false;
    fetch(`${import.meta.env.VITE_API_URL}/api/templates`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.templates) return;
        const fresh = data.templates.find((t: Template) => t.id === templateId);
        if (fresh) {
          setTemplate(fresh);
          localStorage.setItem("selectedTemplate", JSON.stringify(fresh));
        }
      })
      .catch(() => { /* keep the cached copy if the refresh fails */ });
    return () => { cancelled = true; };
  }, [templateId]);

  // Auto-save the draft as they type, so it survives the signup redirect. (Restore is
  // done synchronously in the formData initializer above.)
  useEffect(() => {
    if (Object.keys(formData).length) localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [formData, draftKey]);

  // Does this user have an unspent referral kit credit?
  useEffect(() => {
    if (!user) { setKitCredit(0); return; }
    supabase
      .from('referrals')
      .select('kit_credit')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setKitCredit(data?.kit_credit || 0));
  }, [user]);

  useEffect(() => {
    if (template) {
      const filled = Object.keys(formData).filter(k => formData[k]).length;
      setCompletedFields(filled);
    }
  }, [formData, template]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      // Image upload needs an authenticated storage path, and File objects can't survive
      // the signup redirect. So this is the one spot we ask a logged-out user to sign up —
      // their typed text is already saved as a draft and will be here when they return.
      if (!user) { promptSignup(); return; }
      const url = await uploadImage(files[0]);
      setFormData(prev => ({ ...prev, [name]: url }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Send a logged-out user to sign up, returning to this exact page. Their draft is in
  // localStorage, so the form is restored and they can finish where they left off.
  const promptSignup = () => {
    localStorage.setItem(draftKey, JSON.stringify(formData));
    // Router state.from is lost across Google's OAuth round-trip, so also stash the
    // return path in localStorage — AuthCallback reads it to bring them back here.
    localStorage.setItem('porfilr_after_login', `/create/${templateId}`);
    navigate('/login', { state: { from: { pathname: `/create/${templateId}` } } });
  };

  /** Buy a kit outright. Deliberately independent of the Pro flow — a free user can
   *  come straight here without upgrading first. */
  const buyKit = async () => {
    if (!user) {
      // Send them to sign in, then straight back to this template.
      navigate('/login', { state: { from: { pathname: `/create/${templateId}` } } });
      return;
    }
    setKitLoading(true);
    setKitError(null);
    try {
      // Price is resolved server-side from templateId — the client must not send it, or
      // it could substitute a cheaper price. See KIT_PRICE_ENV in api/stripe/actions.js.
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-template-checkout',
          templateId: template?.id,
          userId: user.id,
          userEmail: user.email,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = 'Failed to start checkout';
        try { msg = JSON.parse(text).error || msg; } catch { /* empty */ }
        throw new Error(msg);
      }
      const data = await res.json();

      // A referral credit (or an existing purchase) unlocks the kit without Stripe —
      // there's no checkout URL in that case, and treating it as an error would tell
      // someone their free kit failed.
      if (data.granted || data.alreadyOwned) {
        await checkSubscription(); // refresh ownedTemplates so the gate opens
        track(data.granted ? 'kit_granted' : 'kit_already_owned', {
          templateId: template?.id,
          reason: data.reason || null,
        });
        setKitLoading(false);
        return;
      }

      if (data.url) window.location.href = data.url;
      else throw new Error('No checkout URL returned');
    } catch (err: any) {
      setKitError(err.message || 'Could not start checkout. Please try again.');
      setKitLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId) return;
    // The signup wall lives HERE now — at Publish, after they've done the work. Their
    // filled-in form is saved as a draft and restored when they come back signed in.
    if (!user) { track('publish_signup_prompt', { templateId }); promptSignup(); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("Please log in to continue"); setLoading(false); return; }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/create-portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ templateId, formData }),
      });
      if (res.status === 413) throw new Error("Image is too large. Please use a smaller file and try again.");
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "FREE_TEMPLATE_LIMIT_REACHED") throw new Error("You've already used your free template. Upgrade to Pro!");
        if (data.code === "PRO_TEMPLATE_REQUIRED") throw new Error("This template requires a Pro subscription.");
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setPortfolioSlug(data.portfolioSlug);
      localStorage.removeItem(draftKey); // published — draft no longer needed
      track('portfolio_published', { templateId, tier: 'free' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFieldSection = (name: string) => {
    if (["fullName", "role", "bio", "profileImage", "profilePicture", "location", "writerType"].some(k => name.includes(k))) return "personal";
    if (name.includes("sample")) return "samples";
    if (name.includes("service")) return "services";
    if (name.includes("testimonial")) return "testimonials";
    if (["email", "linkedin", "twitter", "website"].some(k => name.includes(k))) return "contact";
    return "other";
  };

  const groupedFields = template?.fields?.reduce((acc, field) => {
    const section = getFieldSection(field.name);
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  const totalFields = template?.fields?.length || 1;
  const progress = Math.round((completedFields / totalFields) * 100);
  // Two separate questions that used to be one flag:
  //   usesBuilder  — how it's edited (visual builder vs the form flow)
  //   access       — who's allowed to use it (Pro unlock, kit purchase, or free)
  // Conflating them meant the Trader Kit was unlocked by the $19 Pro purchase.
  const usesBuilder =
    template?.usesBuilder || template?.id === "professional-writer-template" || template?.isPro;
  const isProTemplate = template?.id === "professional-writer-template" || template?.isPro;
  const kitId = template?.kit || null;
  const hasAccess = kitId
    ? !!template && ownsTemplate(template.id) // kits are bought outright — Pro does not include them
    : isProTemplate
      ? isPro
      : true;

  // Loading template
  if (!template) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin"></div>
          <p className="text-stone-400 text-sm">Loading template...</p>
        </div>
      </div>
    );
  }

  // Kit gate — deliberately NOT the Pro gate. A kit is its own product: buying it
  // requires no Pro purchase (no double paywall), and owning Pro doesn't grant it.
  if (kitId && !hasAccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">{template.kitName || 'Kit'}</h2>
          <p className="text-stone-500 text-sm mb-5">
            A track-record page that updates itself. Log your trades and Porfilr works out your return, win
            rate, drawdown and equity curve — then keeps your page current, with the date you last traded.
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'The Trader template + visual builder',
              'Private trade journal',
              'Live track record on your page',
              'Built-in contact form for investors',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                <svg className="w-4 h-4 text-emerald-500 flex-none mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          {kitCredit > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-emerald-800 text-sm font-semibold">You've earned a free kit.</p>
              <p className="text-emerald-700 text-xs mt-0.5">
                Your referral credit covers this — you won't be charged.
              </p>
            </div>
          )}
          {kitError && <p className="text-red-500 text-sm mb-3">{kitError}</p>}
          <button
            onClick={buyKit}
            disabled={kitLoading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition"
          >
            {kitLoading
              ? (kitCredit > 0 ? 'Unlocking…' : 'Opening checkout…')
              : kitCredit > 0 ? 'Unlock with my referral credit' : 'Get the Trader Kit'}
          </button>
          {kitCredit === 0 && (
            <p className="text-stone-400 text-xs text-center mt-3">
              {/* Say this plainly: Pro is a different product and does not include kits. */}
              Sold separately — you don't need Pro.
            </p>
          )}
          <div className="text-center mt-4">
            <Link to="/templates" className="text-stone-400 hover:text-stone-700 text-sm transition">
              ← Back to templates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pro gate
  if (isProTemplate && !isPro) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Pro template</h2>
          <p className="text-stone-500 text-sm mb-6">This template is available on Pro. Pay a one-time $19 to unlock all templates, custom domains, and analytics — yours forever.</p>
          <Link to="/pricing" className="block mb-3">
            <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold text-sm transition">
              Upgrade to Pro
            </button>
          </Link>
          <Link to="/templates" className="text-stone-400 hover:text-stone-700 text-sm transition">
            ← Back to templates
          </Link>
        </div>
      </div>
    );
  }

  // Visual builder — reached once access is granted, whether that came from Pro or
  // from owning the kit. Keyed on usesBuilder, not on how it was paid for.
  if (usesBuilder && hasAccess) {
    return (
      <div className="min-h-screen bg-stone-50">
        <PortfolioVisualBuilder
          onCancel={() => navigate("/templates")}
        />
      </div>
    );
  }

  // Success screen
  if (portfolioSlug) {
    // The shareable URL — stays clean, and stays edge-cached for real visitors.
    const portfolioUrl = `${import.meta.env.VITE_APP_URL ?? ''}/p/${portfolioSlug}`;
    const displayUrl = `porfilr.com/p/${portfolioSlug}`;
    // The owner's own "view it" link. Published pages are edge-cached for 5 minutes, so
    // without a unique query the author clicks straight into a stale copy of their page
    // and concludes the save didn't work. Never use this for copy/share.
    const viewUrl = `${portfolioUrl}?v=${Date.now()}`;
    const handleCopy = () => {
      navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="min-h-screen bg-stone-50">
        {/* Top bar */}
        <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <Link to="/"><Logo size={28} /></Link>
        </div>

        <div className="max-w-md mx-auto px-6 py-12">
          <StepIndicator current={2} />

          {/* Check + heading */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your portfolio is live.
            </h2>
            <p className="text-stone-500 text-sm">
              Share it anywhere — your bio, email signature, or next pitch.
            </p>
          </div>

          {/* Copyable link */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 mb-6">
            <p className="flex-1 text-sm text-stone-700 font-medium truncate">{displayUrl}</p>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                copied ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 hover:bg-stone-200 text-stone-600"
              }`}
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>

          {/* Share */}
          <div className="mb-6">
            <SharePortfolio url={portfolioUrl} />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-stone-900 hover:bg-stone-700 text-white py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View my portfolio
            </a>

            <Link to={`/edit/${portfolioSlug}`} className="w-full">
              <button className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 py-3.5 rounded-xl font-semibold text-sm transition">
                Edit details
              </button>
            </Link>

            <Link to="/dashboard" className="w-full">
              <button className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 py-3.5 rounded-xl font-semibold text-sm transition">
                Go to dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-stone-50">

      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="text-stone-900 font-bold text-xl tracking-tight">
          <Logo size={28} />
        </Link>
        <Link to="/templates" className="text-stone-400 hover:text-stone-700 text-sm transition flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Step indicator */}
        <StepIndicator current={1} />

        {/* Header + progress */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Fill in your details.
          </h1>
          <p className="text-stone-500 text-sm mb-5">
            Template: <span className="font-medium text-stone-700">{template.name}</span> · All fields can be edited later.
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-stone-400 font-medium w-10 text-right">{progress}%</span>
          </div>
        </div>

        {/* Form sections */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {Object.entries(groupedFields || {}).map(([section, fields]) => {
            const meta = SECTION_META[section] || { label: section, icon: "📋" };
            return (
              <div key={section} className="bg-white border border-stone-200 rounded-2xl p-6">
                <h2 className="font-bold text-stone-900 text-sm mb-5 flex items-center gap-2">
                  <span>{meta.icon}</span>
                  {meta.label}
                  {section === "testimonials" && (
                    <span className="text-stone-400 font-normal text-xs ml-1">(optional)</span>
                  )}
                </h2>
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                        {field.label}
                        {field.required && <span className="text-orange-500 ml-1">*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          rows={4}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition resize-none"
                        />
                      ) : field.type === "file" ? (
                        <div className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center hover:border-orange-300 transition cursor-pointer">
                          <input
                            type="file"
                            name={field.name}
                            onChange={handleChange}
                            required={field.required}
                            accept="image/*"
                            className="hidden"
                            id={`file-${field.name}`}
                          />
                          <label htmlFor={`file-${field.name}`} className="cursor-pointer">
                            {formData[field.name] ? (
                              <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Photo uploaded
                              </div>
                            ) : (
                              <div>
                                <svg className="w-6 h-6 text-stone-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-stone-400 text-xs">Click to upload a photo</p>
                              </div>
                            )}
                          </label>
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition"
                        />
                      )}
                      {(field.type === "email" || field.name === "email") && suggestEmailFix(String(formData[field.name] || "")) && (
                        <p className="text-xs text-orange-600 mt-1.5">
                          Did you mean{" "}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, [field.name]: suggestEmailFix(String(formData[field.name] || "")) }))}
                            className="underline font-semibold"
                          >
                            {suggestEmailFix(String(formData[field.name] || ""))}
                          </button>
                          ?
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-600 text-sm">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-sm transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Building your portfolio...
              </span>
            ) : user ? (
              "Build my portfolio →"
            ) : (
              "Sign up & publish — it's free →"
            )}
          </button>

          <p className="text-center text-stone-400 text-xs">
            {user
              ? "Your portfolio is live instantly. You can edit any detail after."
              : "Fill it in now — you'll only sign up when you're ready to publish. Your work is saved."}
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreatePortfolio;
