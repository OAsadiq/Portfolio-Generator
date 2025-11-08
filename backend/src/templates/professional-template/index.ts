import { TemplateConfig } from "../templateTypes";

const professionalTemplate: TemplateConfig = {
  id: "professional-template",
  name: "Professional Template",
  description: "A modern professional portfolio with work experience and social links.",
  thumbnail: "/images/professional-template.jpg",
  fields: [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "bio", label: "Short Bio", type: "textarea" },
    { name: "email", label: "Email", type: "email" },
    { name: "profilePicture", label: "Profile Picture", type: "file" },
    { name: "linkedin", label: "LinkedIn URL", type: "text" },
    { name: "github", label: "GitHub URL", type: "text" },
    { name: "experience1", label: "Work Experience 1", type: "textarea" },
    { name: "experience2", label: "Work Experience 2", type: "textarea" },
  ],
  generateHTML: (data) => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.fullName}</title>
        <style>
          body { font-family: Arial; max-width: 800px; margin: auto; padding: 2rem; background: #f5f5f5; }
          header { display: flex; align-items: center; gap: 2rem; background: #ffffff; padding: 1rem; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
          img { width: 150px; border-radius: 50%; }
          h1 { margin: 0; color: #333; }
          section { margin-top: 2rem; background: #fff; padding: 1rem 2rem; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
          footer { text-align: center; margin-top: 3rem; font-size: 12px; color: #777; }
          a { color: #0070f3; text-decoration: none; }
          .social-links { display: flex; gap: 1rem; margin-top: 0.5rem; }
        </style>
      </head>
      <body>
        <header>
          <img src="${data.profilePicture}" alt="Profile Picture" />
          <div>
            <h1>${data.fullName}</h1>
            <div class="social-links">
              ${data.linkedin ? `<a href="${data.linkedin}" target="_blank">LinkedIn</a>` : ""}
              ${data.github ? `<a href="${data.github}" target="_blank">GitHub</a>` : ""}
            </div>
          </div>
        </header>

        <section>
          <h2>About Me</h2>
          <p>${data.bio}</p>
        </section>

        <section>
          <h2>Work Experience</h2>
          <ul>
            ${data.experience1 ? `<li>${data.experience1}</li>` : ""}
            ${data.experience2 ? `<li>${data.experience2}</li>` : ""}
          </ul>
        </section>

        <footer>Made with ❤️ using OA-Portfolio-Generator</footer>
      </body>
    </html>
  `
};

export default professionalTemplate;
