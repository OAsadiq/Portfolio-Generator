/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import PortfolioVisualBuilder from "../components/PortfolioVisualBuilder.tsx";

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
  isPro?: boolean;
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
  testimonials: { label: "Client testimonials", icon: "💬" },
  contact: { label: "Contact details", icon: "📧" },
  other: { label: "Additional info", icon: "📋" },
};

const CreatePortfolio = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedFields, setCompletedFields] = useState(0);
  const { user, isPro } = useAuth();

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `profile-pictures/${user?.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    const stored = localStorage.getItem("selectedTemplate");
    if (stored) {
      const parsed: Template = JSON.parse(stored);
      if (parsed.id === templateId) setTemplate(parsed);
    }
  }, [templateId]);

  useEffect(() => {
    if (template) {
      const filled = Object.keys(formData).filter(k => formData[k]).length;
      setCompletedFields(filled);
    }
  }, [formData, template]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      const url = await uploadImage(files[0]);
      setFormData(prev => ({ ...prev, [name]: url }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId || !user) return;
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFieldSection = (name: string) => {
    if (["fullName", "writerType", "bio", "profilePicture"].some(k => name.includes(k))) return "personal";
    if (name.includes("sample")) return "samples";
    if (name.includes("testimonial")) return "testimonials";
    if (["email", "linkedin", "twitter"].some(k => name.includes(k))) return "contact";
    return "other";
  };

  const groupedFields = template?.fields.reduce((acc, field) => {
    const section = getFieldSection(field.name);
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  const totalFields = template?.fields.length || 1;
  const progress = Math.round((completedFields / totalFields) * 100);
  const isProTemplate = template?.id === "professional-writer-template" || template?.isPro;

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
          <p className="text-stone-500 text-sm mb-6">This template is available on Pro. Upgrade for $9/mo to unlock all templates, custom domains, and analytics.</p>
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

  // Pro visual builder
  if (isProTemplate && isPro) {
    return (
      <div className="min-h-screen bg-stone-50">
        <PortfolioVisualBuilder
          template={template}
          onSave={handleSubmit}
          onCancel={() => navigate("/templates")}
        />
      </div>
    );
  }

  // Success screen
  if (portfolioSlug) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">

          {/* Check */}
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-stone-900 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your portfolio is live.
          </h2>
          <p className="text-stone-500 text-base mb-8">
            You're done. Share the link, edit it any time, or go to your dashboard.
          </p>

          <div className="flex flex-col gap-3 mb-8">
            <a
              href={`${import.meta.env.VITE_API_URL}/api/templates/preview?slug=${portfolioSlug}`}
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

            <Link to={isPro ? `/builder/${portfolioSlug}` : `/edit/${portfolioSlug}`} className="w-full">
              <button className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 py-3.5 rounded-xl font-semibold text-sm transition">
                Edit portfolio
              </button>
            </Link>

            <Link to={isPro ? "/pro-dashboard" : "/dashboard"} className="w-full">
              <button className="w-full border border-stone-200 hover:bg-stone-50 text-stone-700 py-3.5 rounded-xl font-semibold text-sm transition">
                Go to dashboard
              </button>
            </Link>
          </div>

          {/* Share nudge */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-stone-700 text-sm font-medium mb-1">Ready to share?</p>
            <p className="text-stone-500 text-xs">
              Copy your link from the portfolio preview and drop it in your next email, bio, or pitch.
            </p>
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
            ) : (
              "Build my portfolio →"
            )}
          </button>

          <p className="text-center text-stone-400 text-xs">Your portfolio is live instantly. You can edit any detail after.</p>
        </form>
      </div>
    </div>
  );
};

export default CreatePortfolio;
