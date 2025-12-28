/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface TemplateField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
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

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (files && files[0]) {
      const base64 = await fileToBase64(files[0]);
      setFormData((prev) => ({
        ...prev,
        [name]: base64, // ✅ store base64, not File
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
    if (!templateId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/create-portfolio`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId,
            formData,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to generate portfolio");

      const data = await res.json();
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

  if (!template) return <p>Loading template...</p>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">{template.name}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {template.fields.map((field) => (
          <div key={field.name}>
            <label className="block mb-2 font-semibold text-sm sm:text-base">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                onChange={handleChange}
                required={field.required}
                className="w-full border rounded p-2 sm:p-3"
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                onChange={handleChange}
                required={field.required}
                className="w-full border rounded p-2 sm:p-3"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading || deploying}
          className="bg-yellow-500 text-black py-2 px-4 sm:px-6 rounded w-full sm:w-auto hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Portfolio"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {portfolioSlug && (
        <div className="mt-6 flex flex-col gap-3">
          <h3 className="font-bold mb-2">Your Portfolio is Ready!</h3>

          <a
            href={`${import.meta.env.VITE_API_URL}/api/templates/preview?slug=${portfolioSlug}`}
            target="_blank"
            className="text-blue-600 underline break-all"
          >
            Preview Portfolio
          </a>

          <button
            onClick={handleVercelDeploy}
            disabled={deploying || !portfolioSlug}
            className="bg-yellow-500 text-black py-2 px-4 sm:px-6 rounded w-full sm:w-auto hover:bg-yellow-600"
          >
            {deploying ? "Deploying..." : "Deploy to Vercel"}
          </button>

          {deployUrl && (
            <p className="mt-2">
              Deployed URL:{" "}
              <a href={deployUrl} target="_blank" className="text-blue-600 underline break-all">
                {deployUrl}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatePortfolio;
