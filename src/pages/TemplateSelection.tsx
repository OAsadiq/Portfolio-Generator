import { useNavigate } from "react-router-dom";
import { useState } from "react";

const templates = [
  {
    id: 1,
    title: "Modern Template",
    description: "A sleek and modern design for tech professionals.",
    image: "/assets/templates/template2.png",
    url: "https://jakore.vercel.app",
    price: 0,
  },
  {
    id: 2,
    title: "Minimal Template",
    description: "A clean, minimal template for simplicity lovers.",
    image: "/assets/templates/template2.png",
    url: "https://minimal-template.vercel.app",
    price: 0, // Free Template
  },
  {
    id: 3,
    title: "Creative Template",
    description: "A colorful, creative design to showcase your skills.",
    image: "/assets/templates/template3.png",
    url: "https://creative-template.vercel.app",
    price: 15, // Paid Template
  },
  {
    id: 4,
    title: "Professional Template",
    description: "A sophisticated and professional look for tech experts.",
    image: "/assets/templates/template3.png",
    url: "https://professional-template.vercel.app",
    price: 20, // Paid Template
  },
  {
    id: 5,
    title: "Classic Template",
    description: "Timeless design for showcasing your experience and skills.",
    image: "/assets/templates/template1.jpg",
    url: "https://classic-template.vercel.app",
    price: 0, // Free Template
  },
];

const TemplateSelection = () => {
  const navigate = useNavigate();
  const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);

  const handleSelect = async (templateId: number) => {
    const portfolioId = localStorage.getItem("portfolioId");

    const response = await fetch("/api/select-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, portfolioId }),
    });

    if (response.ok) {
      navigate(`/portfolio/${portfolioId}`);
    } else {
      alert("Failed to select template. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-white flex items-center justify-center">
      <div className="max-w-6xl w-full bg-white text-gray-800 rounded-4xl shadow-lg p-10 my-16">
        <h2 className="text-5xl font-extrabold mb-4 text-center leading-tight text-black">
          Choose Your <span className="text-yellow-500">Portfolio</span> Template
        </h2>

        <p className="text-center text-lg text-gray-600 mb-8">
          Select a template that best represents your personal style and skills.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`rounded-lg overflow-hidden shadow-lg hover:shadow-xl relative transition-transform ${
                template.price > 0 ? "hover:scale-100" : "hover:scale-105"
              }`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="relative">
                <img
                  src={template.image}
                  alt={template.title}
                  className={`w-full h-auto object-fit ${
                    template.price > 0 ? "opacity-70" : ""
                  } transition-opacity`}
                />

                {/* Display Price or 'Free' as a tag */}
                {hoveredTemplate === template.id && (
                  <div
                    className={`absolute top-2 right-2 ${
                      template.price > 0 ? "bg-yellow-100" : "bg-yellow-100"
                    } px-2 py-1 w-fit h-fit text-xs text-yellow-500 border border-yellow-400 rounded-2xl font-semibold`}
                  >
                    {template.price > 0 ? "Coming Soon" : "Free"}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold mb-1 text-black">{template.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{template.description}</p>

                <div className="flex items-end gap-4">
                  {template.price > 0 ? (
                    <button
                      className="bg-gray-800 text-white text-sm py-2 px-4 rounded w-full opacity-50 cursor-not-allowed"
                    >
                      View
                    </button>
                  ) : (
                    <a
                      href={template.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 text-white text-sm py-2 px-4 rounded w-full hover:bg-gray-600 text-center"
                    >
                      View
                    </a>
                  )}

                  {template.price > 0 ? (
                    <button
                      className="bg-yellow-500 text-white text-sm py-2 px-4 rounded w-full opacity-50 cursor-not-allowed"
                    >
                      Select
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelect(template.id)}
                      className="bg-yellow-500 text-white text-sm py-2 px-4 rounded w-full hover:bg-yellow-600"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;
