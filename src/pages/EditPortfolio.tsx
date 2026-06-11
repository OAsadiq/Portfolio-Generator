/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface TemplateField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}

const PROFESSIONAL_TEMPLATES = ['professional-writer-template'];

const SECTION_META: Record<string, { label: string; icon: string; optional?: boolean }> = {
  personal:     { label: 'About you',           icon: '👤' },
  samples:      { label: 'Your work',            icon: '📎' },
  testimonials: { label: 'Client testimonials',  icon: '💬', optional: true },
  contact:      { label: 'Contact details',      icon: '📧' },
  other:        { label: 'Additional info',      icon: '📋' },
};

const getSection = (name: string) => {
  if (['fullName', 'writerType', 'bio', 'profilePicture'].some(k => name.includes(k))) return 'personal';
  if (name.includes('sample'))      return 'samples';
  if (name.includes('testimonial')) return 'testimonials';
  if (['email', 'linkedin', 'twitter'].some(k => name.includes(k))) return 'contact';
  return 'other';
};

const EditPortfolio = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [portfolio, setPortfolio]           = useState<any>(null);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
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
      .select('template_id')
      .eq('slug', slug)
      .single();
    if (data && PROFESSIONAL_TEMPLATES.includes(data.template_id)) {
      navigate(`/builder/${slug}`, { replace: true });
    }
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
      if (Array.isArray(data.template_fields)) {
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
    const init: any = {};
    templateFields.forEach(f => { init[f.name] = existing[f.name] || ''; });
    setFormData(init);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        if (w) w.addEventListener('load', () => URL.revokeObjectURL(url));
        else URL.revokeObjectURL(url);
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

    const missing = templateFields.filter(f => f.required && !formData[f.name]).map(f => f.label);
    if (missing.length) { setError(`Please fill in: ${missing.join(', ')}`); return; }

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

  const groupedFields = templateFields.reduce((acc, field) => {
    const s = getSection(field.name);
    if (!acc[s]) acc[s] = [];
    acc[s].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  const portfolioUrl = `${import.meta.env.VITE_API_URL}/api/templates/preview?slug=${portfolio.slug}`;

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link to="/" className="text-stone-900 font-bold text-xl tracking-tight flex-shrink-0">
            Porfil<span className="text-orange-600">r</span>
          </Link>
          <span className="text-stone-300 hidden sm:block">|</span>
          <Link to="/templates" className="text-stone-400 hover:text-stone-700 text-sm transition flex items-center gap-1.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
            <button className="hidden sm:flex items-center gap-2 border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 px-4 py-2 rounded-xl text-sm font-medium transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View live
            </button>
          </a>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewing}
            className="flex items-center gap-2 border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
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
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Save changes'}
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
              Template: <span className="font-medium text-stone-700">{portfolio.template_id.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()).replace(' Template', '')}</span>
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

          {Object.entries(groupedFields).map(([section, fields]) => {
            const meta = SECTION_META[section] || { label: section, icon: '📋' };
            return (
              <div key={section} className="bg-white border border-stone-200 rounded-2xl p-6">
                <h2 className="font-bold text-stone-900 text-sm mb-5 flex items-center gap-2">
                  <span>{meta.icon}</span>
                  {meta.label}
                  {meta.optional && <span className="text-stone-400 font-normal text-xs ml-1">(optional)</span>}
                </h2>
                <div className="space-y-4">
                  {fields.map(field => (
                    <div key={field.name}>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                        {field.label}
                        {field.required && <span className="text-orange-500 ml-1">*</span>}
                      </label>

                      {field.type === 'textarea' ? (
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

          {/* Bottom save — convenience duplicate for long forms */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-sm transition"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : 'Save changes'}
          </button>

          <p className="text-center text-stone-400 text-xs pb-4">
            Changes go live on your portfolio immediately after saving.
          </p>
        </form>
      </div>

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
