import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface TemplateField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

interface Template {
  id: string;
  name: string;
  fields: TemplateField[];
}

const CreatePortfolio = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, string | File>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get the selected template from localStorage (set on template selection)
    const stored = localStorage.getItem("selectedTemplate");
    if (stored) {
      const parsed: Template = JSON.parse(stored);
      if (parsed.id === templateId) setTemplate(parsed);
    }
  }, [templateId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: files?.[0] || value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    setLoading(true);

    try {
      const form = new FormData();
      form.append("templateId", template.id);

      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          form.append(key, value);
        } else {
          form.append(key, value);
        }
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/create-portfolio`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text(); // in case backend returned HTML
        throw new Error(text || "Failed to create portfolio");
      }

      const data = await res.json();
      localStorage.setItem("portfolioId", data.portfolioId);
      navigate(`/preview/${data.portfolioId}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error generating portfolio");
    } finally {
      setLoading(false);
    }
  };

  if (!template) return <p>Loading template...</p>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h2 className="text-3xl font-bold mb-6">{template.name}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {template.fields.map((field) => (
          <div key={field.name}>
            <label className="block mb-1 font-semibold">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                onChange={handleChange}
                required={field.required}
                className="w-full border rounded p-2"
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                onChange={handleChange}
                required={field.required}
                className="w-full border rounded p-2"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="bg-yellow-500 text-black py-2 px-6 rounded hover:bg-yellow-600"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Portfolio"}
        </button>
      </form>
    </div>
  );
};

export default CreatePortfolio;
