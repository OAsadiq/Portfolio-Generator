import { useState } from "react";

const HowItWorks = () => {
  const [selectedStep, setSelectedStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Step 1: Select a Template",
      description: "Choose a template that suits your portfolio style.",
      img: "/assets/feature15.jpg",
    },
    {
      id: 2,
      title: "Step 2: Fill Out the Form",
      description: "Provide your name, bio, skills, and project details to start.",
      img: "/assets/feature13.jpg",
    },
    {
      id: 3,
      title: "Step 3: Generate Your Site",
      description: "Click generate, and your personalized portfolio site is ready!",
      img: "/assets/feature16.jpg",
    },
  ];

  return (
    <div className="py-16 px-6 md:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="px-2 py-1 w-fit text-xs mb-2 bg-yellow-100 text-yellow-500 border border-yellow-400 rounded-2xl font-semibold">
          How It Works
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          How Portfolio-Generator Works
        </h2>

        <p className="text-gray-600 text-base md:text-lg mb-6">
          Create a stunning portfolio by following these simple steps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-xl cursor-pointer transition ${
                  selectedStep === step.id ? "bg-yellow-100" : "bg-white"
                }`}
                onClick={() => setSelectedStep(step.id)}
              >
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p
                  className={`text-sm ${
                    selectedStep === step.id ? "text-gray-600" : "text-gray-500"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex justify-center">
            <img
              src={steps[selectedStep - 1].img}
              alt="Step Illustration"
              className="w-full h-[40vh] md:h-[70vh] object-cover rounded-4xl shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
