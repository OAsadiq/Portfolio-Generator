const professionalTemplate = {
  id: "professional-template",
  name: "Professional Template",
  description: "A dark, modern portfolio layout with hero, services and tech stack.",
  thumbnail: "/images/professional-template.jpg",
  fields: [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "role", label: "Role / Title", type: "text" },
    { name: "bio", label: "Short Bio", type: "textarea" },
    { name: "profilePicture", label: "Profile Picture", type: "file" },
    { name: "ctaText", label: "Primary CTA Text", type: "text" },
    { name: "ctaUrl", label: "Primary CTA URL", type: "text" },
    { name: "services", label: "Services (comma separated)", type: "text" },
    { name: "tools", label: "Tools (comma separated)", type: "text" },
    { name: "socials", label: "Social links (Json string`{name: instagram, url: #}`)", type: "text" },
  ],
  // generateHTML: receives data and returns full HTML string
  generateHTML: (data) => {
    // sanitize fallback values (very minimal)
    const name = data.fullName || "Your Name";
    const role = data.role || "Designer";
    const bio = data.bio || "Crafting seamless experiences and bold visuals.";
    const profile = data.profilePicture || "/images/default-avatar.png";
    const ctaText = data.ctaText || "Book a Design";
    const ctaUrl = data.ctaUrl || "#";
    const services = (data.services || "Illustration,Branding,Graphic Design,Printing").split(",").map((s) => s.trim());
    const tools = (data.tools || "CorelDRAW,Adobe Photoshop,Figma,Adobe Illustrator").split(",").map((t) => t.trim());
    let socials = [];
    try {
      socials = data.socials ? JSON.parse(data.socials) : [{ name: "instagram", url: "#" }, { name: "x", url: "#" }, { name: "whatsapp", url: "#" }];
    } catch (e) {
      socials = [{ name: "instagram", url: "#" }, { name: "x", url: "#" }, { name: "whatsapp", url: "#" }];
    }

    return `<!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/assets/OA-PG-logo.png" />
        <title>${name} — ${role}</title>
        <style>
          :root {
            --bg: #ffffff;
            --panel: #f9fafb;
            --card: #f3f4f6;
            --muted: #6b7280;
            --accent: #2563eb; /* cool neutral blue */
            --accent-dark: #1e40af;
            --text: #111827;
            --border: #e5e7eb;
          }
          html, body {
            height: 100%;
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 48px 20px;
          }

          .nav {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 40px;
          }

          .nav .pill {
            background: var(--panel);
            border-radius: 12px;
            padding: 10px 18px;
            border: 1px solid var(--border);
            box-shadow: 0 6px 18px rgba(0,0,0,0.05);
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .hero {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            text-align: center;
          }

          .avatar {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            border: 6px solid var(--accent);
            object-fit: cover;
            background: #fff;
          }

          h1 {
            font-size: 44px;
            margin: 0;
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          h1 .accent {
            color: var(--accent);
          }

          .role {
            margin-top: 6px;
            color: var(--accent-dark);
            font-weight: 600;
          }

          .bio {
            max-width: 720px;
            color: var(--muted);
            margin-top: 12px;
            line-height: 1.6;
          }

          .cta-row {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            align-items: center;
          }

          .btn {
            padding: 12px 18px;
            border-radius: 10px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: all 0.2s ease;
          }

          .btn-primary {
            background: var(--accent);
            color: white;
          }

          .btn-primary:hover {
            background: var(--accent-dark);
          }

          .btn-outline {
            background: transparent;
            color: var(--accent);
            border: 2px solid var(--accent);
          }

          .btn-outline:hover {
            background: var(--accent);
            color: white;
          }

          section {
            margin-top: 64px;
          }

          .cards, .tools-grid {
            display: flex;
            gap: 20px;
            justify-content: center;
          }

          .card, .tool {
            display: block;
            background: var(--card);
            padding: 28px;
            border-radius: 14px;
            text-align: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            border: 1px solid var(--border);
          }

          .card h3 {
            margin: 12px 0 6px;
          }

          img {
            max-width: 100%;
            height: auto;
          }
          
          footer {
            margin-top: 60px;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            color: var(--muted);
            background: var(--panel);
            border-top: 1px solid var(--border);
          }

          @media (max-width:900px){
            .cards,.tools-grid{grid-template-columns:repeat(2,1fr);}
            h1{font-size:32px;}
          }
          @media (max-width:520px){
            .cards,.tools-grid{display:block;}
            .avatar{width:140px;height:140px;}
            .card,
            .tool {
              padding: 20px;
              margin-block: 20px;
            }
            .card h3 {
              font-size: 18px;
            }
          }

          @media (max-width: 640px) {
            .container {
              padding: 32px 16px;
            }

            .cta-row {
              flex-direction: column;
              width: 100%;
            }

            .cta-row .btn {
              width: 60%;
              text-align: center;
            }
          }
          
          @media (max-width: 480px) {
            h1 {
              font-size: 26px;
            }

            .bio {
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <nav class="nav" aria-label="primary">
            <div class="pill">
              <a href="/" class="btn btn-outline">${ctaText}</a>
            </div>
          </nav>

          <header class="hero">
            <img class="avatar" src="${profile}" alt="${name}" />
            <h1>Hey, I'm <span class="accent">${name}</span></h1>
            <div class="role">${role}</div>
            <p class="bio">${bio}</p>
            <div class="cta-row">
              <a class="btn btn-outline" href="${ctaUrl}">${ctaText}</a>
              <a class="btn btn-primary" href="${ctaUrl}">Available for new projects</a>
            </div>
          </header>

          <section aria-labelledby="services-heading">
            <h2 id="services-heading" style="text-align:center;font-size:32px;margin:0 0 18px">
              My <span style="color:var(--accent)">Services</span>
            </h2>
            <div class="cards">
              ${services.map((s) => `
                <div class="card">
                  <div style="font-size:28px;color:var(--accent)">✦</div>
                  <h3>${s}</h3>
                  <p style="color:var(--muted);margin-top:8px">
                    Custom ${s.toLowerCase()} solutions for brands and businesses.
                  </p>
                </div>
              `).join("")}
            </div>
          </section>

          <section aria-labelledby="tools-heading">
            <h2 id="tools-heading" style="text-align:center;font-size:32px;margin:0 0 18px">
              Tools & <span style="color:var(--accent)">Tech Stack</span>
            </h2>
            <div class="tools-grid">
              ${tools.map((t) => `
                <div class="tool">
                  <div style="font-size:28px;color:var(--accent)">●</div>
                  <div style="margin-top:12px">${t}</div>
                </div>
              `).join("")}
            </div>
          </section>

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" style="text-align:center;font-size:32px;margin:24px 0 6px">Contact</h2>
            <p style="text-align:center;color:var(--muted)">Let’s connect on social.</p>
            <div style="display:flex;justify-content:center;gap:12px;margin-top:18px">
              ${socials.map((s) => `
                <a href="${s.url}" style="display:inline-block;padding:10px 14px;border-radius:50%;background:var(--accent);color:white;text-decoration:none;font-weight:700">
                  ${(s.name || '').charAt(0).toUpperCase()}
                </a>
              `).join("")}
            </div>
          </section>

          <footer>
            Made with <strong>OA-Portfolio-Generator</strong>
          </footer>
        </div>
      </body>
      </html>`;
  },
};

export default professionalTemplate;
