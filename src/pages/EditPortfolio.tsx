/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const EditPortfolio = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, [slug, user]);

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
      setFormData(data.form_data || {});
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors mb-4"
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
            Edit {portfolio.user_name}
          </h1>
          <p className="text-slate-400">Update your portfolio information and regenerate</p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-lg">
                👤
              </span>
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Full Name <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName || ''}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Writer Type
                </label>
                <input
                  type="text"
                  name="writerType"
                  value={formData.writerType || ''}
                  onChange={handleChange}
                  placeholder="e.g., Freelance Content Writer"
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Bio <span className="text-yellow-400">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center text-lg">
                📧
              </span>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email <span className="text-yellow-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin || ''}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter || ''}
                  onChange={handleChange}
                  placeholder="@yourhandle"
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

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