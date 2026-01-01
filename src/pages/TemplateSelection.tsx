// src/components/TemplateSelection.tsx - Updated with Auth
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
}

const TemplateSelection = () => {
  const navigate = useNavigate();
  const { user, hasUsedFreeTemplate, checkTemplateUsage } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedLoading, setSelectedLoading] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        
        const res = await fetch(`${apiUrl}/api/templates`);
        
        if (!res.ok) {
          throw new Error(`Failed to load templates (Status: ${res.status})`);
        }
        
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid response format from API');
        }

        const writerTemplates = data.filter((template: Template) => {
          return template.id !== 'professional-writer-template';
        });
        
        console.log('Filtered templates:', writerTemplates.length);
        setTemplates(writerTemplates);
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    };

    fetchTemplates();
    
    // Check usage when component mounts
    if (user) {
      checkTemplateUsage();
    }
  }, [user, checkTemplateUsage]);

  const handleSelect = async (templateId: string) => {
    // Check if trying to use free template again
    if (templateId === 'minimal-template' && hasUsedFreeTemplate) {
      setShowLimitModal(true);
      return;
    }

    try {
      setSelectedLoading(templateId);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`);
      const data = await res.json();

      if (res.ok) {
        const selected = data.find((t: any) => t.id === templateId);

        if (!selected) {
          alert("Template not found");
          return;
        }

        localStorage.setItem("selectedTemplate", JSON.stringify(selected));
        navigate(`/create/${selected.id}`);
      } else {
        alert("Failed to load templates");
      }
    } catch (error) {
      console.error(error);
      alert("Error selecting template.");
    } finally {
      setSelectedLoading(null);
    }
  };

  const isTemplateLocked = (templateId: string) => {
    return templateId === 'minimal-template' && hasUsedFreeTemplate;
  };

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

          {/* Usage Status */}
          {hasUsedFreeTemplate && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-400 text-sm">You've used your free template. Upgrade for more.</span>
            </div>
          )}
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading templates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {templates.map((template) => {
              const isHovered = hoveredTemplate === template.id;
              const isLoading = selectedLoading === template.id;
              const isLocked = isTemplateLocked(template.id);

              return (
                <div
                  key={template.id}
                  onMouseEnter={() => !isLocked && setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  style={{
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    opacity: isLocked ? 0.6 : 1
                  }}
                  className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl ${
                    isHovered 
                      ? 'shadow-2xl shadow-yellow-400/10 border-yellow-400/30' 
                      : 'border-slate-700/50'
                  } border`}
                >
                  {/* Locked Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <p className="text-slate-300 font-semibold mb-1">Already Used</p>
                        <p className="text-slate-500 text-sm">Upgrade for more templates</p>
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
                        className="absolute top-3 right-3 bg-yellow-400/20 backdrop-blur-sm border border-yellow-800/40 px-3 py-1 text-xs text-yellow-300 rounded-full font-semibold"
                        style={{ animation: 'fadeIn 0.3s ease-out' }}
                      >
                        {template.price && template.price > 0 ? "Paid" : "Free"}
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
                          "Used"
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
              <h3 className="text-xl font-bold text-slate-50 mb-2">Free Template Limit Reached</h3>
              <p className="text-slate-400 mb-6">
                You've already created your free portfolio. Upgrade to Pro to create unlimited portfolios with custom domains and more features!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 bg-slate-700 text-slate-300 py-2.5 px-4 rounded-lg font-semibold hover:bg-slate-600 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    // Navigate to pricing or upgrade page
                  }}
                  className="flex-1 bg-yellow-400 text-slate-900 py-2.5 px-4 rounded-lg font-semibold hover:bg-yellow-300 transition"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal - same as before */}
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
              <div className="text-slate-600 text-sm">
                {previewTemplate.price && previewTemplate.price > 0 ? "Paid Template" : "Free Forever"}
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