const minimalTemplate = {
  id: "minimal-template",
  name: "Minimal Writer",
  description: "Clean, professional portfolio perfect for freelance writers and copywriters.",
  thumbnail: "/images/minimal-template.jpg",
  fields: [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "writerType", label: "What type of writer are you?", type: "text", placeholder: "e.g., Copywriter, Content Writer, Technical Writer" },
    { name: "bio", label: "Professional Bio (2-3 sentences)", type: "textarea", required: true },
    { name: "profilePicture", label: "Profile Picture", type: "file" },
    
    // Writing Samples
    { name: "sample1Title", label: "Writing Sample 1 - Title", type: "text", required: true },
    { name: "sample1Description", label: "Sample 1 - Brief Description", type: "textarea" },
    { name: "sample1Link", label: "Sample 1 - Link to Published Work", type: "text", required: true },
    
    { name: "sample2Title", label: "Writing Sample 2 - Title", type: "text" },
    { name: "sample2Description", label: "Sample 2 - Brief Description", type: "textarea" },
    { name: "sample2Link", label: "Sample 2 - Link to Published Work", type: "text" },
    
    { name: "sample3Title", label: "Writing Sample 3 - Title", type: "text" },
    { name: "sample3Description", label: "Sample 3 - Brief Description", type: "textarea" },
    { name: "sample3Link", label: "Sample 3 - Link to Published Work", type: "text" },
    
    // Testimonials
    { name: "testimonial1", label: "Client Testimonial 1 (Optional)", type: "textarea" },
    { name: "testimonial1Author", label: "Client 1 - Name & Company", type: "text", placeholder: "e.g., Sarah Chen, TechCorp" },
    
    { name: "testimonial2", label: "Client Testimonial 2 (Optional)", type: "textarea" },
    { name: "testimonial2Author", label: "Client 2 - Name & Company", type: "text" },
    
    // Contact
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "linkedin", label: "LinkedIn URL (Optional)", type: "text" },
    { name: "twitter", label: "Twitter/X URL (Optional)", type: "text" },
  ],
  
  generateHTML: (data) => {
    const name = data.fullName || "Your Name";
    const writerType = data.writerType || "Freelance Writer";
    const bio = data.bio || "Professional writer crafting compelling content.";
    const profile = data.profilePicture || "/images/default-avatar.png";
    const email = data.email || "";
    
    // Build writing samples section
    let samplesHTML = "";
    for (let i = 1; i <= 3; i++) {
      const title = data[`sample${i}Title`];
      const desc = data[`sample${i}Description`];
      const link = data[`sample${i}Link`];
      
      if (title && link) {
        samplesHTML += `
          <div class="sample-card" data-aos="fade-up" data-aos-delay="${i * 100}">
            <div class="sample-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
            </div>
            <h3>${title}</h3>
            ${desc ? `<p class="sample-desc">${desc}</p>` : ""}
            <a href="${link}" target="_blank" class="sample-link">
              Read Article
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        `;
      }
    }
    
    // Build testimonials section
    let testimonialsHTML = "";
    for (let i = 1; i <= 2; i++) {
      const testimonial = data[`testimonial${i}`];
      const author = data[`testimonial${i}Author`];
      
      if (testimonial && author) {
        testimonialsHTML += `
          <div class="testimonial-card" data-aos="fade-up" data-aos-delay="${i * 100}">
            <div class="quote-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>
            <p class="testimonial-text">"${testimonial}"</p>
            <p class="testimonial-author">— ${author}</p>
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
        <title>${name} - ${writerType}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #64748b;
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --border: #e2e8f0;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
            --shadow-lg: 0 10px 30px rgba(0,0,0,0.1);
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg-secondary);
            color: var(--text-primary);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 3rem 1.5rem;
          }

          /* Header Section */
          header {
            text-align: center;
            padding: 3rem 0;
            background: var(--bg-primary);
            border-radius: 24px;
            box-shadow: var(--shadow-md);
            margin-bottom: 3rem;
          }

          .profile-img {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 1.5rem;
            border: 4px solid var(--primary);
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
            transition: transform 0.3s ease;
          }

          .profile-img:hover {
            transform: scale(1.05);
          }

          h1 {
            font-size: 2.75rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
            font-weight: 800;
            letter-spacing: -0.02em;
          }

          .writer-type {
            display: inline-block;
            font-size: 1rem;
            color: var(--primary);
            background: rgba(37, 99, 235, 0.1);
            padding: 0.5rem 1.25rem;
            border-radius: 50px;
            font-weight: 600;
            margin-bottom: 1.5rem;
          }

          .bio {
            font-size: 1.125rem;
            color: var(--text-secondary);
            max-width: 700px;
            margin: 0 auto;
            line-height: 1.7;
          }

          .social-links {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
          }

          .social-links a {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            padding: 0.75rem 1.5rem;
            border: 2px solid var(--border);
            border-radius: 12px;
            background: var(--bg-primary);
            transition: all 0.3s ease;
          }

          .social-links a:hover {
            border-color: var(--primary);
            color: var(--primary);
            transform: translateY(-2px);
            box-shadow: var(--shadow-sm);
          }

          /* Section Styling */
          section {
            margin-bottom: 4rem;
          }

          h2 {
            font-size: 2.25rem;
            margin-bottom: 2.5rem;
            color: var(--text-primary);
            text-align: center;
            font-weight: 800;
            position: relative;
            padding-bottom: 1rem;
          }

          h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--primary-dark));
            border-radius: 2px;
          }

          /* Sample Cards */
          .sample-card {
            background: var(--bg-primary);
            padding: 2.5rem;
            margin-bottom: 2rem;
            border-radius: 20px;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .sample-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, var(--primary), var(--primary-dark));
          }

          .sample-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary);
          }

          .sample-icon {
            width: 48px;
            height: 48px;
            background: rgba(37, 99, 235, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            margin-bottom: 1.5rem;
          }

          .sample-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
            font-weight: 700;
            line-height: 1.3;
          }

          .sample-desc {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
            font-size: 1.05rem;
            line-height: 1.7;
          }

          .sample-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.2s ease;
          }

          .sample-link:hover {
            gap: 0.75rem;
            color: var(--primary-dark);
          }

          .sample-link svg {
            transition: transform 0.2s ease;
          }

          .sample-link:hover svg {
            transform: translateX(4px);
          }

          /* Testimonial Cards */
          .testimonial-card {
            background: var(--bg-primary);
            padding: 2.5rem;
            margin-bottom: 2rem;
            border-radius: 20px;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border);
            position: relative;
            transition: all 0.3s ease;
          }

          .testimonial-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
          }

          .quote-icon {
            color: rgba(37, 99, 235, 0.15);
            margin-bottom: 1rem;
          }

          .testimonial-text {
            font-size: 1.25rem;
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
            line-height: 1.8;
            font-style: italic;
          }

          .testimonial-author {
            color: var(--text-primary);
            font-weight: 600;
            font-size: 1rem;
          }

          /* Contact Section */
          .contact-section {
            text-align: center;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            padding: 4rem 3rem;
            border-radius: 24px;
            box-shadow: var(--shadow-lg);
            color: white;
          }

          .contact-section h2 {
            color: white;
            margin-bottom: 1rem;
          }

          .contact-section h2::after {
            background: white;
          }

          .contact-section p {
            font-size: 1.125rem;
            margin-bottom: 2.5rem;
            opacity: 0.95;
          }

          .email-button {
            display: inline-block;
            background: white;
            color: var(--primary);
            padding: 1.125rem 3rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 1.125rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          }

          .email-button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          }

          /* Footer */
          footer {
            text-align: center;
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border);
            color: var(--text-muted);
            font-size: 0.875rem;
          }

          footer a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
          }

          footer a:hover {
            text-decoration: underline;
          }

          /* Animations */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          [data-aos="fade-up"] {
            animation: fadeInUp 0.6s ease-out forwards;
          }

          [data-aos-delay="100"] { animation-delay: 0.1s; }
          [data-aos-delay="200"] { animation-delay: 0.2s; }
          [data-aos-delay="300"] { animation-delay: 0.3s; }

          /* Responsive Design */
          @media (max-width: 768px) {
            .container {
              padding: 2rem 1rem;
            }

            h1 {
              font-size: 2rem;
            }

            h2 {
              font-size: 1.75rem;
            }

            .profile-img {
              width: 120px;
              height: 120px;
            }

            .sample-card,
            .testimonial-card {
              padding: 2rem;
            }

            .contact-section {
              padding: 3rem 2rem;
            }

            .email-button {
              padding: 1rem 2rem;
              font-size: 1rem;
            }

            .social-links {
              flex-direction: column;
              align-items: center;
            }
          }

          @media (max-width: 480px) {
            h1 {
              font-size: 1.75rem;
            }

            .bio {
              font-size: 1rem;
            }

            .sample-card,
            .testimonial-card {
              padding: 1.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <img src="${profile}" alt="${name}" class="profile-img" />
            <h1>${name}</h1>
            <span class="writer-type">${writerType}</span>
            <p class="bio">${bio}</p>
            ${data.linkedin || data.twitter ? `
              <div class="social-links">
                ${data.linkedin ? `
                  <a href="${data.linkedin}" target="_blank">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                  </a>
                ` : ''}
                ${data.twitter ? `
                  <a href="${data.twitter}" target="_blank">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                  </a>
                ` : ''}
              </div>
            ` : ''}
          </header>

          <section>
            <h2>Writing Samples</h2>
            ${samplesHTML || '<p style="text-align:center;color:var(--text-muted);">No samples added yet.</p>'}
          </section>

          ${testimonialsHTML ? `
            <section>
              <h2>What Clients Say</h2>
              ${testimonialsHTML}
            </section>
          ` : ''}

          <section class="contact-section">
            <h2>Let's Work Together</h2>
            <p>Interested in working with me? I'd love to hear about your project.</p>
            <a href="mailto:${email}" class="email-button">Get in Touch</a>
          </section>
        </div>

        <footer>
          <p>Built with <a href="https://foliobase.vercel.app" target="_blank">Foliobase💙</a></p>
        </footer>
      </body>
    </html>
    `;
  }
};

export default minimalTemplate;