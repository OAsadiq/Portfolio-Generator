import { cleanUrl } from '../_social.js';

const minimalTemplate = {
  id: "minimal-template",
  name: "Minimal Portfolio",
  description: "Clean, editorial portfolio for anyone — designers, developers, writers, consultants, and more.",
  thumbnail: "/images/minimal-template.jpg",
  fields: [
    // Hero
    { name: "fullName",      label: "Full Name",              type: "text",     required: true },
    { name: "role",          label: "Role / Title",           type: "text",     placeholder: "e.g. Product Designer, Software Engineer, Consultant" },
    { name: "bio",           label: "Short Bio",              type: "textarea", required: true },
    { name: "profileImage",  label: "Profile Photo",          type: "file" },
    { name: "location",      label: "Location (optional)",    type: "text",     placeholder: "e.g. Lagos, Nigeria" },

    // Projects
    { name: "sample1Title",       label: "Project 1 – Title",       type: "text" },
    { name: "sample1Type",        label: "Project 1 – Category",     type: "text",     placeholder: "e.g. Branding, Web Design, Writing" },
    { name: "sample1Description", label: "Project 1 – Description",  type: "textarea" },
    { name: "sample1Image",       label: "Project 1 – Cover Image",  type: "file" },
    { name: "sample1Link",        label: "Project 1 – URL",          type: "text" },

    { name: "sample2Title",       label: "Project 2 – Title",       type: "text" },
    { name: "sample2Type",        label: "Project 2 – Category",     type: "text" },
    { name: "sample2Description", label: "Project 2 – Description",  type: "textarea" },
    { name: "sample2Image",       label: "Project 2 – Cover Image",  type: "file" },
    { name: "sample2Link",        label: "Project 2 – URL",          type: "text" },

    { name: "sample3Title",       label: "Project 3 – Title",       type: "text" },
    { name: "sample3Type",        label: "Project 3 – Category",     type: "text" },
    { name: "sample3Description", label: "Project 3 – Description",  type: "textarea" },
    { name: "sample3Image",       label: "Project 3 – Cover Image",  type: "file" },
    { name: "sample3Link",        label: "Project 3 – URL",          type: "text" },

    // Services
    { name: "service1", label: "Service 1", type: "text", placeholder: "e.g. Brand Strategy" },
    { name: "service2", label: "Service 2", type: "text" },
    { name: "service3", label: "Service 3", type: "text" },
    { name: "service4", label: "Service 4", type: "text" },
    { name: "service5", label: "Service 5", type: "text" },
    { name: "service6", label: "Service 6", type: "text" },

    // Testimonials
    { name: "testimonial1",       label: "Testimonial 1",            type: "textarea" },
    { name: "testimonial1Author", label: "Testimonial 1 – Name",     type: "text",  placeholder: "e.g. Sarah Chen" },
    { name: "testimonial1Role",   label: "Testimonial 1 – Role",     type: "text",  placeholder: "e.g. CPO, TechCorp" },

    { name: "testimonial2",       label: "Testimonial 2",            type: "textarea" },
    { name: "testimonial2Author", label: "Testimonial 2 – Name",     type: "text" },
    { name: "testimonial2Role",   label: "Testimonial 2 – Role",     type: "text" },

    // Contact
    { name: "email",    label: "Email Address",        type: "email", required: true },
    { name: "linkedin", label: "LinkedIn URL",          type: "text" },
    { name: "twitter",  label: "Twitter / X URL",       type: "text" },
    { name: "website",  label: "Website URL (optional)", type: "text" },
  ],
  
  generateHTML: (data) => {
    const name = data.fullName || "Your Name";
    const role = data.role || data.writerType || "Freelance Professional";
    const bio = data.bio || "I build things people love.";
    const profile = data.profileImage || data.profilePicture || "";
    const email = data.email || "";

    // Build projects list
    let samplesHTML = "";
    let projectCount = 0;
    for (let i = 1; i <= 3; i++) {
      const title = data[`sample${i}Title`];
      const desc = data[`sample${i}Description`];
      const link = data[`sample${i}Link`];
      const type = data[`sample${i}Type`];
      const image = data[`sample${i}Image`];
      if (title) {
        projectCount++;
        const num = String(projectCount).padStart(2, "0");
        const inner = `
          <span class="sample-num">${image
            ? `<img src="${image}" alt="${title}" class="project-thumb" />`
            : num
          }</span>
          <div class="sample-body">
            <div class="sample-title-row">
              <h3 class="sample-title">${title}</h3>
              ${type ? `<span class="sample-category">${type}</span>` : ""}
            </div>
            ${desc ? `<p class="sample-desc">${desc}</p>` : ""}
          </div>
          <span class="sample-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </span>
        `;
        samplesHTML += link
          ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="sample-row">${inner}</a>`
          : `<div class="sample-row sample-row--no-link">${inner}</div>`;
      }
    }

    // Build services
    const services = [1, 2, 3, 4, 5, 6]
      .map(n => data[`service${n}`])
      .filter(Boolean);
    const servicesHTML = services.length
      ? services.map(s => `<span class="service-tag">${s}</span>`).join("")
      : "";

    // Build testimonials
    let testimonialsHTML = "";
    for (let i = 1; i <= 2; i++) {
      const testimonial = data[`testimonial${i}`];
      const author = data[`testimonial${i}Author`];
      const testimonialRole = data[`testimonial${i}Role`];
      if (testimonial && author) {
        testimonialsHTML += `
          <figure class="testimonial">
            <blockquote>"${testimonial}"</blockquote>
            <figcaption>
              <strong>${author}</strong>
              ${testimonialRole ? `<span>${testimonialRole}</span>` : ""}
            </figcaption>
          </figure>
        `;
      }
    }

    const profileImgHTML = profile
      ? `<img src="${profile}" alt="${name}" class="profile-img" />`
      : `<div class="profile-initials">${name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}</div>`;

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23ea580c'/%3E%3Crect x='6' y='7' width='7' height='26' rx='1.5' fill='white' transform='rotate(-8 9.5 20)'/%3E%3Crect x='19' y='7' width='7' height='19' rx='1.5' fill='white' transform='rotate(-8 22.5 16.5)'/%3E%3Crect x='6' y='7' width='20' height='7' rx='1.5' fill='white' transform='rotate(-8 16 10.5)'/%3E%3Crect x='6' y='17' width='15' height='6' rx='1.5' fill='white' transform='rotate(-8 13.5 20)'/%3E%3C/svg%3E" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <title>${name} — ${role}</title>
        <meta name="description" content="${bio}" />
        <meta name="author" content="${name}" />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="${name} — ${role}" />
        <meta property="og:description" content="${bio}" />
        ${profile ? `<meta property="og:image" content="${profile}" />` : ""}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="${name} — ${role}" />
        <meta name="twitter:description" content="${bio}" />
        <meta name="robots" content="index, follow" />
        <style>
          *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

          :root {
            --ink:        #111827;
            --ink-2:      #374151;
            --ink-3:      #6b7280;
            --ink-4:      #9ca3af;
            --surface:    #ffffff;
            --bg:         #fafaf9;
            --rule:       #e5e7eb;
            --serif:      'Playfair Display', Georgia, serif;
            --sans:       'Inter', system-ui, sans-serif;
          }

          html { scroll-behavior: smooth; }

          body {
            font-family: var(--sans);
            background: var(--bg);
            color: var(--ink);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }

          /* ── Nav ──────────────────────────────────── */
          nav {
            position: sticky;
            top: 0;
            z-index: 10;
            background: rgba(250,250,249,0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-bottom: 1px solid var(--rule);
          }

          .nav-inner {
            max-width: 760px;
            margin: 0 auto;
            padding: 0 1.5rem;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .nav-name {
            font-family: var(--serif);
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--ink);
            text-decoration: none;
          }

          .nav-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            background: var(--ink);
            color: #fff;
            font-size: 0.8125rem;
            font-weight: 600;
            padding: 0.4375rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            transition: background 0.15s;
          }

          .nav-cta:hover { background: var(--ink-2); }

          /* ── Layout ───────────────────────────────── */
          .page {
            max-width: 760px;
            margin: 0 auto;
            padding: 0 1.5rem 5rem;
          }

          /* ── Hero ─────────────────────────────────── */
          .hero {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 2.5rem;
            align-items: start;
            padding: 4rem 0 3.5rem;
            border-bottom: 1px solid var(--rule);
          }

          .hero-text {}

          .hero-type {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8125rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--ink-3);
            margin-bottom: 1.25rem;
          }

          .hero-type::before {
            content: '';
            display: inline-block;
            width: 20px;
            height: 2px;
            background: var(--ink-4);
            border-radius: 1px;
          }

          h1 {
            font-family: var(--serif);
            font-size: clamp(2.25rem, 5vw, 3.25rem);
            font-weight: 800;
            line-height: 1.1;
            letter-spacing: -0.02em;
            color: var(--ink);
            margin-bottom: 1.25rem;
          }

          .hero-location {
            display: inline-flex;
            align-items: center;
            gap: 0.3125rem;
            font-size: 0.875rem;
            color: var(--ink-4);
            margin-bottom: 0.875rem;
          }

          .bio {
            font-size: 1.0625rem;
            color: var(--ink-2);
            line-height: 1.75;
            max-width: 480px;
            margin-bottom: 2rem;
          }

          .hero-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--ink);
            color: #fff;
            font-size: 0.9375rem;
            font-weight: 600;
            padding: 0.6875rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            transition: background 0.15s, transform 0.15s;
          }

          .btn-primary:hover { background: #1f2937; transform: translateY(-1px); }

          .social-list {
            display: flex;
            gap: 0.5rem;
          }

          .social-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border: 1px solid var(--rule);
            border-radius: 8px;
            color: var(--ink-3);
            text-decoration: none;
            transition: border-color 0.15s, color 0.15s, background 0.15s;
          }

          .social-icon:hover {
            border-color: var(--ink-3);
            color: var(--ink);
            background: var(--surface);
          }

          /* Profile image */
          .hero-media { flex-shrink: 0; padding-top: 0.5rem; }

          .profile-img {
            width: 148px;
            height: 148px;
            border-radius: 16px;
            object-fit: cover;
            display: block;
            border: 1px solid var(--rule);
          }

          .profile-initials {
            width: 148px;
            height: 148px;
            border-radius: 16px;
            background: #f3f4f6;
            border: 1px solid var(--rule);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--serif);
            font-size: 2rem;
            font-weight: 700;
            color: var(--ink-3);
          }

          /* ── Section chrome ───────────────────────── */
          .section { padding: 3.5rem 0; border-bottom: 1px solid var(--rule); }
          .section:last-of-type { border-bottom: none; }

          .section-label {
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--ink-4);
            margin-bottom: 2rem;
          }

          /* ── Writing Samples ──────────────────────── */
          .samples-list { display: flex; flex-direction: column; }

          .sample-row {
            display: grid;
            grid-template-columns: 2.5rem 1fr 2rem;
            gap: 1.25rem;
            align-items: start;
            padding: 1.5rem 0;
            border-bottom: 1px solid var(--rule);
            text-decoration: none;
            color: inherit;
            border-radius: 4px;
          }

          .sample-row:first-child { padding-top: 0; }
          .sample-row:last-child { border-bottom: none; padding-bottom: 0; }

          a.sample-row:hover .sample-title { color: var(--accent); }
          a.sample-row:hover .sample-arrow { color: var(--accent); transform: translate(2px, -2px); }
          .sample-row--no-link .sample-arrow { display: none; }

          .sample-num {
            font-family: var(--serif);
            font-size: 0.9375rem;
            font-weight: 700;
            color: var(--ink-4);
            padding-top: 0.125rem;
          }

          .project-thumb {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid var(--rule);
            display: block;
          }

          .sample-body {}

          .sample-title-row {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            flex-wrap: wrap;
            margin-bottom: 0.375rem;
          }

          .sample-title {
            font-family: var(--serif);
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1.3;
            color: var(--ink);
            transition: color 0.15s;
          }

          .sample-category {
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            color: var(--ink-3);
            background: #f3f4f6;
            border: 1px solid var(--rule);
            padding: 0.1875rem 0.625rem;
            border-radius: 999px;
            white-space: nowrap;
          }

          .sample-desc {
            font-size: 0.9375rem;
            color: var(--ink-3);
            line-height: 1.6;
          }

          .sample-arrow {
            color: var(--ink-4);
            padding-top: 0.125rem;
            transition: color 0.15s, transform 0.15s;
          }

          /* ── Services ─────────────────────────────────── */
          .services-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 0.625rem;
          }

          .service-tag {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--ink-2);
            background: var(--surface);
            border: 1px solid var(--rule);
            padding: 0.4375rem 1rem;
            border-radius: 999px;
          }

          /* ── Testimonials ─────────────────────────── */
          .testimonials-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }

          .testimonial {
            background: var(--surface);
            border: 1px solid var(--rule);
            border-radius: 12px;
            padding: 1.75rem;
          }

          .testimonial blockquote {
            font-size: 1rem;
            line-height: 1.75;
            color: var(--ink-2);
            font-style: italic;
            margin-bottom: 1.25rem;
            position: relative;
          }

          .testimonial blockquote::before {
            content: '\\201C';
            font-family: var(--serif);
            font-size: 3.5rem;
            line-height: 0;
            color: var(--rule);
            position: absolute;
            top: 0.75rem;
            left: -0.5rem;
          }

          .testimonial figcaption {
            font-size: 0.875rem;
            padding-left: 0.25rem;
          }

          .testimonial figcaption strong {
            font-weight: 600;
            color: var(--ink-2);
            display: block;
          }

          .testimonial figcaption span {
            font-size: 0.8125rem;
            color: var(--ink-4);
          }

          /* ── Contact ──────────────────────────────── */
          .contact-wrap {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: start;
          }

          .contact-intro h2 {
            font-family: var(--serif);
            font-size: 2rem;
            font-weight: 800;
            line-height: 1.2;
            color: var(--ink);
            margin-bottom: 0.875rem;
          }

          .contact-intro p {
            font-size: 1rem;
            color: var(--ink-3);
            line-height: 1.7;
            margin-bottom: 1.5rem;
          }

          .email-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--ink);
            text-decoration: none;
          }

          .email-link:hover { text-decoration: underline; }

          .contact-form {
            display: flex;
            flex-direction: column;
            gap: 0.875rem;
          }

          .contact-form input,
          .contact-form textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--rule);
            border-radius: 8px;
            background: var(--surface);
            color: var(--ink);
            font-size: 0.9375rem;
            font-family: var(--sans);
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
          }

          .contact-form input:focus,
          .contact-form textarea:focus {
            border-color: var(--ink-3);
            box-shadow: 0 0 0 3px rgba(17,24,39,0.06);
          }

          .contact-form textarea { resize: vertical; min-height: 120px; }

          .contact-form button {
            padding: 0.75rem 1.5rem;
            background: var(--ink);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            font-family: var(--sans);
            cursor: pointer;
            transition: background 0.15s, transform 0.15s;
            align-self: flex-start;
          }

          .contact-form button:hover:not(:disabled) { background: #1f2937; transform: translateY(-1px); }
          .contact-form button:disabled { opacity: 0.5; cursor: not-allowed; }

          .form-msg {
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            display: none;
          }

          .form-msg.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; display: block; }
          .form-msg.error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; display: block; }

          /* ── Footer ───────────────────────────────── */
          footer {
            padding: 2.5rem 1.5rem;
            max-width: 760px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid var(--rule);
            font-size: 0.8125rem;
            color: var(--ink-4);
          }

          footer a { color: var(--ink-4); text-decoration: none; }
          footer a:hover { color: var(--ink-3); }

          /* ── Animations ───────────────────────────── */
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .fade-up { animation: fadeUp 0.5s ease-out both; }
          .fade-up-1 { animation-delay: 0.05s; }
          .fade-up-2 { animation-delay: 0.1s; }
          .fade-up-3 { animation-delay: 0.15s; }

          /* ── Responsive ───────────────────────────── */
          @media (max-width: 640px) {
            .hero { grid-template-columns: 1fr; }
            .hero-media { display: flex; }
            .profile-img, .profile-initials { width: 104px; height: 104px; border-radius: 50%; font-size: 1.75rem; }
            .testimonials-grid { grid-template-columns: 1fr; }
            .contact-wrap { grid-template-columns: 1fr; gap: 2rem; }
            .sample-row { grid-template-columns: 2rem 1fr 1.5rem; gap: 0.875rem; }
            .sample-title { font-size: 1.0625rem; }
          }
        </style>
      </head>
      <body>

        <nav>
          <div class="nav-inner">
            <a href="#" class="nav-name">${name}</a>
            ${email ? `<a href="mailto:${email}" class="nav-cta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              Hire me
            </a>` : ""}
          </div>
        </nav>

        <div class="page">

          <!-- Hero -->
          <section class="hero">
            <div class="hero-text fade-up">
              <p class="hero-type">${role}</p>
              <h1>${name}</h1>
              ${data.location ? `<p class="hero-location"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${data.location}</p>` : ""}
              <p class="bio">${bio}</p>
              <div class="hero-actions">
                ${email ? `<a href="mailto:${email}" class="btn-primary">
                  Get in touch
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>` : ""}
                ${cleanUrl(data.linkedin) || cleanUrl(data.twitter) ? `
                  <div class="social-list">
                    ${cleanUrl(data.linkedin) ? `
                      <a href="${cleanUrl(data.linkedin)}" target="_blank" rel="noopener" class="social-icon" aria-label="LinkedIn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>` : ""}
                    ${cleanUrl(data.twitter) ? `
                      <a href="${cleanUrl(data.twitter)}" target="_blank" rel="noopener" class="social-icon" aria-label="Twitter / X">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>` : ""}
                  </div>
                ` : ""}
              </div>
            </div>
            <div class="hero-media fade-up fade-up-2">
              ${profileImgHTML}
            </div>
          </section>

          <!-- Writing Samples -->
          <section class="section">
            <p class="section-label">Selected Work</p>
            <div class="samples-list">
              ${samplesHTML || '<p style="color:var(--ink-4);font-size:0.9375rem;">No samples added yet.</p>'}
            </div>
          </section>

          <!-- Services -->
          ${servicesHTML ? `
            <section class="section">
              <p class="section-label">Services</p>
              <div class="services-wrap">
                ${servicesHTML}
              </div>
            </section>
          ` : ""}

          <!-- Testimonials -->
          ${testimonialsHTML ? `
            <section class="section">
              <p class="section-label">Kind Words</p>
              <div class="testimonials-grid">
                ${testimonialsHTML}
              </div>
            </section>
          ` : ""}

          <!-- Contact -->
          ${email ? `
            <section class="section">
              <div class="contact-wrap">
                <div class="contact-intro">
                  <h2>Let's work together.</h2>
                  <p>Have a project in mind? I'd love to hear about it. Send me a message and I'll get back to you within 24 hours.</p>
                  <a href="mailto:${email}" class="email-link">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    ${email}
                  </a>
                </div>
                <form class="contact-form" id="contactForm">
                  <input type="text" name="senderName" placeholder="Your name" required />
                  <input type="email" name="senderEmail" placeholder="Your email" required />
                  <textarea name="message" placeholder="Tell me about your project..." required></textarea>
                  <input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden" />
                  <button type="submit" id="submitBtn">Send message</button>
                  <div class="form-msg" id="formMsg"></div>
                </form>
              </div>
            </section>
          ` : ""}

        </div>

        <footer>
          <span>${name}</span>
          <a href="https://porfilr.com" target="_blank" rel="noopener">Made with Porfilr</a>
        </footer>

        <script>
          const form = document.getElementById('contactForm');
          if (form) {
            form.addEventListener('submit', async function(e) {
              e.preventDefault();
              const btn = document.getElementById('submitBtn');
              const msg = document.getElementById('formMsg');
              const fd = new FormData(this);
              btn.disabled = true;
              btn.textContent = 'Sending…';
              msg.className = 'form-msg';
              try {
                const res = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ownerEmail: '${email}',
                    portfolioName: '${name}',
                    senderName: fd.get('senderName'),
                    senderEmail: fd.get('senderEmail'),
                    message: fd.get('message'),
                    company: fd.get('company'),
                  })
                });
                const data = await res.json();
                if (data.success) {
                  msg.textContent = 'Message sent — I\\'ll be in touch soon.';
                  msg.className = 'form-msg success';
                  this.reset();
                } else {
                  msg.textContent = data.error || 'Something went wrong. Please try again.';
                  msg.className = 'form-msg error';
                }
              } catch {
                msg.textContent = 'Something went wrong. Please try again.';
                msg.className = 'form-msg error';
              } finally {
                btn.disabled = false;
                btn.textContent = 'Send message';
              }
            });
          }
        </script>
      </body>
    </html>
    `;
  }
};

export default minimalTemplate;