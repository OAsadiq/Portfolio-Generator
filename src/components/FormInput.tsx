import React, { useState } from "react";

const MultiStepModalForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    about: "",
    skills: "",
    profileImage: null,
    projects: [{ title: "", image: null }],
  });

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] });
  };

  const stepComponents = {
    1: (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Step 1: Your Name</h2>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded mb-4"
          required
        />
        <button onClick={handleNext} className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">
          Next
        </button>
      </div>
    ),
    2: (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Step 2: Tech Role</h2>
        <input
          type="text"
          name="role"
          placeholder="Enter your tech role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded mb-4"
          required
        />
        <div className="flex justify-between">
          <button onClick={handlePrev} className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600">
            Back
          </button>
          <button onClick={handleNext} className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">
            Next
          </button>
        </div>
      </div>
    ),
    3: (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Step 3: Bio</h2>
        <textarea
          name="about"
          placeholder="Tell us about yourself"
          value={formData.about}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded mb-4"
          rows={4}
          required
        />
        <div className="flex justify-between">
          <button onClick={handlePrev} className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600">
            Back
          </button>
          <button onClick={handleNext} className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">
            Next
          </button>
        </div>
      </div>
    ),
    4: (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Step 4: Upload Profile Image</h2>
        <input
          type="file"
          onChange={handleImageUpload}
          className="w-full p-3 border border-gray-300 rounded mb-4"
          accept="image/*"
          required
        />
        <div className="flex justify-between">
          <button onClick={handlePrev} className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600">
            Back
          </button>
          <button onClick={handleNext} className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">
            Next
          </button>
        </div>
      </div>
    ),
    5: (
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Step 5: Finalize</h2>
        <p className="mb-2">Name: {formData.name}</p>
        <p className="mb-2">Role: {formData.role}</p>
        <p className="mb-2">About: {formData.about}</p>
        <p className="mb-2">
          Profile Image: {formData.profileImage ? formData.profileImage.name : "Not uploaded"}
        </p>

        <div className="flex justify-between">
          <button onClick={handlePrev} className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600">
            Back
          </button>
          <button type="submit" className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600">
            Submit
          </button>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className={`w-8 h-8 rounded-full ${currentStep >= 1 ? "bg-blue-500" : "bg-gray-300"}`} />
          <div className={`w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-blue-500" : "bg-gray-300"}`} />
          <div className={`w-8 h-8 rounded-full ${currentStep >= 3 ? "bg-blue-500" : "bg-gray-300"}`} />
          <div className={`w-8 h-8 rounded-full ${currentStep >= 4 ? "bg-blue-500" : "bg-gray-300"}`} />
          <div className={`w-8 h-8 rounded-full ${currentStep === 5 ? "bg-blue-500" : "bg-gray-300"}`} />
        </div>

        {stepComponents[currentStep]}
      </div>
    </div>
  );
};

export default MultiStepModalForm;
