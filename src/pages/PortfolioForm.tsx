import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Experience {
  role: string;
  organization: string;
  duration: string;
  description: string;
  workDescription: string[];
}

interface Project {
  title: string;
  image: File | null;
}

const rolesList = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "UI/UX Designer",
  "DevOps Engineer",
  "Data Scientist",
];

const PortfolioForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    skills: "",
    profileImage: null as File | null,
    projects: [] as Project[],
    experience: [] as Experience[],
  });

  const [project, setProject] = useState({ title: "", image: null as File | null });
  const [experience, setExperience] = useState({
    role: "",
    organization: "",
    duration: "",
    description: "",
    workDescription: [""],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setFormData({ ...formData, profileImage: file });
    } else {
      alert("Image file must be 10MB or less.");
    }
  };

  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      const updatedProjects = [...formData.projects];
      updatedProjects[idx].image = file;
      setFormData({ ...formData, projects: updatedProjects });
    } else {
      alert("Project image must be 10MB or less.");
    }
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExperience({ ...experience, [name]: value });
  };

  const handleWorkDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const updatedDescriptions = [...experience.workDescription];
    updatedDescriptions[idx] = e.target.value;
    setExperience({ ...experience, workDescription: updatedDescriptions });
  };

  const addProject = () => {
    setFormData({ ...formData, projects: [...formData.projects, project] });
    setProject({ title: "", image: null });
  };

  const addExperience = () => {
    setFormData({ ...formData, experience: [...formData.experience, experience] });
    setExperience({ role: "", organization: "", duration: "", description: "", workDescription: [""] });
  };

  const addWorkDescriptionField = () => {
    setExperience({ ...experience, workDescription: [...experience.workDescription, ""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/create-portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("portfolioId", data.portfolioId);
      navigate("/templates");
    } else {
      alert("Failed to submit data. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-white flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white text-gray-800 rounded-lg shadow-lg p-8 my-16">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Create Your Portfolio</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-bold">Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>

            <div>
              <label className="block mb-2 font-bold">Tech Role:</label>
              <input type="text" name="role" list="rolesList" placeholder="Select or Type Role" value={experience.role} onChange={(e) => setExperience({ ...experience, role: e.target.value })} className="w-full border p-2 rounded" />
              <datalist id="rolesList">{rolesList.map((role, idx) => <option key={idx} value={role} />)}</datalist>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-bold">Bio:</label>
            <textarea name="about" value={formData.about} onChange={handleChange} className="w-full border p-2 rounded" rows={4} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-bold">Skills:</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>

            <div>
              <label className="block mb-2 font-bold">Profile Image:</label>
              <input type="file" onChange={handleImageUpload} className="w-full border p-2 rounded" accept="image/*" required />
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Add Project:</h3>
            <input type="text" name="title" placeholder="Project Title" value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} className="w-full border p-2 rounded mb-2" />
            <button type="button" onClick={addProject} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Add Project</button>
          </div>

          <div>
            <h3 className="font-bold mb-2">Add Experience:</h3>
            <input type="text" name="role" placeholder="Role" value={experience.role} onChange={handleExperienceChange} className="w-full border p-2 rounded mb-2" />
            <button type="button" onClick={addExperience} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Add Experience</button>
          </div>

          <button type="submit" className="w-full bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500">Continue</button>
        </form>
      </div>
    </div>
  );
};

export default PortfolioForm;
