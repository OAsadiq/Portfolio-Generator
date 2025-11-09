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
  const [loading, setLoading] = useState(false);

  // ✅ Fetch templates from backend
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;

        const res = await fetch(`${API_URL}/api/templates`);
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

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/select/${templateId}`);
      const data = await res.json();

      if (res.ok) {
        // Store selected template config for the next page
        localStorage.setItem("selectedTemplate", JSON.stringify(data));
        navigate(`/create/${data.id}`);
      } else {
        alert(data.error || "Failed to load template");
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
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-lg p-10 my-16">
        <h2 className="text-4xl font-bold mb-4 text-center">
          Choose Your <span className="text-yellow-500">Portfolio</span> Template
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Select a template to start creating your portfolio.
        </p>

        {templates.length === 0 ? (
          <p className="text-center text-gray-500">Loading templates...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-transform hover:scale-105"
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}${template.thumbnail}`}
                  alt={template.name}
                  className="w-full h-auto object-cover"
                />

                {hoveredTemplate === template.id && (
                  <div className="absolute top-2 right-2 bg-yellow-100 px-2 py-1 text-xs text-yellow-600 rounded-2xl">
                    {template.price && template.price > 0 ? "Paid" : "Free"}
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>

                  <div className="mt-4 flex gap-3">
                    <a
                      href={`${import.meta.env.VITE_API_URL}/api/templates/${template.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 text-white text-sm py-2 px-4 rounded w-full text-center hover:bg-gray-600"
                    >
                      View
                    </a>

                    <button
                      onClick={() => handleSelect(template.id)}
                      disabled={loading}
                      className="bg-yellow-500 text-white text-sm py-2 px-4 rounded w-full hover:bg-yellow-600 disabled:opacity-50"
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
    </div>
  );
};

export default TemplateSelection;
