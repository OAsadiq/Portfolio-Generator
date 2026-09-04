/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useIsMobileOnce } from '../lib/useIsMobile';
import ColorPresets from '../components/ColorPresets';
import PreviewSheet from '../components/PreviewSheet';
import { SECTION_META, groupFields, startsOpen, filledCount, sectionOf } from '../lib/formSections';

interface TemplateField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  /** For type: "select" — the choices, in order. */
  options?: { value: string; label: string }[];
}

// Templates edited in the visual builder rather than this form. Anything listed here
// gets redirected to /builder/:slug below.
const PROFESSIONAL_TEMPLATES = ['professional-writer-template', 'modern-writer-template', 'trader-template'];

// Section labels and grouping now live in src/lib/formSections.ts, shared with the create
// form so the two can't drift.

const EditPortfolio = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobileOnce();

  const [portfolio, setPortfolio]           = useState<any>(null);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [templateName, setTemplateName]     = useState<string>('');
  const [openSections, setOpenSections]     = useState<Record<string, boolean>>({});
  const [sheetOpen, setSheetOpen]           = useState(false);
  const [sheetHtml, setSheetHtml]           = useState<string | null>(null);
  const [sheetLoading, setSheetLoading]     = useState(false);
  const [sheetError, setSheetError]         = useState<string | null>(null);

  /**
   * Preview on a phone.
   *
   * Separate from handlePreview() below, which opens a new tab — that one is desktop-only
   * because mobile browsers block window.open after an await and iOS refuses blob: URLs
   * in a new tab. This renders into a sheet instead, so the edit form has the preview the
   * create form got.
   */
  const openSheet = async () => {
    if (!portfolio) return;
    setSheetOpen(true);
    setSheetLoading(true);
    setSheetError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: portfolio.template_id, ...formData, sections: portfolio.sections || [] }),
      });
      if (!res.ok) throw new Error('Preview failed');
      const data = await res.json();
      if (!data.html) throw new Error('No preview returned');
      setSheetHtml(data.html);
    } catch (err: any) {
      setSheetError(err?.message || 'Something went wrong building the preview.');
    } finally {
      setSheetLoading(false);
    }
  };
  const [formData, setFormData]             = useState<any>({});
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [previewing, setPreviewing]         = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [toast, setToast]                   = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext  = file.name.split('.').pop();
    const path = `profile-pictures/${user?.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('images').upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
  };

  useEffect(() => { checkTemplateType(); }, [slug]);
  useEffect(() => { fetchPortfolio(); }, [slug, user]);
  useEffect(() => { if (portfolio && templateFields.length > 0) initFormData(); }, [portfolio, templateFields]);

  const checkTemplateType = async () => {
    const { data } = await supabase
      .from('portfolios')
      .select('template_id, template_fields')
      .eq('slug', slug)
      .single();
    if (!data || !PROFESSIONAL_TEMPLATES.includes(data.template_id)) return;

    // On a phone, stay on this form. The builder blocks below 900px, so redirecting there
    // is a dead end.
    //
    // This used to be conditional on the row's stored `template_fields`, which created an
    // infinite loop: a journal-first page is created client-side by /journal and stores
    // NULL there, so /edit bounced to /builder, the builder's small-screen screen offered
    // "Edit on my phone" back to /edit, and round it went. To the user that looks like
    // tapping Edit does nothing at all.
    //
    // The condition isn't needed any more either: fetchPortfolio prefers the LIVE template
    // fields over the stored snapshot, and every template now declares fields (the
    // builder-only modern-writer case that motivated the check no longer exists).
    if (isMobile) return;

    navigate(`/builder/${slug}`, { replace: true });
  };

  const fetchPortfolio = async () => {
    if (!user || !slug) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('slug', slug)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      setPortfolio(data);

      // Prefer the LIVE template's fields over the snapshot stored on the row.
      //
      // portfolios.template_fields is frozen at publish time, so a page published before a
      // field existed can never be given a value for it — one live portfolio had 27 stored
      // fields against the template's current 62, meaning 35 of its sections were simply
      // unreachable from this form. The stored copy stays as the fallback for a template
      // that has since been removed.
      let live: TemplateField[] | null = null;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`);
        if (res.ok) {
          const json = await res.json();
          const t = (json?.templates || []).find((x: { id: string }) => x.id === data.template_id);
          if (Array.isArray(t?.fields) && t.fields.length) live = t.fields;
          // The template's real name ("Professional Portfolio"), not a label derived from
          // the slug — that produced "Professional Writer", a name we don't use anywhere
          // else and that doesn't match what they picked on the templates page.
          if (t?.name) setTemplateName(t.name);
        }
      } catch { /* fall back to the stored snapshot below */ }

      if (live) {
        setTemplateFields(live);
      } else if (Array.isArray(data.template_fields)) {
        setTemplateFields(data.template_fields);
      } else {
        setTemplateFields(
          Object.keys(data.form_data || {}).map(key => ({
            name: key,
            label: key.replace(/([A-Z])/g, ' $1').trim(),
            type: typeof data.form_data[key] === 'string' && data.form_data[key].length > 100 ? 'textarea' : 'text',
            required: false,
            placeholder: `Enter ${key.replace(/([A-Z])/g, ' $1').trim()}`,
          }))
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initFormData = () => {
    const existing = portfolio.form_data || {};
    // Start from EVERYTHING that was saved, then make sure each declared field has a key.
    //
    // update-portfolio does `form_data: formData` — a full overwrite, not a merge. Seeding
    // only from templateFields meant any stored value this form doesn't render was dropped
    // on save. That was survivable while the form was the only editor for its templates,
    // but it stops being survivable the moment a phone can edit a page built in the visual
    // builder: the builder writes far more keys than any field list declares, and one
    // mobile save would silently delete the lot.
    //
    // Merging on the SERVER would be wrong — the builder legitimately removes keys when
    // you delete a case study, and a server-side merge would resurrect them. The form is
    // the side with the partial view, so the form is the side that has to carry the rest.
    const init: any = { ...existing };
    templateFields.forEach(f => { init[f.name] = existing[f.name] ?? ''; });
    setFormData(init);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files?.[0]) {
      const url = await uploadImage(files[0]);
      setFormData((p: any) => ({ ...p, [name]: url }));
    } else {
      setFormData((p: any) => ({ ...p, [name]: value }));
    }
  };

  const handlePreview = async () => {
    if (!portfolio) return;
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: portfolio.template_id, ...formData }),
      });
      if (!res.ok) throw new Error('Failed to generate preview');
      const data = await res.json();
      if (data.html) {
        const url = URL.createObjectURL(new Blob([data.html], { type: 'text/html' }));
        const w = window.open(url, '_blank');
        if (w) {
          w.addEventListener('load', () => URL.revokeObjectURL(url));
        } else {
          // A blocked popup used to be swallowed here: the spinner stopped and nothing
          // happened, which reads as "the button is broken". window.open runs after an
          // await, so it has lost the user-gesture context and blockers are entitled to
          // refuse it — say so rather than leaving them clicking.
          URL.revokeObjectURL(url);
          setError('Your browser blocked the preview window. Allow pop-ups for this site, or use "View live" after saving.');
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      setError('Preview failed. Please try again.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;

    const missing = templateFields.filter(f => f.required && !String(formData[f.name] || '').trim());
    if (missing.length) {
      // Open the section holding the first offender — otherwise the error names a field
      // the user can't see, because its section is folded.
      setOpenSections(p => ({ ...p, [sectionOf(missing[0])]: true }));
      setError(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in to continue'); return; }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/update-portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ slug: portfolio.slug, templateId: portfolio.template_id, formData }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed'); }
      showToast('Changes saved.');
      await fetchPortfolio();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── States ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error && !portfolio) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-bold text-stone-900 text-lg mb-2">Portfolio not found</h2>
          <p className="text-stone-500 text-sm mb-5">{error}</p>
          <Link to="/dashboard">
            <button className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition">
              Back to dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!portfolio || templateFields.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-sm w-full text-center">
          <p className="text-stone-500 text-sm mb-5">No template data found for this portfolio.</p>
          <Link to="/dashboard">
            <button className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-700 transition">
              Back to dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Grouping lives in src/lib/formSections.ts and honours each field's declared
  // `section`, so a template controls its own form layout instead of being sorted by a
  // heuristic written for a different template.
  const groupedFields = groupFields(templateFields);

  const portfolioUrl = `${import.meta.env.VITE_API_URL}/api/templates/preview?slug=${portfolio.slug}`;

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Sticky top bar */}
      {/* Every child used to be flex-shrink-0 inside a justify-between row, so on a phone
          the Back link and the action buttons had nowhere to go and ran into each other.
          Fixed by removing content rather than squeezing it: tighter padding, the word
          "Back" drops to just its arrow, and only the buttons that work on mobile show. */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link to="/" className="flex-shrink-0"><Logo size={28} /></Link>
          <span className="text-stone-300 hidden sm:block">|</span>
          <Link to="/templates" className="text-stone-400 hover:text-stone-700 text-sm transition flex items-center gap-1.5 flex-shrink-0" aria-label="Back to templates">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Now shown on mobile too — it's a plain link, so unlike Preview it actually
              works there, and "see my page" is the thing people reach for. */}
          <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
            <button className="flex items-center gap-2 border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">View live</span>
            </button>
          </a>
          {/* Desktop only, and not just for space: Preview opens a blob: URL via
              window.open AFTER an await, so the user-gesture context is gone and mobile
              browsers block it — iOS Safari refuses blob: in a new tab outright. On a
              phone this button did nothing at all, with no error. Better absent than
              broken; "View live" covers the same need there. */}
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewing}
            className="hidden sm:flex items-center gap-2 border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            {previewing ? (
              <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
            Preview
          </button>
          <button
            form="edit-form"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 disabled:opacity-50 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold transition flex-shrink-0"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {saving ? 'Saving…' : (<><span className="sm:hidden">Save</span><span className="hidden sm:inline">Save changes</span></>)}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-up">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Edit your portfolio.
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-stone-500 text-sm">
              Template: <span className="font-medium text-stone-700">{templateName || portfolio.template_id.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()).replace(' Template', '')}</span>
            </p>
            <span className="text-stone-300">·</span>
            <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500 text-sm font-medium transition flex items-center gap-1">
              porfilr.com/p/{portfolio.slug}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Form */}
        <form id="edit-form" onSubmit={handleSave} className="space-y-5">

          {groupedFields.map(([section, fields]) => {
            const meta = SECTION_META[section] || { label: section, icon: '📋' };
            const open = openSections[section] ?? startsOpen(section, fields.length);
            const filled = filledCount(fields, formData);
            return (
              <div key={section} className="bg-white border border-stone-200 rounded-2xl p-6">
                {/* Collapsible: with the form now matching the builder field for field,
                    the bigger templates run to ~95 inputs. Folded sections with a filled
                    count keep that navigable on a phone without hiding anything. */}
                <button
                  type="button"
                  onClick={() => setOpenSections(p => ({ ...p, [section]: !open }))}
                  // See CreatePortfolio: bare headings gave a 20px tap target.
                  className={`w-full flex items-center gap-2 text-left font-bold text-stone-900 text-sm -my-3 py-3 ${open ? 'mb-2' : ''}`}
                >
                  <span>{meta.icon}</span>
                  {meta.label}
                  {meta.optional && <span className="text-stone-400 font-normal text-xs ml-1">(optional)</span>}
                  <span className="ml-auto flex items-center gap-2 text-stone-400 font-normal text-xs">
                    {filled > 0 && <span>{filled}/{fields.length}</span>}
                    <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {/* Unmounted, not just hidden. A `required` input inside a display:none
                    block makes Chrome refuse to submit with "not focusable" — an error
                    the user never sees. Values live in React state, so nothing is lost
                    by unmounting, and handleSave validates required fields itself. */}
                <div className="space-y-4">
                  {open && fields.map(field => (
                    <div key={field.name}>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                        {field.label}
                        {field.required && <span className="text-orange-500 ml-1">*</span>}
                      </label>

                      {field.type === 'select' ? (
                        // Without this, "select" falls through to <input type="select">,
                        // which is invalid HTML and renders a plain text box.
                        <select
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required={field.required}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                        >
                          {(field.options || []).map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          rows={4}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition resize-none"
                        />
                      ) : field.type === 'file' ? (
                        <div className="space-y-2">
                          {formData[field.name] && (
                            <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Photo uploaded
                            </div>
                          )}
                          <div className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center hover:border-orange-300 transition cursor-pointer">
                            <input
                              type="file"
                              name={field.name}
                              onChange={handleChange}
                              accept="image/*"
                              className="hidden"
                              id={`file-${field.name}`}
                            />
                            <label htmlFor={`file-${field.name}`} className="cursor-pointer">
                              <svg className="w-5 h-5 text-stone-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-stone-400 text-xs">{formData[field.name] ? 'Replace photo' : 'Upload a photo'}</p>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 placeholder:text-stone-300 transition"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {!open && filled === 0 && (
                  <p className="text-stone-400 text-xs">Nothing added yet — tap to open.</p>
                )}
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

          {/* Colour sits down here, after the content — same position as the create form.
              At the top of the page it was the first thing a returning user saw, above
              their own details, which no other template's edit page does. */}
          <ColorPresets
            fields={templateFields}
            formData={formData}
            onApply={(patch) => setFormData((prev: any) => ({ ...prev, ...patch }))}
          />

          {/* Preview, inline and directly above Save — not a floating bar. It belongs in
              the same flow as the button it precedes: look, then save. */}
          {isMobile && (
            <button
              type="button"
              onClick={openSheet}
              className="w-full bg-white border border-stone-300 text-stone-800 py-3.5 rounded-xl font-semibold text-sm transition active:scale-[0.99]"
            >
              Preview my page
            </button>
          )}

          {/* Only one Save. The sticky header already has one and it's visible the whole
              way down the form — a second at the bottom just made people wonder whether
              the two did different things. */}

          <p className="text-center text-stone-400 text-xs pb-4">
            Changes go live on your portfolio immediately after saving.
          </p>
        </form>
      </div>

      <PreviewSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        html={sheetHtml}
        loading={sheetLoading}
        error={sheetError}
        onRetry={openSheet}
      />

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default EditPortfolio;
