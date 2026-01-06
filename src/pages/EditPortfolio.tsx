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

const EditPortfolio = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, [slug, user]);

  // Initialize formData with ALL template fields when portfolio loads
  useEffect(() => {
    if (portfolio && templateFields.length > 0) {
      initializeFormData();
    }
  }, [portfolio, templateFields]);

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

      if (!data) {
        setError('Portfolio not found');
        return;
      }

      setPortfolio(data);
      
      // Get template fields from portfolio or fallback to form_data keys
      if (data.template_fields && Array.isArray(data.template_fields)) {
        setTemplateFields(data.template_fields);
      } else {
        // Fallback: create fields from existing form_data
        const fields = Object.keys(data.form_data || {}).map(key => ({
          name: key,
          label: key.replace(/([A-Z])/g, ' $1').trim(),
          type: typeof data.form_data[key] === 'string' && data.form_data[key].length > 100 ? 'textarea' : 'text',
          required: false,
          placeholder: `Enter ${key.replace(/([A-Z])/g, ' $1').trim()}`
        }));
        setTemplateFields(fields);
      }
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize formData with ALL template fields (even empty ones)
  const initializeFormData = () => {
    const existingData = portfolio.form_data || {};
    const initializedData: any = {};

    // Add all template fields - existing values or empty strings
    templateFields.forEach(field => {
      initializedData[field.name] = existingData[field.name] || '';
    });

    setFormData(initializedData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;

    setSaving(true);
    setError(null);

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Please log in to continue');
        return;
      }

      // Call backend to regenerate portfolio
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/update-portfolio`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            slug: portfolio.slug,
            templateId: portfolio.template_id,
            formData
          })
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update portfolio');
      }

      // Success - redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Portfolio Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'This portfolio does not exist or you do not have access to it.'}</p>
          <Link to="/dashboard">
            <button className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (templateFields.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">No Template Data</h2>
          <p className="text-slate-400 mb-6">This portfolio has no template information.</p>
          <Link to="/dashboard">
            <button className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

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

  const groupedFields = templateFields.reduce((acc, field) => {
    const section = getFieldSection(field.name);
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 py-10 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors mb-4 mr-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full mb-4">
            <span className="text-blue-400 text-sm font-semibold">Editing Portfolio</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">
            Edit {portfolio.user_name || 'Portfolio'}
          </h1>
          <p className="text-slate-400">Update your portfolio information and regenerate</p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          {groupedFields.personal && groupedFields.personal.length > 0 && (
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
                        value={formData[field.name] || ''}
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
                        value={formData[field.name] || ''}
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
          {groupedFields.samples && groupedFields.samples.length > 0 && (
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
                        value={formData[field.name] || ''}
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
                        value={formData[field.name] || ''}
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
          {groupedFields.testimonials && groupedFields.testimonials.length > 0 && (
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
                        value={formData[field.name] || ''}
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
                        value={formData[field.name] || ''}
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
          {groupedFields.contact && groupedFields.contact.length > 0 && (
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
                      value={formData[field.name] || ''}
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

          {/* Other Fields */}
          {groupedFields.other && groupedFields.other.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-50 mb-6">Additional Information</h2>
              <div className="space-y-4">
                {groupedFields.other.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-yellow-400 ml-1">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ''}
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
                        value={formData[field.name] || ''}
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link to="/dashboard" className="flex-1">
              <button
                type="button"
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 px-6 rounded-xl font-bold transition"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 py-4 px-6 rounded-xl font-bold shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Saving Changes...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  💾 Save Changes
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS */}
      <style>{`
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

export default EditPortfolio;