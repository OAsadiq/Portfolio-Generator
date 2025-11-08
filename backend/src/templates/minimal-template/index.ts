import { TemplateConfig } from "../templateTypes";

const minimalTemplate: TemplateConfig = {
  id: "minimal-template",
  name: "Minimal Template",
  description: "A clean, simple personal portfolio design.",
  thumbnail: "/images/minimal-template.jpg",
  fields: [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "bio", label: "Short Bio", type: "textarea" },
    { name: "email", label: "Email", type: "email" },
    { name: "profilePicture", label: "Profile Picture", type: "file" }
  ],
  generateHTML: (data) => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.fullName}</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 2rem; }
          img { width: 100px; border-radius: 50%; }
        </style>
      </head>
      <body>
        <img src="${data.profilePicture}" alt="Profile" />
        <h1>${data.name}</h1>
        <p>${data.bio}</p>
        <a href="mailto:${data.email}">${data.email}</a>
        <footer>Made with ❤️ using OA-Portfolio-Generator</footer>
      </body>
    </html>
  `
};

export default minimalTemplate;
