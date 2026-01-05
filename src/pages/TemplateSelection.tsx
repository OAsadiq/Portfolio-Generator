// src/components/TemplateSelection.tsx - Complete with Pro Support
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  price?: number;
  available?: boolean;
}

const TemplateSelection = () => {
  const navigate = useNavigate();
  const { user, hasUsedFreeTemplate, isPro, checkTemplateUsage, checkSubscription, session } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedLoading, setSelectedLoading] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get auth token
        const token = session?.access_token;
        
        if (!token) {
          setError("Please log in to view templates");
          setLoading(false);
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL;
        
        const res = await fetch(`${apiUrl}/api/templates`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Check if response is JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error('Server error: Invalid response format');
        }
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to load templates (Status: ${res.status})`);
        }
        
        const data = await res.json();

        // Handle correct response format
        const templateList = data.templates || data;

        if (!Array.isArray(templateList)) {
          console.error('Invalid response:', data);
          throw new Error('Invalid response format from API');
        }

        // DON'T FILTER - Show ALL templates
        console.log('✅ Loaded templates:', templateList.length);
        console.log('Templates:', templateList.map(t => ({ id: t.id, name: t.name })));
        setTemplates(templateList);
      } catch (err: any) {
        console.error("Error fetching templates:", err);
        setError(err.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
    
    // Check usage and subscription when component mounts
    if (user) {
      checkTemplateUsage();
      checkSubscription();
    }
  }, [user, checkTemplateUsage, checkSubscription, session]);

  const handleSelect = async (templateId: string) => {
    // Check if template is locked
    if (isTemplateLocked(templateId)) {
      setShowLimitModal(true);
      return;
    }

    try {
      setSelectedLoading(templateId);

      const token = session?.access_token;
      
      if (!token) {
        alert("Please log in to continue");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error("Failed to load template");
      }

      const data = await res.json();
      const templateList = data.templates || data;

      const selected = templateList.find((t: any) => t.id === templateId);

      if (!selected) {
        alert("Template not found");
        return;
      }

      localStorage.setItem("selectedTemplate", JSON.stringify(selected));
      navigate(`/create/${selected.id}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error selecting template.");
    } finally {
      setSelectedLoading(null);
    }
  };

  const isTemplateLocked = (templateId: string) => {
    // Pro users can use all templates
    if (isPro) {
      return false;
    }
    
    // Non-pro users who already used free template cannot use it again
    if (templateId === 'minimal-template' && hasUsedFreeTemplate) {
      return true;
    }
    
    // All other templates are locked for free users (assuming only 'minimal-template' is free)
    return templateId !== 'minimal-template';
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center py-10 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-50 mb-2">Unable to Load Templates</h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-400 text-slate-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-yellow-300 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center py-10 md:py-16 px-4 relative overflow-hidden">
      
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-horizontal pointer-events-none"></div>
          <div className="absolute inset-0 bg-grid-vertical pointer-events-none"></div>
        </div>
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors mb-4 mr-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Homepage
          </Link>

          <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4">
            <span className="text-yellow-400 text-sm font-semibold">Writer Templates</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-50">
            Choose Your <span className="text-yellow-400">Writer Portfolio</span> Template
          </h2>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Professional templates designed specifically for writers and copywriters. Pick one and start building in minutes.
          </p>

          {/* Pro Status Badge */}
          {isPro && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 border border-yellow-400/40 rounded-full">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-400 text-sm font-bold">Pro Member - All Templates Unlocked ✨</span>
            </div>
          )}

          {/* Usage Status for Free Users */}
          {!isPro && hasUsedFreeTemplate && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-400 text-sm">You've used your free template. Upgrade for unlimited access!</span>
            </div>
          )}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No templates available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {templates.map((template) => {
              const isHovered = hoveredTemplate === template.id;
              const isLoading = selectedLoading === template.id;
              const isLocked = isTemplateLocked(template.id);
              const isFreeTemplate = template.id === 'minimal-template';

              return (
                <div
                  key={template.id}
                  onMouseEnter={() => !isLocked && setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  style={{
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    opacity: isLocked ? 0.7 : 1
                  }}
                  className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl ${
                    isHovered 
                      ? 'shadow-2xl shadow-yellow-400/10 border-yellow-400/30' 
                      : 'border-slate-700/50'
                  } border`}
                >
                  {/* Pro Badge for Pro Users */}
                  {isPro && !isLocked && (
                    <div className="absolute top-3 left-3 bg-yellow-400/90 backdrop-blur-sm px-3 py-1 text-xs text-slate-900 rounded-full font-bold z-10 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      PRO
                    </div>
                  )}

                  {/* Locked Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm z-20 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <p className="text-slate-300 font-semibold mb-1">
                          {isFreeTemplate ? 'Already Used' : 'Pro Only'}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {isFreeTemplate ? 'Upgrade to create more' : 'Upgrade to unlock'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Template Thumbnail */}
                  <div className="relative h-52 sm:h-64 md:h-72 overflow-hidden bg-slate-900/50">
                    <img
                      src={`${template.thumbnail}`}
                      alt={template.name}
                      style={{
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.5s ease'
                      }}
                      className="w-full h-full object-cover"
                    />
                    
                    <div 
                      style={{
                        opacity: isHovered ? 0.4 : 0.6,
                        transition: 'opacity 0.3s ease'
                      }}
                      className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"
                    ></div>

                    {isHovered && !isLocked && (
                      <div 
                        className="absolute top-3 right-3 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/40 px-3 py-1 text-xs text-yellow-300 rounded-full font-semibold"
                        style={{ animation: 'fadeIn 0.3s ease-out' }}
                      >
                        {isFreeTemplate ? "Free" : "Pro"}
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-5 md:p-6">
                    <h3 
                      style={{
                        color: isHovered ? '#FACC15' : '#F8FAFC',
                        transition: 'color 0.3s ease'
                      }}
                      className="font-bold text-lg md:text-xl mb-2"
                    >
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => !isLocked && setPreviewTemplate(template)}
                        disabled={isLocked}
                        className="flex-1 bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm py-2.5 px-4 rounded-lg font-semibold hover:bg-slate-700 hover:border-slate-500 hover:text-yellow-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => handleSelect(template.id)}
                        disabled={isLoading || isLocked}
                        className="flex-1 bg-yellow-400 text-slate-900 text-sm py-2.5 px-4 rounded-lg font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all duration-300"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </span>
                        ) : isLocked ? (
                          isFreeTemplate ? "Used" : "🔒 Pro"
                        ) : (
                          "Select"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Coming Soon Message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-slate-400 text-sm">
              More templates coming soon for designers, developers, and other creatives
            </span>
          </div>
        </div>
      </div>

      {/* Limit Reached Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-50 mb-2">Upgrade to Pro</h3>
              <p className="text-slate-400 mb-6">
                {hasUsedFreeTemplate 
                  ? "You've already used your free template. Upgrade to Pro for unlimited portfolios and all premium templates!"
                  : "This template requires a Pro subscription. Upgrade to unlock all premium features!"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 bg-slate-700 text-slate-300 py-2.5 px-4 rounded-lg font-semibold hover:bg-slate-600 transition"
                >
                  Close
                </button>
                <Link to="/#pricing" className="flex-1">
                  <button
                    className="w-full bg-yellow-400 text-slate-900 py-2.5 px-4 rounded-lg font-semibold hover:bg-yellow-300 transition"
                  >
                    Upgrade to Pro
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex justify-center items-center p-4 animate-fadeIn">
          <div className="relative bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-slate-50 font-bold text-lg">{previewTemplate.name}</h3>
                <p className="text-slate-400 text-sm">{previewTemplate.description}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="w-10 h-10 flex items-center justify-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-yellow-400 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <iframe
              src={`/templates/${previewTemplate.id}/preview.html`}
              title={`${previewTemplate.name} Preview`}
              className="w-full h-full border-none pt-20"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/50 backdrop-blur-sm border-t border-slate-700/50 px-6 py-4 flex items-center justify-between">
              <div className="text-slate-400 text-sm">
                {previewTemplate.id === 'minimal-template' ? "Free Forever" : "Pro Template"}
              </div>
              <button
                onClick={() => {
                  setPreviewTemplate(null);
                  handleSelect(previewTemplate.id);
                }}
                className="bg-yellow-400 text-slate-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-yellow-300 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all duration-300"
              >
                Select This Template
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .bg-grid-horizontal {
          background-image: linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 100% 50px;
        }
        .bg-grid-vertical {
          background-image: linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 50px 100%;
        }
        .bg-radial-gradient {
          background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(15, 23, 42, 0.2) 50%, rgba(15, 23, 42, 0.6) 100%);
        }
      `}</style>
    </div>
  );
};

export default TemplateSelection;