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
          <div class="sample-card">
            <h3>${title}</h3>
            ${desc ? `<p class="sample-desc">${desc}</p>` : ""}
            <a href="${link}" target="_blank" class="sample-link">Read Article →</a>
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
          <div class="testimonial-card">
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
        <title>${name} - ${writerType}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
            background: #fafafa;
            color: #2c2c2c;
            line-height: 1.7;
          }

          header {
            text-align: center;
            padding: 2rem 0 3rem;
            border-bottom: 2px solid #e0e0e0;
          }

          .profile-img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 1.5rem;
            border: 3px solid #333;
          }

          h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            color: #1a1a1a;
            font-weight: 600;
          }

          .writer-type {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 1.5rem;
            font-style: italic;
          }

          .bio {
            font-size: 1.1rem;
            color: #444;
            max-width: 600px;
            margin: 0 auto;
          }

          .social-links {
            display: flex;
            gap: 1.5rem;
            justify-content: center;
            margin-top: 1.5rem;
          }

          .social-links a {
            color: #0066cc;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
          }

          .social-links a:hover {
            color: #004999;
            text-decoration: underline;
          }

          section {
            margin-top: 4rem;
          }

          h2 {
            font-size: 2rem;
            margin-bottom: 2rem;
            color: #1a1a1a;
            text-align: center;
            position: relative;
            padding-bottom: 0.5rem;
          }

          h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: #333;
          }

          .sample-card {
            background: white;
            padding: 2rem;
            margin-bottom: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border-left: 4px solid #333;
          }

          .sample-card h3 {
            font-size: 1.5rem;
            margin-bottom: 0.8rem;
            color: #1a1a1a;
          }

          .sample-desc {
            color: #555;
            margin-bottom: 1rem;
            font-size: 1.05rem;
          }

          .sample-link {
            display: inline-block;
            color: #0066cc;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.2s;
          }

          .sample-link:hover {
            color: #004999;
            transform: translateX(4px);
          }

          .testimonial-card {
            background: #f5f5f5;
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #666;
          }

          .testimonial-text {
            font-size: 1.15rem;
            font-style: italic;
            color: #333;
            margin-bottom: 1rem;
            line-height: 1.6;
          }

          .testimonial-author {
            text-align: right;
            color: #666;
            font-weight: 500;
          }

          .contact-section {
            text-align: center;
            background: white;
            padding: 3rem 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .contact-section h2 {
            margin-bottom: 1.5rem;
          }

          .contact-section p {
            font-size: 1.1rem;
            color: #555;
            margin-bottom: 2rem;
          }

          .email-button {
            display: inline-block;
            background: #333;
            color: white;
            padding: 1rem 2.5rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s;
          }

          .email-button:hover {
            background: #000;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }

          footer {
            text-align: center;
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid #e0e0e0;
            font-size: 0.9rem;
            color: #888;
          }

          footer a {
            color: #0066cc;
            text-decoration: none;
          }

          @media (max-width: 640px) {
            body {
              padding: 1.5rem 1rem;
            }

            h1 {
              font-size: 2rem;
            }

            h2 {
              font-size: 1.6rem;
            }

            .profile-img {
              width: 100px;
              height: 100px;
            }

            .sample-card, .testimonial-card {
              padding: 1.5rem;
            }

            .contact-section {
              padding: 2rem 1.5rem;
            }

            .email-button {
              padding: 0.9rem 2rem;
              font-size: 1rem;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <img src="${profile}" alt="${name}" class="profile-img" />
          <h1>${name}</h1>
          <p class="writer-type">${writerType}</p>
          <p class="bio">${bio}</p>
          ${data.linkedin || data.twitter ? `
            <div class="social-links">
              ${data.linkedin ? `<a href="${data.linkedin}" target="_blank">LinkedIn</a>` : ''}
              ${data.twitter ? `<a href="${data.twitter}" target="_blank">Twitter</a>` : ''}
            </div>
          ` : ''}
        </header>

        <section>
          <h2>Writing Samples</h2>
          ${samplesHTML || '<p style="text-align:center;color:#888;">No samples added yet.</p>'}
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

        <footer>
          <p>Built with <a href="https://oaportfoliogenerator.vercel.app" target="_blank">OA-Portfolio-Generator</a></p>
        </footer>
      </body>
    </html>
    `;
  }
};

export default minimalTemplate;