/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import PortfolioVisualBuilder from "../components/PortfolioVisualBuilder.tsx";
import SharePortfolio from "../components/SharePortfolio";
import { track } from "../lib/track";
import { startKitCheckout } from "../lib/kitCheckout";
import { suggestEmailFix } from "../lib/emailTypo";
import { useIsMobileOnce } from "../lib/useIsMobile";
import { requestDesktopLink } from "../lib/desktopLink";
import { FREE_TRADE_CAP } from "../lib/plan";
import PreviewSheet from "../components/PreviewSheet";
import { getTemplateConfig } from "../components/builder/builder.config";
import ColorPresets from "../components/ColorPresets";
import { SECTION_META, groupFields, startsOpen, filledCount, sectionOf } from "../lib/formSections";

interface TemplateField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  section?: string;
  /** For type: "select" — the choices, in order. */
  options?: { value: string; label: string }[];
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

// Section labels moved to src/lib/formSections.ts, shared with the edit form. They had
// drifted already — this copy had a "services" group the edit form didn't, so the same
// template laid out differently depending on which screen you were on.

const CreatePortfolio = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const draftKey = `porfilr_draft_${templateId}`;
  const [template, setTemplate] = useState<Template | null>(null);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  // Which page sections are switched on. Seeded from the template's own defaults so the
  // form starts where the builder would.
  const [pageSections, setPageSections] = useState<{ id: string; name: string; visible: boolean; order: number }[]>([]);
  useEffect(() => {
    if (!templateId) return;
    const cfg = getTemplateConfig(templateId);
    setPageSections((cfg.sections || []).map((s) => ({ id: s.id, name: s.name, visible: s.visible, order: s.order })));
  }, [templateId]);

  /**
   * Sections in the shape the publish route stores and the templates read.
   * `{ id, enabled, order }` matches what the builder saves, so a page built on a phone
   * and later opened in the builder describes its layout the same way.
   */
  const sectionsForSave = () =>
    pageSections.map((s) => ({ id: s.id, enabled: s.visible, order: s.order }));

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [deskOpen, setDeskOpen] = useState(false);
  const [deskEmail, setDeskEmail] = useState('');
  const [deskStatus, setDeskStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
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
  const { user, isPro, ownsTemplate, checkSubscription, portfolios, portfoliosLoading } = useAuth();
  // Sticky: a rotation must not swap the editor out from under a half-filled form.
  const isMobile = useIsMobileOnce();

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
        // Kept so we can tell which of the user's OTHER portfolios are kit pages —
        // needed to work out whether their general slot is already taken.
        setAllTemplates(data.templates);
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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      // Remember they were mid-purchase, so we can send them straight to checkout after
      // login instead of dumping them back on the page to find the button again.
      sessionStorage.setItem('porfilr_pending_kit', String(templateId));
      localStorage.setItem('porfilr_after_login', `/create/${templateId}`);
      navigate('/login', { state: { from: { pathname: `/create/${templateId}` } } });
      return;
    }
    setKitLoading(true);
    setKitError(null);
    try {
      // Shared with the journal's free-limit dialog — see src/lib/kitCheckout.ts.
      const r = await startKitCheckout(String(template?.id), user);

      if (r.kind === 'granted' || r.kind === 'alreadyOwned') {
        await checkSubscription(); // refresh ownedTemplates so the gate opens
        track(r.kind === 'granted' ? 'kit_granted' : 'kit_already_owned', {
          templateId: template?.id,
          reason: r.kind === 'granted' ? r.reason : null,
        });
        setKitLoading(false);
        return;
      }

      window.location.href = r.url;
    } catch (err: any) {
      setKitError(err.message || 'Could not start checkout. Please try again.');
      setKitLoading(false);
    }
  };

  // Resume an interrupted purchase: if they clicked "Get the Trader Kit" while logged out,
  // we sent them to sign in — bring them straight to checkout now instead of making them
  // hunt for the button again. Cleared immediately so a stale flag can't re-fire later.
  useEffect(() => {
    if (!user || !template) return;
    const pending = sessionStorage.getItem('porfilr_pending_kit');
    if (pending && pending === templateId && template.kit && !ownsTemplate(template.id)) {
      sessionStorage.removeItem('porfilr_pending_kit');
      track('kit_checkout_resumed', { templateId });
      buyKit();
    } else if (pending) {
      sessionStorage.removeItem('porfilr_pending_kit');
    }
  }, [user, template, templateId]);

  /**
   * Render what they have so far, without publishing.
   *
   * Same endpoint the desktop builder's canvas uses, so the preview is the real page and
   * not an approximation that drifts from it.
   */
  const openPreview = async () => {
    if (!templateId) return;
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    track('mobile_preview_opened', { templateId });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, ...formData, sections: sectionsForSave() }),
      });
      if (!res.ok) throw new Error('Preview failed');
      const data = await res.json();
      if (!data.html) throw new Error('No preview returned');
      setPreviewHtml(data.html);
    } catch (err: any) {
      setPreviewError(err?.message || 'Something went wrong building the preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId) return;
    // The signup wall lives HERE now — at Publish, after they've done the work. Their
    // filled-in form is saved as a draft and restored when they come back signed in.
    // Required-field check in JS, because collapsed sections aren't mounted and so the
    // browser's own `required` validation can't see them. Without this a page could be
    // published with no name, and the server falls back to the slug "writer".
    //
    // BEFORE the signup prompt, not after: sending someone off to create an account and
    // only then telling them the form is incomplete wastes the one moment they were
    // ready to finish.
    const missing = (template?.fields || [])
      .filter((f) => f.required && !String(formData[f.name] || '').trim());
    if (missing.length) {
      const first = missing[0];
      setOpenSections((p) => ({ ...p, [sectionOf(first)]: true }));
      setError(`Please fill in: ${missing.map((f) => f.label).join(', ')}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!user) { track('publish_signup_prompt', { templateId }); promptSignup(); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("Please log in to continue"); setLoading(false); return; }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/create-portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ templateId, formData, sections: sectionsForSave() }),
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

  // Shared with the edit form (src/lib/formSections.ts) and honours each field's declared
  // `section`, so a template lays out its own form rather than being sorted by a guess.
  const groupedFields = groupFields(template?.fields || []);

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
  // Kit templates are free to use. Buying removes the trade cap and the Porfilr badge —
  // it is no longer a gate on getting in. Gating publication behind payment meant nobody
  // saw the product before being asked to pay for it.
  const hasAccess = kitId
    ? true
    : isProTemplate
      ? isPro
      : true;
  const ownsKit = !!kitId && !!template && ownsTemplate(template.id);

  // Do they already have a portfolio on THIS template? If so, /create is the wrong place
  // to land them — see the interstitial below.
  // `!portfolioSlug` matters: the success/share screen renders further down this component.
  // Once they publish, this portfolio IS in the list — without the guard, a refresh of the
  // portfolio list would swap their "you're live!" screen for "you've already built this".
  const alreadyBuilt =
    user && !portfolioSlug ? portfolios.find((p) => p.template_id === templateId) || null : null;

  // Would publishing this be refused for lack of a slot? Mirrors the server rule in
  // api/templates/create-portfolio.js: one general slot, plus one per kit owned. Warn now
  // rather than letting them fill in the whole form and hit a 403 at Publish.
  // Only computed once the template list has loaded — without kit flags for the OTHER
  // templates we'd mistake a kit page for a general one and warn wrongly.
  const generalSlotTaken =
    user && allTemplates.length > 0
      ? portfolios.find((p) => !(allTemplates.find((t) => t.id === p.template_id)?.kit)) || null
      : null;
  const slotBlocked = !kitId && !!generalSlotTaken;

  // Can a phone user actually fill this in? Only if the template declares form fields.
  const hasMobileForm = (template?.fields?.length || 0) > 0;

  // Wait for the portfolio list before deciding. Rendering the form first and swapping to
  // the interstitial a moment later would look like the app losing their work all over
  // again — which is the exact impression this fix exists to prevent.
  if (user && portfoliosLoading && template && !portfolioSlug) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin"></div>
          <p className="text-stone-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

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

  // ── Already built this one ──
  // A trader who came back, landed on /templates and clicked the template they recognised
  // used to get a BLANK form here — no trades, no details, nothing they'd entered. One
  // reported it as "my logged trades disappeared"; the data was fine, they were just
  // looking at an empty page. So say plainly that it exists, and link to it.
  if (alreadyBuilt) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            You've already built this one
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Your {template.name} page is live and everything you've entered is safe
            {kitId ? ', including every trade in your journal' : ''}. Pick up where you left off:
          </p>

          <div className="space-y-2.5">
            <Link
              to={usesBuilder ? `/builder/${alreadyBuilt.slug}` : `/edit/${alreadyBuilt.slug}`}
              className="block w-full text-center bg-stone-900 hover:bg-stone-700 text-white font-semibold py-3 px-6 rounded-xl transition"
            >
              Edit my page
            </Link>

            {/* The journal is the thing they were actually looking for. */}
            {kitId && (
              <Link
                to={`/journal/${alreadyBuilt.slug}`}
                className="block w-full text-center bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-semibold py-3 px-6 rounded-xl transition"
              >
                Open my trade journal
              </Link>
            )}

            <a
              href={`/p/${alreadyBuilt.slug}`}
              target="_blank"
              rel="noopener"
              className="block w-full text-center border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium py-3 px-6 rounded-xl transition"
            >
              View my live page
            </a>
          </div>

          <p className="mt-6 text-xs text-stone-400 text-center">
            Want to start this one over? Delete it from your{' '}
            <Link to="/dashboard" className="text-orange-600 hover:underline">dashboard</Link> first.
          </p>
        </div>
      </div>
    );
  }

  // Kit gate — deliberately NOT the Pro gate. A kit is its own product: buying it
  // requires no Pro purchase (no double paywall), and owning Pro doesn't grant it.
  // Kept but unreachable while kits are free to start (hasAccess is true for them). Left
  // in place so re-gating a future kit is a one-line change rather than a rebuild.
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
              : kitCredit > 0 ? 'Unlock with my referral credit' : 'Unlock Porfilr Journal'}
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
  //
  // NOT on a phone. The builder blocks below 900px and used to show a dead end there, so
  // someone who had just paid for a kit on their phone could not build anything at all.
  // Of the seven people who hit that wall, three never published a page and one gave up
  // and made a free minimal-template page instead — downgrading out of the paid product
  // because the free one worked on their phone. Mobile now gets the form flow below,
  // which publishes a real page; the builder is a desktop refinement, not a gate.
  //
  // One exception: a template with no `fields` (modern-writer) has no form to fall back
  // to, so mobile still gets the builder's email-a-link screen. Rendering an empty form
  // would be worse than the wall — it looks like the product is broken.
  if (usesBuilder && hasAccess && (!isMobile || !hasMobileForm)) {
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

        {/* Their one portfolio slot is already used by a different template. Say so HERE,
            not at Publish — filling in a whole form only to be refused is the version of
            this that makes people think the product ate their work. */}
        {slotBlocked && generalSlotTaken && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-bold text-stone-900 text-sm mb-1">You already have a portfolio</p>
            <p className="text-stone-600 text-sm mb-4">
              Each account gets one (kit pages are extra). You can fill this in, but publishing
              it will need your existing page deleted first — nothing you've already made is
              lost either way.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/edit/${generalSlotTaken.slug}`}
                className="bg-stone-900 hover:bg-stone-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                Edit the one I have
              </Link>
              <Link
                to="/dashboard"
                className="border border-stone-300 hover:bg-white text-stone-700 px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Free users can publish — say what the free page includes before they do, so the
            Porfilr badge isn't a surprise they discover on their own live page. */}
        {kitId && !ownsKit && (
          <div className="mb-8 bg-stone-50 border border-stone-200 rounded-2xl p-5">
            <p className="font-bold text-stone-900 text-sm mb-1">You're on the free plan</p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Publish as many times as you like — your page will carry a small "Made with
              Porfilr" badge, and your journal keeps your most recent {FREE_TRADE_CAP} trades.
              A one-time unlock removes both.
            </p>
          </div>
        )}

        {/* Mobile users of a builder template land here instead of the old dead end. Say
            why, or a paying customer assumes the visual builder they were sold doesn't
            exist and that they got a cut-down product. */}
        {isMobile && usesBuilder && hasAccess && (
          <div className="mb-8 bg-stone-50 border border-stone-200 rounded-2xl p-5">
            <p className="font-bold text-stone-900 text-sm mb-1">Building on your phone</p>
            <p className="text-stone-600 text-sm leading-relaxed">
              Fill this in and publish — you'll have a real, live page in a few minutes.
              The drag-and-drop designer needs a bigger screen, so open your page on a
              laptop whenever you want to change colours, fonts and layout. Nothing you
              enter here is lost.
            </p>

            {/* Offered, not imposed. Deliberately BELOW the "you can do this here" message
                and never as a gate: when this choice was a wall, three of the first seven
                people who took it never published at all — the email lands when they're
                not at a laptop and the moment goes. */}
            {deskStatus === 'done' ? (
              <p className="text-emerald-700 text-sm mt-3 font-medium">
                Sent. Open it on a laptop whenever you're ready — this page stays as it is.
              </p>
            ) : deskOpen ? (
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={deskEmail}
                  onChange={(e) => { setDeskEmail(e.target.value); if (deskStatus === 'error') setDeskStatus('idle'); }}
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <button
                  type="button"
                  disabled={deskStatus === 'saving'}
                  onClick={async () => {
                    setDeskStatus('saving');
                    try {
                      await requestDesktopLink(deskEmail, String(templateId));
                      setDeskStatus('done');
                    } catch { setDeskStatus('error'); }
                  }}
                  className="bg-stone-900 hover:bg-stone-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {deskStatus === 'saving' ? 'Sending…' : 'Send link'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeskOpen(true)}
                className="mt-2 text-orange-600 hover:text-orange-500 text-sm font-medium underline underline-offset-2"
              >
                Prefer the full designer? Email me a link for later
              </button>
            )}
            {deskStatus === 'error' && (
              <p className="text-red-500 text-xs mt-2">Enter a valid email and try again.</p>
            )}
          </div>
        )}

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
          {groupedFields.map(([section, fields]) => {
            const meta = SECTION_META[section] || { label: section, icon: "📋" };
            const open = openSections[section] ?? startsOpen(section, fields.length);
            const filled = filledCount(fields, formData);
            return (
              <div key={section} className="bg-white border border-stone-200 rounded-2xl p-6">
                {/* Folded by default for optional sections — the form now covers every
                    field the builder does, which is ~95 inputs on the bigger templates. */}
                <button
                  type="button"
                  onClick={() => setOpenSections((p) => ({ ...p, [section]: !open }))}
                  // -my-2 py-2 keeps the visual spacing identical while giving the row a
                  // 36px+ hit area. As a bare heading it was 20px tall — under the ~44px
                  // a thumb reliably hits, so opening a section on a phone was fiddly.
                  className={`w-full flex items-center gap-2 text-left font-bold text-stone-900 text-sm -my-3 py-3 ${open ? "mb-2" : ""}`}
                >
                  <span>{meta.icon}</span>
                  {meta.label}
                  {meta.optional && (
                    <span className="text-stone-400 font-normal text-xs ml-1">(optional)</span>
                  )}
                  <span className="ml-auto flex items-center gap-2 text-stone-400 font-normal text-xs">
                    {filled > 0 && <span>{filled}/{fields.length}</span>}
                    <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div className="space-y-4">
                  {open && fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                        {field.label}
                        {field.required && <span className="text-orange-500 ml-1">*</span>}
                      </label>
                      {field.type === "select" ? (
                        // Anything not handled explicitly falls through to <input
                        // type={field.type}>, which for "select" is invalid HTML and
                        // silently renders a text box. A yes/no field has to be a picker.
                        <select
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          required={field.required}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                        >
                          {(field.options || []).map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
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

          {/* Colour presets.
              The raw <input type="color"> is still below in "Look & layout", but on a
              phone it opens the OS colour wheel and asks a trader to pick a hex value —
              the builder hands desktop users thirteen curated pairs instead. Same list,
              same source (builder.config.ts), so they can't drift apart. */}
          <ColorPresets
            fields={template?.fields || []}
            formData={formData}
            onApply={(patch) => setFormData((prev: any) => ({ ...prev, ...patch }))}
          />

          {/* Section show/hide.
              Reordering stays desktop-only — dragging to reorder on a phone is genuinely
              unpleasant — but choosing what appears at all shouldn't require a laptop. */}
          {pageSections.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h2 className="font-bold text-stone-900 text-sm mb-1">🧱 Sections on your page</h2>
              <p className="text-stone-400 text-xs mb-4">
                Turn off anything you don't need. You can change this any time.
              </p>
              <div className="space-y-1">
                {pageSections.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-2.5 cursor-pointer border-b border-stone-50 last:border-0"
                  >
                    <span className={`text-sm ${s.visible ? 'text-stone-800 font-medium' : 'text-stone-400'}`}>
                      {s.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={s.visible}
                      onChange={(e) =>
                        setPageSections((prev) =>
                          prev.map((x) => (x.id === s.id ? { ...x, visible: e.target.checked } : x))
                        )
                      }
                      className="w-5 h-5 rounded accent-stone-900 flex-none"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Preview, directly above Publish — look, then publish. */}
          <button
            type="button"
            onClick={openPreview}
            className="w-full border border-stone-300 hover:bg-stone-50 text-stone-700 py-3.5 rounded-xl font-semibold text-sm transition"
          >
            Preview my page
          </button>

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

      {/* The floating preview bar was removed. It sat over the page on every template's
          create form, duplicating the inline button just above Publish — two identical
          controls, one of them permanently covering the bottom of the screen. The inline
          one is the keeper: it's in the flow, next to the button it precedes. */}

      <PreviewSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        html={previewHtml}
        loading={previewLoading}
        error={previewError}
        onRetry={openPreview}
      />
    </div>
  );
};

export default CreatePortfolio;
