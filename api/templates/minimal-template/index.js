const minimalTemplate = {
    id: "minimal-template",
    name: "Minimal Template",
    description: "A clean, simple personal portfolio design.",
    thumbnail: "/images/minimal-template.jpg",
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
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/assets/OA-PG-logo.png" />
        <title>${data.fullName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: auto;
            padding: 1rem;
            background: #f5f5f5;
          }

          header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            background: #ffffff;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }

          img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
          }

          h1 {
            margin: 0;
            color: #333;
            font-size: 1.8rem;
          }

          section {
            margin-top: 1.5rem;
            background: #fff;
            padding: 1.2rem;
            border-radius: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          }

          footer {
            text-align: center;
            margin-top: 3rem;
            font-size: 12px;
            color: #777;
          }

          a {
            color: #0070f3;
            text-decoration: none;
          }

          .social-links {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-top: 0.5rem;
          }

          @media (max-width: 640px) {
            header {
              flex-direction: column;
              text-align: center;
            }

            h1 {
              font-size: 1.5rem;
            }
          }
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

export default minimalTemplate;
