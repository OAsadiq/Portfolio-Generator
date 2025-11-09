import { TemplateConfig } from "../templateTypes";

const professionalTemplate: TemplateConfig = {
  id: "professional-template",
  name: "Professional (Jakore-style)",
  description: "A dark, modern portfolio layout with hero, services and tech stack.",
  thumbnail: "/images/professional-template.png",
  fields: [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "role", label: "Role / Title", type: "text" },
    { name: "bio", label: "Short Bio", type: "textarea" },
    { name: "profilePicture", label: "Profile Picture (URL or uploaded file)", type: "text" },
    { name: "ctaText", label: "Primary CTA Text", type: "text" },
    { name: "ctaUrl", label: "Primary CTA URL", type: "text" },
    { name: "services", label: "Services (comma separated)", type: "text" },
    { name: "tools", label: "Tools (comma separated)", type: "text" },
    { name: "socials", label: "Social links (json string)", type: "text" },
  ],
  // generateHTML: receives data and returns full HTML string
  generateHTML: (data: any) => {
    // sanitize fallback values (very minimal)
    const name = data.fullName || "Your Name";
    const role = data.role || "Designer";
    const bio = data.bio || "Crafting seamless experiences and bold visuals.";
    const profile = data.profilePicture || "/images/default-avatar.png";
    const ctaText = data.ctaText || "Book a Design";
    const ctaUrl = data.ctaUrl || "#";
    const services = (data.services || "Illustration,Branding,Graphic Design,Printing").split(",").map((s: string) => s.trim());
    const tools = (data.tools || "CorelDRAW,Adobe Photoshop,Figma,Adobe Illustrator").split(",").map((t: string) => t.trim());
    let socials = [];
    try {
      socials = data.socials ? JSON.parse(data.socials) : [{ name: "instagram", url: "#" }, { name: "x", url: "#" }, { name: "whatsapp", url: "#" }];
    } catch (e) {
      socials = [{ name: "instagram", url: "#" }, { name: "x", url: "#" }, { name: "whatsapp", url: "#" }];
    }

    // minimal inline CSS to match the dark green theme (self-contained)
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${name} — ${role}</title>
  <style>
    :root{
      --bg:#000;
      --panel:#0b0b0b;
      --card:#1f1f1f;
      --muted:#9ca3af;
      --accent:#00d65b; /* bright green */
      --accent-dark:#06b84a;
      --white:#ffffff;
    }
    html,body{height:100%;margin:0;background:var(--bg);color:var(--white);font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;}
    .container{max-width:1100px;margin:0 auto;padding:48px 20px;}
    .nav { display:flex; justify-content:center; gap:16px; margin-bottom:40px; }
    .nav .pill{background:rgba(255,255,255,0.02); border-radius:12px;padding:10px 18px; border:1px solid rgba(255,255,255,0.06); box-shadow:0 6px 18px rgba(0,0,0,0.6); display:flex; gap:12px; align-items:center;}
    .hero{display:flex; flex-direction:column; align-items:center; gap:16px; text-align:center;}
    .avatar { width:180px; height:180px; border-radius:50%; border:6px solid #ff4d86; object-fit:cover; background:#fff; }
    h1{font-size:44px;margin:0; font-weight:800; letter-spacing:-0.02em;}
    h1 .accent{color:var(--accent);}
    .role{margin-top:6px;color:var(--accent); font-weight:600;}
    .bio{max-width:720px;color:var(--muted); margin-top:12px; line-height:1.6;}
    .cta-row{display:flex; gap:12px; margin-top:20px; align-items:center;}
    .btn { padding:12px 18px; border-radius:10px; font-weight:600; text-decoration:none; display:inline-block;}
    .btn-primary{background:var(--accent); color:#000;}
    .btn-outline{background:#fff; color:#000; opacity:0.95;}
    /* sections */
    section{margin-top:64px;}
    .cards{display:grid; grid-template-columns:repeat(4,1fr); gap:20px;}
    .card{background:var(--card); padding:28px; border-radius:14px; text-align:center; box-shadow:0 6px 20px rgba(0,0,0,0.5);}
    .card h3{margin:12px 0 6px;}
    .tools-grid{display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:18px;}
    .tool{background:var(--card); padding:22px; border-radius:12px; text-align:center;}
    footer{margin-top:60px;padding:24px;border-radius:12px;text-align:center;color:var(--muted); background:linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.2));}
    /* responsive */
    @media (max-width:900px){
      .cards,.tools-grid{grid-template-columns:repeat(2,1fr);}
      h1{font-size:32px;}
    }
    @media (max-width:520px){
      .cards,.tools-grid{grid-template-columns:1fr;}
      .avatar{width:140px;height:140px;}
    }
  </style>
</head>
<body>
  <div class="container">
    <nav class="nav" aria-label="primary">
      <div class="pill">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="opacity:0.9"><path d="M3 11.5L12 5l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8.5z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="opacity:0.9"><circle cx="12" cy="12" r="3" stroke="white" stroke-width="1.2"/></svg>
        <a href="${ctaUrl}" class="btn btn-outline" style="margin-left:6px">${ctaText}</a>
      </div>
    </nav>

    <header class="hero">
      <img class="avatar" src="${profile}" alt="${name}"/>
      <h1>Hey, I'm <span class="accent">${name}</span></h1>
      <div class="role">${role}</div>
      <p class="bio">${bio}</p>
      <div class="cta-row">
        <a class="btn btn-outline" href="${ctaUrl}">${ctaText}</a>
        <a class="btn btn-primary" href="${ctaUrl}">Available for new projects</a>
      </div>
    </header>

    <section aria-labelledby="services-heading">
      <h2 id="services-heading" style="text-align:center;font-size:32px;margin:0 0 18px">My <span style="color:var(--accent)">Services</span></h2>
      <div class="cards">
        ${services.map((s: string) => `<div class="card"><div style="font-size:28px;color:var(--accent)">✦</div><h3>${s}</h3><p style="color:var(--muted);margin-top:8px">Custom ${s.toLowerCase()} solutions for brands, social and print.</p></div>`).join("")}
      </div>
    </section>

    <section aria-labelledby="tools-heading">
      <h2 id="tools-heading" style="text-align:center;font-size:32px;margin:0 0 18px">Tools & <span style="color:var(--accent)">Tech Stack</span></h2>
      <div class="tools-grid">
        ${tools.map((t: string) => `<div class="tool"><div style="font-size:28px;color:var(--accent)">●</div><div style="margin-top:12px">${t}</div></div>`).join("")}
      </div>
    </section>

    <section aria-labelledby="contact-heading">
      <h2 id="contact-heading" style="text-align:center;font-size:32px;margin:24px 0 6px">Contact</h2>
      <p style="text-align:center;color:var(--muted)">Do you need work done urgently? Reach out on social.</p>
      <div style="display:flex;justify-content:center;gap:12px;margin-top:18px">
        ${socials.map((s: any) => `<a href="${s.url}" style="display:inline-block;padding:10px;border-radius:50%;background:var(--accent);color:#000;text-decoration:none;font-weight:700">${(s.name || '').charAt(0).toUpperCase()}</a>`).join("")}
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
