/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  price?: number;
}

const TemplateSelection = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`);
        const data = await res.json();

        if (res.ok) {
          const writerTemplates = data.filter((template: Template) => {
            return template.id !== 'professional-writer-template';
          });
          
          setTemplates(writerTemplates);
        } else {
          console.error("Failed to load templates:", data.error);
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelect = async (templateId: string) => {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center py-10 md:py-16 px-4 relative overflow-hidden">
      
      {/* Animated Background Effects - Same as Homepage */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Mesh Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Animated Grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-horizontal"></div>
          <div className="absolute inset-0 bg-grid-vertical"></div>
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4">
            <span className="text-yellow-400 text-sm font-semibold">Writer Templates</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-50">
            Choose Your <span className="text-yellow-400">Writer Portfolio</span> Template
          </h2>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Professional templates designed specifically for writers and copywriters. Pick one and start building in minutes.
          </p>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading templates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-yellow-400/10 hover:border-yellow-400/30 transition-all duration-300 hover:scale-105"
              >
                {/* Template Thumbnail */}
                <div className="relative h-52 sm:h-64 md:h-72 overflow-hidden bg-slate-900/50">
                  <img
                    src={`${template.thumbnail}`}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                  {/* Price Badge */}
                  {hoveredTemplate === template.id && (
                    <div className="absolute top-3 right-3 bg-yellow-400/20 backdrop-blur-sm border border-yellow-800/40 px-3 py-1 text-xs text-slate-900 rounded-full font-semibold animate-fadeIn">
                      {template.price && template.price > 0 ? "Paid" : "Free"}
                    </div>
                  )}

                  {/* Hover Glow Effect */}
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:via-yellow-400/10 group-hover:to-transparent transition-all duration-500"></div> */}
                </div>

                {/* Template Info */}
                <div className="p-5 md:p-6">
                  <h3 className="font-bold text-lg md:text-xl text-slate-50 mb-2 group-hover:text-yellow-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1 bg-slate-700/50 border border-slate-600/50 text-slate-200 text-sm py-2.5 px-4 rounded-lg font-semibold hover:bg-slate-700 hover:border-slate-500 hover:text-yellow-400 transition-all duration-300"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => handleSelect(template.id)}
                      disabled={loading}
                      className="flex-1 bg-yellow-400 text-slate-900 text-sm py-2.5 px-4 rounded-lg font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all duration-300"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </span>
                      ) : (
                        "Select"
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Glow on Hover */}
                {/* <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/20 group-hover:via-yellow-400/10 group-hover:to-yellow-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div> */}
              </div>
            ))}
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

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex justify-center items-center p-4 animate-fadeIn">
          <div className="relative bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden">
            {/* Modal Header */}
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

            {/* Iframe Preview */}
            <iframe
              src={`/templates/${previewTemplate.id}/preview.html`}
              title={`${previewTemplate.name} Preview`}
              className="w-full h-full border-none pt-20"
            />

            {/* Action Buttons at Bottom */}
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

      {/* CSS Animations */}
      <style>{`
        /* Blob Animation */
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 20s infinite ease-in-out;
        }

        /* Grid Animation */
        .bg-grid-horizontal {
          background-image: linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 100% 50px;
          animation: gridMoveVertical 20s linear infinite;
        }
        .bg-grid-vertical {
          background-image: linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 50px 100%;
          animation: gridMoveHorizontal 20s linear infinite;
        }

        @keyframes gridMoveVertical {
          0% { background-position: 0 0; }
          100% { background-position: 0 50px; }
        }
        @keyframes gridMoveHorizontal {
          0% { background-position: 0 0; }
          100% { background-position: 50px 0; }
        }

        /* Fade In Animation */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Radial Gradient */
        .bg-radial-gradient {
          background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(15, 23, 42, 0.2) 50%, rgba(15, 23, 42, 0.6) 100%);
        }

        /* Animation Delays */
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .animate-blob, .bg-grid-horizontal, .bg-grid-vertical {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default TemplateSelection;