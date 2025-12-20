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

  // ✅ Fetch templates from backend
  useEffect(() => {
    const fetchTemplates = async () => {
      try {

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`);
        const data = await res.json();

        if (res.ok) {
          setTemplates(data);
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

      const res = await fetch(`/api/templates`);
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
    <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-lg p-6 md:p-10 my-10 md:my-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">
          Choose Your <span className="text-yellow-500">Portfolio</span> Template
        </h2>

        <p className="text-center text-gray-600 mb-6 md:mb-8 px-4">
          Select a template to start creating your portfolio.
        </p>

        {templates.length === 0 ? (
          <p className="text-center text-gray-500">Loading templates...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-transform hover:scale-105"
              >
                <img
                  src={`${template.thumbnail}`}
                  alt={template.name}
                  className="w-full h-52 sm:h-64 md:h-72 object-cover"
                />

                {hoveredTemplate === template.id && (
                  <div className="absolute top-2 right-2 bg-yellow-100 px-2 py-1 text-xs text-yellow-600 rounded-2xl">
                    {template.price && template.price > 0 ? "Paid" : "Free"}
                  </div>
                )}

                <div className="p-4 justify-end">
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>

                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="bg-gray-800 text-white text-sm py-2 px-4 rounded w-full text-center hover:bg-gray-600"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleSelect(template.id)}
                      disabled={loading}
                      className="bg-yellow-500 text-gray-800 text-sm py-2 px-4 rounded w-full hover:bg-yellow-600 disabled:opacity-50"
                    >
                      {loading ? "Loading..." : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
          <div className="relative bg-white rounded-xl shadow-2xl w-11/12 sm:w-10/12 md:w-3/4 lg:w-2/3 h-[75vh] md:h-[80vh] overflow-hidden">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-3 right-4 text-black bg-gray-200 hover:bg-gray-300 rounded-full p-3"
            >
              ✕
            </button>
            <iframe
              src={`/templates/${previewTemplate.id}/preview.html`}
              title={`${previewTemplate.name} Preview`}
              className="w-full h-full border-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;
