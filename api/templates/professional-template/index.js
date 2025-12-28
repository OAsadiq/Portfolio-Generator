const professionalWriterTemplate = {
  id: "professional-writer-template",
  name: "Professional Writer",
  description: "Modern, multi-section portfolio for established freelance writers.",
  thumbnail: "/images/professional-template.jpg",
  fields: [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "headline", label: "Professional Headline", type: "text", placeholder: "e.g., B2B Content Writer | SaaS Specialist", required: true },
    { name: "bio", label: "About You (3-4 sentences)", type: "textarea", required: true },
    { name: "profilePicture", label: "Profile Picture", type: "file" },
    
    // Specialties
    { name: "specialty1", label: "Specialty 1", type: "text", placeholder: "e.g., SEO Blog Posts" },
    { name: "specialty2", label: "Specialty 2", type: "text", placeholder: "e.g., Email Campaigns" },
    { name: "specialty3", label: "Specialty 3", type: "text", placeholder: "e.g., Case Studies" },
    
    // Writing Samples
    { name: "sample1Title", label: "Writing Sample 1 - Title", type: "text", required: true },
    { name: "sample1Type", label: "Sample 1 - Type", type: "text", placeholder: "Blog Post, Article, Case Study, etc." },
    { name: "sample1Description", label: "Sample 1 - Description", type: "textarea" },
    { name: "sample1Link", label: "Sample 1 - Link", type: "text", required: true },
    
    { name: "sample2Title", label: "Writing Sample 2 - Title", type: "text" },
    { name: "sample2Type", label: "Sample 2 - Type", type: "text" },
    { name: "sample2Description", label: "Sample 2 - Description", type: "textarea" },
    { name: "sample2Link", label: "Sample 2 - Link", type: "text" },
    
    { name: "sample3Title", label: "Writing Sample 3 - Title", type: "text" },
    { name: "sample3Type", label: "Sample 3 - Type", type: "text" },
    { name: "sample3Description", label: "Sample 3 - Description", type: "textarea" },
    { name: "sample3Link", label: "Sample 3 - Link", type: "text" },
    
    { name: "sample4Title", label: "Writing Sample 4 - Title", type: "text" },
    { name: "sample4Type", label: "Sample 4 - Type", type: "text" },
    { name: "sample4Description", label: "Sample 4 - Description", type: "textarea" },
    { name: "sample4Link", label: "Sample 4 - Link", type: "text" },
    
    // Testimonials
    { name: "testimonial1", label: "Client Testimonial 1", type: "textarea" },
    { name: "testimonial1Author", label: "Client 1 Name", type: "text" },
    { name: "testimonial1Role", label: "Client 1 Role/Company", type: "text" },
    
    { name: "testimonial2", label: "Client Testimonial 2", type: "textarea" },
    { name: "testimonial2Author", label: "Client 2 Name", type: "text" },
    { name: "testimonial2Role", label: "Client 2 Role/Company", type: "text" },
    
    { name: "testimonial3", label: "Client Testimonial 3", type: "textarea" },
    { name: "testimonial3Author", label: "Client 3 Name", type: "text" },
    { name: "testimonial3Role", label: "Client 3 Role/Company", type: "text" },
    
    // Contact
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "linkedin", label: "LinkedIn URL", type: "text" },
    { name: "twitter", label: "Twitter/X URL", type: "text" },
    { name: "website", label: "Personal Website (Optional)", type: "text" },
  ],
  
  generateHTML: (data) => {
    const name = data.fullName || "Your Name";
    const headline = data.headline || "Freelance Writer";
    const bio = data.bio || "Crafting compelling content for brands and businesses.";
    const profile = data.profilePicture || "/images/default-avatar.png";
    const email = data.email || "";
    
    // Build specialties
    let specialtiesHTML = "";
    for (let i = 1; i <= 3; i++) {
      const specialty = data[`specialty${i}`];
      if (specialty) {
        specialtiesHTML += `
          <div class="specialty-pill">
            <span class="specialty-icon">✍️</span>
            ${specialty}
          </div>
        `;
      }
    }
    
    // Build writing samples
    let samplesHTML = "";
    for (let i = 1; i <= 4; i++) {
      const title = data[`sample${i}Title`];
      const type = data[`sample${i}Type`];
      const desc = data[`sample${i}Description`];
      const link = data[`sample${i}Link`];
      
      if (title && link) {
        samplesHTML += `
          <article class="sample-card">
            ${type ? `<span class="sample-type">${type}</span>` : ""}
            <h3 class="sample-title">${title}</h3>
            ${desc ? `<p class="sample-description">${desc}</p>` : ""}
            <a href="${link}" target="_blank" class="sample-cta">
              Read Full Article
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </article>
        `;
      }
    }
    
    // Build testimonials
    let testimonialsHTML = "";
    for (let i = 1; i <= 3; i++) {
      const testimonial = data[`testimonial${i}`];
      const author = data[`testimonial${i}Author`];
      const role = data[`testimonial${i}Role`];
      
      if (testimonial && author) {
        testimonialsHTML += `
          <div class="testimonial-card">
            <div class="quote-icon">"</div>
            <p class="testimonial-text">${testimonial}</p>
            <div class="testimonial-author">
              <strong>${author}</strong>
              ${role ? `<span class="testimonial-role">${role}</span>` : ""}
            </div>
          </div>
        `;
      }
    }
    
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/assets/OA-PG-logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <title>${name} - ${headline}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --text: #1e293b;
            --text-light: #64748b;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --border: #e2e8f0;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 1.5rem;
          }

          /* Header/Hero Section */
          .hero {
            padding: 5rem 0 4rem;
            text-align: center;
          }

          .profile-image {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 2rem;
            border: 4px solid var(--primary);
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
          }

          h1 {
            font-size: 3rem;
            font-weight: 800;
            color: var(--text);
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
          }

          .headline {
            font-size: 1.25rem;
            color: var(--primary);
            font-weight: 600;
            margin-bottom: 1.5rem;
          }

          .bio {
            font-size: 1.125rem;
            color: var(--text-light);
            max-width: 700px;
            margin: 0 auto 2rem;
            line-height: 1.7;
          }

          .social-links {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-bottom: 2rem;
          }

          .social-link {
            padding: 0.75rem 1.5rem;
            background: var(--card-bg);
            border: 2px solid var(--border);
            border-radius: 8px;
            text-decoration: none;
            color: var(--text);
            font-weight: 500;
            transition: all 0.2s;
          }

          .social-link:hover {
            border-color: var(--primary);
            color: var(--primary);
            transform: translateY(-2px);
          }

          .cta-button {
            display: inline-block;
            padding: 1rem 2.5rem;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1.125rem;
            transition: all 0.3s;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
          }

          .cta-button:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          }

          /* Specialties Section */
          .specialties {
            padding: 3rem 0;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
          }

          .specialties-grid {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            max-width: 800px;
            margin: 0 auto;
          }

          .specialty-pill {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: var(--card-bg);
            border: 2px solid var(--border);
            border-radius: 50px;
            font-weight: 500;
            color: var(--text);
          }

          .specialty-icon {
            font-size: 1.25rem;
          }

          /* Section Headers */
          .section {
            padding: 4rem 0;
          }

          .section-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .section-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--text);
            margin-bottom: 0.5rem;
          }

          .section-subtitle {
            font-size: 1.125rem;
            color: var(--text-light);
          }

          /* Writing Samples */
          .samples-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
          }

          .sample-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 2rem;
            transition: all 0.3s;
          }

          .sample-card:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            transform: translateY(-4px);
            border-color: var(--primary);
          }

          .sample-type {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #eff6ff;
            color: var(--primary);
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .sample-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 1rem;
            line-height: 1.3;
          }

          .sample-description {
            color: var(--text-light);
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }

          .sample-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            transition: gap 0.2s;
          }

          .sample-cta:hover {
            gap: 0.75rem;
          }

          /* Testimonials */
          .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
          }

          .testimonial-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 2rem;
            position: relative;
          }

          .quote-icon {
            font-size: 4rem;
            color: var(--primary);
            opacity: 0.2;
            position: absolute;
            top: 1rem;
            left: 1.5rem;
          }

          .testimonial-text {
            position: relative;
            z-index: 1;
            font-size: 1.125rem;
            color: var(--text);
            line-height: 1.7;
            margin-bottom: 1.5rem;
            font-style: italic;
          }

          .testimonial-author {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .testimonial-author strong {
            color: var(--text);
            font-weight: 600;
          }

          .testimonial-role {
            color: var(--text-light);
            font-size: 0.875rem;
          }

          /* Contact Section */
          .contact-section {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            padding: 4rem 2rem;
            border-radius: 20px;
            text-align: center;
            color: white;
          }

          .contact-section h2 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
          }

          .contact-section p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
          }

          .contact-button {
            display: inline-block;
            padding: 1rem 3rem;
            background: white;
            color: var(--primary);
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1.125rem;
            transition: all 0.3s;
          }

          .contact-button:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
          }

          /* Footer */
          footer {
            padding: 3rem 0;
            text-align: center;
            color: var(--text-light);
            font-size: 0.875rem;
          }

          footer a {
            color: var(--primary);
            text-decoration: none;
          }

          footer a:hover {
            text-decoration: underline;
          }

          /* Responsive */
          @media (max-width: 768px) {
            h1 {
              font-size: 2rem;
            }

            .section-title {
              font-size: 1.875rem;
            }

            .hero {
              padding: 3rem 0 2rem;
            }

            .samples-grid,
            .testimonials-grid {
              grid-template-columns: 1fr;
            }

            .contact-section {
              padding: 3rem 1.5rem;
            }

            .contact-section h2 {
              font-size: 1.875rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Hero Section -->
          <section class="hero">
            <img src="${profile}" alt="${name}" class="profile-image" />
            <h1>${name}</h1>
            <p class="headline">${headline}</p>
            <p class="bio">${bio}</p>
            
            ${data.linkedin || data.twitter || data.website ? `
              <div class="social-links">
                ${data.linkedin ? `<a href="${data.linkedin}" target="_blank" class="social-link">LinkedIn</a>` : ''}
                ${data.twitter ? `<a href="${data.twitter}" target="_blank" class="social-link">Twitter</a>` : ''}
                ${data.website ? `<a href="${data.website}" target="_blank" class="social-link">Website</a>` : ''}
              </div>
            ` : ''}
            
            <a href="mailto:${email}" class="cta-button">Let's Work Together</a>
          </section>

          <!-- Specialties -->
          ${specialtiesHTML ? `
            <section class="specialties">
              <div class="specialties-grid">
                ${specialtiesHTML}
              </div>
            </section>
          ` : ''}

          <!-- Writing Samples -->
          <section class="section">
            <div class="section-header">
              <h2 class="section-title">Featured Work</h2>
              <p class="section-subtitle">A selection of my best writing</p>
            </div>
            <div class="samples-grid">
              ${samplesHTML || '<p style="text-align:center;color:var(--text-light);">No samples added yet.</p>'}
            </div>
          </section>

          <!-- Testimonials -->
          ${testimonialsHTML ? `
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">Client Testimonials</h2>
                <p class="section-subtitle">What people say about working with me</p>
              </div>
              <div class="testimonials-grid">
                ${testimonialsHTML}
              </div>
            </section>
          ` : ''}

          <!-- Contact CTA -->
          <section class="section">
            <div class="contact-section">
              <h2>Ready to Get Started?</h2>
              <p>Let's discuss how I can help with your content needs.</p>
              <a href="mailto:${email}" class="contact-button">Send Me an Email</a>
            </div>
          </section>
        </div>

        <footer>
          <p>Built with <a href="https://foliobase.vercel.app" target="_blank">OA-Portfolio-Generator</a></p>
        </footer>
      </body>
    </html>
    `;
  }
};

export default professionalWriterTemplate;