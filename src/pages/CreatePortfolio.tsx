/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PortfolioVisualBuilder from '../components/PortfolioVisualBuilder.tsx';

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
  isPro?: boolean; // Flag to determine if template requires Pro
}

const CreatePortfolio = () => {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedFields, setCompletedFields] = useState(0);
  const { user, isPro } = useAuth();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
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
      const filled = Object.keys(formData).filter(key => formData[key]).length;
      setCompletedFields(filled);
    }
  }, [formData, template]);

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (files && files[0]) {
      const base64 = await fileToBase64(files[0]);
      setFormData((prev) => ({
        ...prev,
        [name]: base64,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("Please log in to create a portfolio");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/create-portfolio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            templateId,
            formData,
          }),
        }
      );

      if (res.status === 413) {
        throw new Error('Image is too large. Please reduce the amount of content and try again.');
      }

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'FREE_TEMPLATE_LIMIT_REACHED') {
          throw new Error("You've already used your free template. Upgrade to Pro for unlimited portfolios!");
        }
        if (data.code === 'PRO_TEMPLATE_REQUIRED') {
          throw new Error("This template requires a Pro subscription. Upgrade to unlock all templates!");
        }
        throw new Error(data.error || "Failed to generate portfolio");
      }
      
      setPortfolioSlug(data.portfolioSlug);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVercelDeploy = async () => {
    if (!portfolioSlug) return;

    setDeploying(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/vercel/deploy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolioId: portfolioSlug }),
        }
      );

      if (!res.ok) throw new Error("Failed to deploy portfolio");

      const data = await res.json();
      setDeployUrl(data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setDeploying(false);
    }
  };

  const getFieldSection = (fieldName: string) => {
    if (fieldName.includes('fullName') || fieldName.includes('writerType') || fieldName.includes('bio') || fieldName.includes('profilePicture')) {
      return 'personal';
    }
    if (fieldName.includes('sample')) return 'samples';
    if (fieldName.includes('testimonial')) return 'testimonials';
    if (fieldName.includes('email') || fieldName.includes('linkedin') || fieldName.includes('twitter')) {
      return 'contact';
    }
    return 'other';
  };

  const groupedFields = template?.fields.reduce((acc, field) => {
    const section = getFieldSection(field.name);
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  const progress = template ? (completedFields / template.fields.length) * 100 : 0;

  const isProTemplate = template?.id === "professional-writer-template" || template?.isPro;

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading template...</p>
        </div>
      </div>
    );
  }

  if (isProTemplate && !isPro) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 py-10 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Pro Template</h2>
          <p className="text-slate-400 mb-6">
            This advanced template with visual builder is only available for Pro members.
          </p>
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300 text-sm">Canva-style visual builder</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300 text-sm">Modal popups for writing samples</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300 text-sm">Advanced customization options</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-slate-300 text-sm">Unlimited portfolios</span>
            </div>
          </div>
          <Link to="/pricing" className="w-full block">
            <button className="w-full bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition">
              Upgrade to Pro
            </button>
          </Link>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors mt-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  if (isProTemplate && isPro) {
    return (
      <div className="min-h-screen bg-slate-900">
        <PortfolioVisualBuilder
          template={template}
          onSave={handleSubmit}
          onCancel={() => window.history.back()}
        />
      </div>
    );
  }

  if (portfolioSlug) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 py-10 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Success Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">
              Your Portfolio is Ready! 🎉
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Your professional portfolio has been generated successfully.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href={`${import.meta.env.VITE_API_URL}/api/templates/preview?slug=${portfolioSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-700/50 border border-slate-600/50 text-slate-200 px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 hover:border-slate-500 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Portfolio
              </a>

              <Link to={`/edit/${portfolioSlug}`}>
                <button className="inline-flex items-center justify-center gap-2 bg-blue-500/20 border-2 border-blue-500 text-blue-400 px-6 py-3 rounded-xl font-semibold hover:bg-blue-500/30 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Portfolio
                </button>
              </Link>

              <button
                onClick={handleVercelDeploy}
                disabled={deploying}
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20 transition-all"
              >
                {deploying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    Deploying...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Deploy to Vercel
                  </>
                )}
              </button>
            </div>

            {/* Deployed URL */}
            {deployUrl && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6">
                <p className="text-green-400 font-semibold mb-2">✅ Successfully Deployed!</p>
                <a
                  href={deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-300 hover:text-green-200 break-all underline"
                >
                  {deployUrl}
                </a>
              </div>
            )}

            {/* Back to Templates */}
            <Link
              to="/templates"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Create Another Portfolio
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 20s infinite ease-in-out; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 py-10 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors mb-4 mr-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Templates
          </Link>

          <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4">
            <span className="text-yellow-400 text-sm font-semibold">Creating Portfolio</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">{template.name}</h1>
          <p className="text-slate-400 text-lg">{template.description}</p>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Progress</span>
              <span className="text-yellow-400 font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          {groupedFields?.personal && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-lg">
                  👤
                </span>
                Personal Information
              </h2>
              <div className="space-y-4">
                {groupedFields.personal.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-yellow-400 ml-1">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 transition-all"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Writing Samples */}
          {groupedFields?.samples && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-lg">
                  📄
                </span>
                Writing Samples
              </h2>
              <div className="space-y-4">
                {groupedFields.samples.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-yellow-400 ml-1">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 transition-all"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials */}
          {groupedFields?.testimonials && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center text-lg">
                  💬
                </span>
                Client Testimonials
                <span className="text-sm text-slate-500 font-normal">(Optional)</span>
              </h2>
              <div className="space-y-4">
                {groupedFields.testimonials.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 transition-all"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {groupedFields?.contact && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-lg">
                  📧
                </span>
                Contact Information
              </h2>
              <div className="space-y-4">
                {groupedFields.contact.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-yellow-400 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      onChange={handleChange}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder:text-slate-600 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto min-w-[300px] bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Generating Your Portfolio...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Generate Portfolio
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 20s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .bg-radial-gradient {
          background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(15, 23, 42, 0.2) 50%, rgba(15, 23, 42, 0.6) 100%);
        }
      `}</style>
    </div>
  );
};

export default CreatePortfolio;