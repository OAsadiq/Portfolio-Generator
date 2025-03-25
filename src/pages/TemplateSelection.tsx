import { useNavigate } from "react-router-dom";

const templates = [
  {
    id: 1,
    title: "Modern Template",
    description: "A sleek and modern design for tech professionals.",
    image: "/assets/templates/template1.jpg", 
  },
  {
    id: 2,
    title: "Minimal Template",
    description: "A clean, minimal template for simplicity lovers.",
    image: "/assets/templates/template1.jpg", 
  },
  {
    id: 3,
    title: "Creative Template",
    description: "A colorful, creative design to showcase your skills.",
    image: "/assets/templates/template1.jpg", 
  },
];

const TemplateSelection = () => {
  const navigate = useNavigate();

  const handlePreview = (templateId: number) => {
    navigate(`/preview/${templateId}`); 
  };

  const handleSelect = async (templateId: number) => {
    const portfolioId = localStorage.getItem("portfolioId");
  
    const response = await fetch("/api/select-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, portfolioId }),
    });
  
    if (response.ok) {
      navigate(`/portfolio/${portfolioId}`); // Redirect to the generated portfolio
    } else {
      alert("Failed to select template. Please try again.");
    }
  };  

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center">
      <div className="max-w-5xl w-full bg-white text-gray-800 rounded-lg shadow-lg p-8 my-16">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Select a Portfolio Template</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-md hover:bg-gray-100"
            >
              <img src={template.image} alt={template.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2 text-blue-600">{template.title}</h3>
                <p className="text-gray-700">{template.description}</p>

                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handlePreview(template.id)}
                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                  >
                    Preview
                  </button>

                  <button
                    onClick={() => handleSelect(template.id)}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Select
                  </button>
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
