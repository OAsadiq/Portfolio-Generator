function getSocialIcon(type) {
  const icons = {
    linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    globe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
  };
  return icons[type] || icons.globe;
}

function getSampleIcon(type) {
  const typeIcons = {
    'blog post': '📝',
    'case study': '📊',
    'white paper': '📄',
    'article': '✍️',
    'email campaign': '📧',
    'social media': '📱',
    'newsletter': '📮',
    'press release': '📰',
    'ebook': '📚',
    'guide': '🗺️',
    'tutorial': '💡',
    'research': '🔬',
    'report': '📈',
    'landing page': '🎯',
    'product description': '🏷️',
    'script': '🎬',
    'technical documentation': '⚙️',
    'user manual': '📖'
  };
  
  const normalizedType = type?.toLowerCase().trim() || '';
  return typeIcons[normalizedType] || '📄';
}

function buildSamples(data) {
  let samplesHTML = "";
  let modalsHTML = "";
  
  for (let i = 1; i <= 4; i++) {
    const title = data[`sample${i}Title`];
    const type = data[`sample${i}Type`];
    const desc = data[`sample${i}Description`];
    const content = data[`sample${i}Content`];
    const link = data[`sample${i}Link`];
    const image = data[`sample${i}Image`];
    
    if (title) {
      const hasContent = content && content.trim();
      const hasLink = link && link.trim();
      
      // Get icon based on type or use custom image
      const displayIcon = image ? `<img src="${image}" alt="${title}" class="sample-card-image" />` : 
                         `<div class="sample-emoji-icon">${getSampleIcon(type)}</div>`;
      
      samplesHTML += `
        <article class="sample-card">
          <div class="sample-image-container">
            ${displayIcon}
          </div>
          <div class="sample-content">
            ${type ? `<span class="sample-type">${type}</span>` : ""}
            <h3 class="sample-title">${title}</h3>
            ${desc ? `<p class="sample-description">${desc}</p>` : ""}
            
            <div class="sample-actions">
              ${hasContent ? `
                <button class="sample-btn sample-btn-primary" onclick="openModal('modal-${i}')">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8C2 8 4.5 3 8 3C11.5 3 14 8 14 8C14 8 11.5 13 8 13C4.5 13 2 8 2 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Read Sample
                </button>
              ` : ''}
              ${hasLink ? `
                <a href="${link}" target="_blank" class="sample-btn sample-btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4H4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  View Article
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
      
      if (hasContent) {
        modalsHTML += `
          <div id="modal-${i}" class="modal">
            <div class="modal-overlay" onclick="closeModal('modal-${i}')"></div>
            <div class="modal-container">
              <button class="modal-close" onclick="closeModal('modal-${i}')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <div class="modal-content">
                ${type ? `<span class="modal-type">${type}</span>` : ""}
                <h2 class="modal-title">${title}</h2>
                <div class="modal-body">
                  ${content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
                </div>
                ${hasLink ? `
                  <a href="${link}" target="_blank" class="modal-cta">
                    View Original Article
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4H4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }
    }
  }
  
  return { samplesHTML, modalsHTML };
}

function buildSocialLinks(data) {
  const socialLinks = [];
  if (data.linkedin) socialLinks.push({ name: 'LinkedIn', url: data.linkedin, icon: 'linkedin' });
  if (data.twitter) socialLinks.push({ name: 'Twitter', url: data.twitter, icon: 'twitter' });
  if (data.instagram) socialLinks.push({ name: 'Instagram', url: data.instagram, icon: 'instagram' });
  if (data.website) socialLinks.push({ name: 'Website', url: data.website, icon: 'globe' });
  
  if (socialLinks.length === 0) return '';
  
  const socialHTML = socialLinks.map(social => `
    <a href="${social.url}" target="_blank" class="social-link" title="${social.name}">
      ${getSocialIcon(social.icon)}
    </a>
  `).join('');
  
  return `
    <div class="social-links">
      ${socialHTML}
    </div>
  `;
}

function getStyles(primaryColor, accentColor) {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary: ${primaryColor};
      --accent: ${accentColor};
      --text: #0f172a;
      --text-secondary: #475569;
      --text-tertiary: #94a3b8;
      --bg: #ffffff;
      --bg-secondary: #f8fafc;
      --bg-tertiary: #f1f5f9;
      --border: #e2e8f0;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    }

    body {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Hero Section */
    .hero {
      min-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 6rem 0;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background: linear-gradient(135deg, var(--primary)10, transparent 70%),
                  linear-gradient(225deg, var(--accent)05, transparent 70%);
      z-index: -1;
    }

    .hero-content {
      position: relative;
      z-index: 1;
    }

    .profile-image {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      object-fit: cover;
      margin: 0 auto 2rem;
      border: 5px solid var(--primary);
      box-shadow: var(--shadow-xl), 0 0 0 8px var(--primary)20;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    h1 {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 900;
      color: var(--text);
      margin-bottom: 1rem;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .headline {
      font-size: clamp(1.25rem, 2.5vw, 1.5rem);
      color: var(--primary);
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .bio {
      font-size: 1.25rem;
      color: var(--text-secondary);
      max-width: 700px;
      margin: 0 auto 2.5rem;
      line-height: 1.8;
    }

    .social-links {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2.5rem;
    }

    .social-link {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
      transition: all 0.3s;
      border: 2px solid var(--border);
    }

    .social-link:hover {
      background: var(--primary);
      color: white;
      transform: translateY(-4px);
      border-color: var(--primary);
      box-shadow: var(--shadow-lg);
    }

    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 3rem;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
      text-decoration: none;
      border-radius: 100px;
      font-weight: 700;
      font-size: 1.125rem;
      transition: all 0.3s;
      box-shadow: var(--shadow-xl);
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    }

    /* Specialties Section */
    .specialties {
      padding: 4rem 0;
      background: var(--bg-secondary);
    }

    .specialties-grid {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      max-width: 900px;
      margin: 0 auto;
    }

    .specialty-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.75rem;
      background: var(--bg);
      border: 2px solid var(--border);
      border-radius: 100px;
      font-weight: 600;
      color: var(--text);
      transition: all 0.3s;
      box-shadow: var(--shadow-sm);
    }

    .specialty-pill:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow);
    }

    .specialty-icon {
      color: var(--primary);
    }

    /* Section Styles */
    .section {
      padding: 6rem 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 900;
      color: var(--text);
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }

    .section-subtitle {
      font-size: 1.25rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }

    /* Writing Samples Grid */
    .samples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    .sample-card {
      background: var(--bg);
      border: 2px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
    }

    .sample-card:hover {
      border-color: var(--primary);
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl);
    }

    /* Image/Icon Container */
    .sample-image-container {
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, ${primaryColor}15, ${accentColor}15);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    /* For uploaded images */
    .sample-card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* For emoji/icon fallback */
    .sample-emoji-icon {
      font-size: 5rem;
      line-height: 1;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    }

    .sample-content {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    /* Fixed Sample Type Badge */
    .sample-type {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, ${primaryColor}20, ${accentColor}20);
      color: var(--primary);
      border-radius: 100px;
      font-size: 0.8125rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      align-self: flex-start;
      border: 1px solid ${primaryColor}30;
    }

    .sample-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    .sample-description {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      line-height: 1.7;
      flex: 1;
    }

    .sample-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: auto;
    }

    .sample-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9375rem;
      transition: all 0.3s;
      cursor: pointer;
      border: none;
      text-decoration: none;
    }

    .sample-btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
      box-shadow: var(--shadow);
    }

    .sample-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .sample-btn-secondary {
      background: var(--bg-secondary);
      color: var(--text);
      border: 2px solid var(--border);
    }

    .sample-btn-secondary:hover {
      border-color: var(--primary);
      background: var(--bg);
    }

    /* Modal Styles */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .modal.active {
      display: flex;
    }

    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-container {
      position: relative;
      background: var(--bg);
      border-radius: 24px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-secondary);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      z-index: 10;
    }

    .modal-close:hover {
      background: var(--primary);
      color: white;
      transform: rotate(90deg);
    }

    .modal-content {
      padding: 3rem;
    }

    .modal-type {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      background: linear-gradient(135deg, ${primaryColor}20, ${accentColor}20);
      color: var(--primary);
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid ${primaryColor}30;
    }

    .modal-title {
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--text);
      margin-bottom: 2rem;
      line-height: 1.2;
    }

    .modal-body {
      font-size: 1.125rem;
      line-height: 1.8;
      color: var(--text-secondary);
    }

    .modal-body p {
      margin-bottom: 1.5rem;
    }

    .modal-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 2rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      transition: all 0.3s;
      box-shadow: var(--shadow-lg);
    }

    .modal-cta:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }

    /* Testimonials */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .testimonial-card {
      background: var(--bg);
      border: 2px solid var(--border);
      border-radius: 20px;
      padding: 2.5rem;
      transition: all 0.3s;
      box-shadow: var(--shadow);
    }

    .testimonial-card:hover {
      border-color: var(--primary);
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }

    .testimonial-stars {
      color: #fbbf24;
      font-size: 1.25rem;
      margin-bottom: 1rem;
      letter-spacing: 0.25rem;
    }

    .testimonial-text {
      font-size: 1.125rem;
      color: var(--text);
      line-height: 1.7;
      margin-bottom: 1.5rem;
      font-style: italic;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .testimonial-avatar,
    .testimonial-avatar-placeholder {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--border);
    }

    .testimonial-avatar-placeholder {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
    }

    .testimonial-info {
      display: flex;
      flex-direction: column;
    }

    .testimonial-info strong {
      color: var(--text);
      font-weight: 700;
      font-size: 1.0625rem;
    }

    .testimonial-role {
      color: var(--text-tertiary);
      font-size: 0.9375rem;
    }

    /* Contact Section */
    .contact-section {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      padding: 5rem 2rem;
      border-radius: 32px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .contact-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    }

    .contact-section h2 {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 900;
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
    }

    .contact-section p {
      font-size: 1.375rem;
      margin-bottom: 2.5rem;
      opacity: 0.95;
      position: relative;
      z-index: 1;
    }

    .contact-button {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 3rem;
      background: white;
      color: var(--primary);
      text-decoration: none;
      border-radius: 100px;
      font-weight: 800;
      font-size: 1.125rem;
      transition: all 0.3s;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      position: relative;
      z-index: 1;
    }

    .contact-button:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    /* Footer */
    footer {
      padding: 4rem 0;
      text-align: center;
      background: var(--bg-secondary);
    }

    footer p {
      color: var(--text-tertiary);
      font-size: 0.9375rem;
    }

    footer a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    footer a:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 0 1.25rem;
      }

      .hero {
        min-height: auto;
        padding: 4rem 0;
      }

      .profile-image {
        width: 140px;
        height: 140px;
      }

      .section {
        padding: 4rem 0;
      }

      .samples-grid,
      .testimonials-grid {
        grid-template-columns: 1fr;
      }

      .sample-image-container {
        height: 180px;
      }

      .sample-emoji-icon {
        font-size: 4rem;
      }

      .modal-content {
        padding: 2rem 1.5rem;
      }

      .modal-title {
        font-size: 1.875rem;
      }

      .contact-section {
        padding: 3rem 1.5rem;
        border-radius: 24px;
      }
    }

    /* Smooth Scrolling */
    html {
      scroll-behavior: smooth;
    }

    /* Selection */
    ::selection {
      background: var(--primary);
      color: white;
    }
  `;
}


const professionalWriterTemplate = {
  id: "professional-writer-template",
  name: "Professional Writer Portfolio",
  description: "Advanced portfolio with visual builder, modal samples, and modern design.",
  thumbnail: "/images/professional-template.jpg",
  isPro: true,
  fields: [
    // Hero Section
    { name: "fullName", label: "Full Name", type: "text", required: true, section: "hero" },
    { name: "headline", label: "Professional Headline", type: "text", placeholder: "e.g., B2B Content Writer | SaaS Specialist", required: true, section: "hero" },
    { name: "bio", label: "About You", type: "textarea", required: true, section: "hero" },
    { name: "profileImage", label: "Profile Image", type: "file", section: "hero" },
    
    // Theme Customization
    { name: "primaryColor", label: "Primary Color", type: "color", default: "#2563eb", section: "theme" },
    { name: "accentColor", label: "Accent Color", type: "color", default: "#0ea5e9", section: "theme" },
    
    // Specialties
    { name: "specialty1", label: "Specialty 1", type: "text", placeholder: "e.g., SEO Blog Posts", section: "specialties" },
    { name: "specialty2", label: "Specialty 2", type: "text", placeholder: "e.g., Email Campaigns", section: "specialties" },
    { name: "specialty3", label: "Specialty 3", type: "text", placeholder: "e.g., Case Studies", section: "specialties" },
    { name: "specialty4", label: "Specialty 4", type: "text", placeholder: "e.g., White Papers", section: "specialties" },
    
    // Testimonials
    { name: "testimonial1", label: "Testimonial 1", type: "textarea", section: "testimonials" },
    { name: "testimonial1Author", label: "Client 1 Name", type: "text", section: "testimonials" },
    { name: "testimonial1Role", label: "Client 1 Role/Company", type: "text", section: "testimonials" },
    { name: "testimonial1Image", label: "Client 1 Photo", type: "file", section: "testimonials" },
    
    { name: "testimonial2", label: "Testimonial 2", type: "textarea", section: "testimonials" },
    { name: "testimonial2Author", label: "Client 2 Name", type: "text", section: "testimonials" },
    { name: "testimonial2Role", label: "Client 2 Role/Company", type: "text", section: "testimonials" },
    { name: "testimonial2Image", label: "Client 2 Photo", type: "file", section: "testimonials" },
    
    { name: "testimonial3", label: "Testimonial 3", type: "textarea", section: "testimonials" },
    { name: "testimonial3Author", label: "Client 3 Name", type: "text", section: "testimonials" },
    { name: "testimonial3Role", label: "Client 3 Role/Company", type: "text", section: "testimonials" },
    { name: "testimonial3Image", label: "Client 3 Photo", type: "file", section: "testimonials" },
    
    // Contact
    { name: "email", label: "Email Address", type: "email", required: true, section: "contact" },
    { name: "linkedin", label: "LinkedIn URL", type: "text", section: "contact" },
    { name: "twitter", label: "Twitter/X URL", type: "text", section: "contact" },
    { name: "instagram", label: "Instagram URL", type: "text", section: "contact" },
    { name: "website", label: "Other Links", type: "text", section: "contact" },
  ],
  
  generateHTML: (data, sections = []) => {
    const name = data.fullName || "Your Name";
    const headline = data.headline || "Freelance Writer";
    const bio = data.bio || "Crafting compelling content for brands and businesses.";
    const profile = data.profileImage || "/images/default-avatar.png";
    const email = data.email || "";
    const primaryColor = data.primaryColor || "#2563eb";
    const accentColor = data.accentColor || "#0ea5e9";
    
    const defaultSections = [
      { id: 'hero', enabled: true, order: 0 },
      { id: 'specialties', enabled: true, order: 1 },
      { id: 'samples', enabled: true, order: 2 },
      { id: 'testimonials', enabled: true, order: 3 },
      { id: 'contact', enabled: true, order: 4 },
      { id: 'footer', enabled: true, order: 5 },
    ];
    
    const activeSections = sections.length > 0 ? sections : defaultSections;
    
    const sectionMap = {};
    activeSections.forEach(section => {
      sectionMap[section.id] = section.enabled !== undefined ? section.enabled : true;
    });
    
    const sortedSections = [...activeSections].sort((a, b) => a.order - b.order);
    
    const sectionContent = {
      hero: () => `
        <section class="hero">
          <div class="container">
            <div class="hero-content">
              <img src="${profile}" alt="${name}" class="profile-image" />
              <h1>${name}</h1>
              <p class="headline">${headline}</p>
              <p class="bio">${bio}</p>
              
              ${buildSocialLinks(data)}
              
              <a href="mailto:${email}" class="cta-button">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 4L10 11L17 4M3 4H17V14H3V4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Get In Touch
              </a>
            </div>
          </div>
        </section>
      `,
      
      specialties: () => {
        let specialtiesHTML = "";
        for (let i = 1; i <= 4; i++) {
          const specialty = data[`specialty${i}`];
          if (specialty) {
            specialtiesHTML += `
              <div class="specialty-pill">
                <svg class="specialty-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 2L11.5 7.5L17 8L13 12L14 17.5L9 15L4 17.5L5 12L1 8L6.5 7.5L9 2Z" fill="currentColor"/>
                </svg>
                ${specialty}
              </div>
            `;
          }
        }
        
        if (!specialtiesHTML) return '';
        
        return `
          <section class="specialties">
            <div class="container">
              <div class="specialties-grid">
                ${specialtiesHTML}
              </div>
            </div>
          </section>
        `;
      },
      
      samples: () => {
        const samples = data.samples || [];
        
        if (samples.length === 0) {
          return `
            <section class="section">
              <div class="container">
                <div class="section-header">
                  <h2 class="section-title">Featured Work</h2>
                  <p class="section-subtitle">A curated selection of my best writing samples and published articles</p>
                </div>
                <div class="samples-grid">
                  <p style="text-align:center;color:var(--text-tertiary);font-size:1.125rem;">No samples added yet.</p>
                </div>
              </div>
            </section>
          `;
        }
        
        let samplesHTML = "";
        let modalsHTML = "";
        
        samples.forEach((sample, index) => {
          const hasContent = sample.content && sample.content.trim();
          const hasLink = sample.link && sample.link.trim();
          
          const displayIcon = sample.image ? 
            `<img src="${sample.image}" alt="${sample.title}" class="sample-card-image" />` : 
            `<div class="sample-emoji-icon">${getSampleIcon(sample.type)}</div>`;
          
          samplesHTML += `
            <article class="sample-card">
              <div class="sample-image-container">
                ${displayIcon}
              </div>
              <div class="sample-content">
                ${sample.type ? `<span class="sample-type">${sample.type}</span>` : ""}
                <h3 class="sample-title">${sample.title}</h3>
                ${sample.description ? `<p class="sample-description">${sample.description}</p>` : ""}
                
                <div class="sample-actions">
                  ${hasContent ? `
                    <button class="sample-btn sample-btn-primary" onclick="openModal('modal-${index}')">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8C2 8 4.5 3 8 3C11.5 3 14 8 14 8C14 8 11.5 13 8 13C4.5 13 2 8 2 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      Read Sample
                    </button>
                  ` : ''}
                  ${hasLink ? `
                    <a href="${sample.link}" target="_blank" class="sample-btn sample-btn-secondary">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4H4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      View Article
                    </a>
                  ` : ''}
                </div>
              </div>
            </article>
          `;
          
          if (hasContent) {
            modalsHTML += `
              <div id="modal-${index}" class="modal">
                <div class="modal-overlay" onclick="closeModal('modal-${index}')"></div>
                <div class="modal-container">
                  <button class="modal-close" onclick="closeModal('modal-${index}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <div class="modal-content">
                    ${sample.type ? `<span class="modal-type">${sample.type}</span>` : ""}
                    <h2 class="modal-title">${sample.title}</h2>
                    <div class="modal-body">
                      ${sample.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
                    </div>
                    ${hasLink ? `
                      <a href="${sample.link}" target="_blank" class="modal-cta">
                        View Original Article
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M12 4H4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                          <path d="M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                      </a>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }
        });
        
        return `
          <section class="section">
            <div class="container">
              <div class="section-header">
                <h2 class="section-title">Featured Work</h2>
                <p class="section-subtitle">A curated selection of my best writing samples and published articles</p>
              </div>
              <div class="samples-grid">
                ${samplesHTML}
              </div>
            </div>
          </section>
          ${modalsHTML}
        `;
      },
      
      testimonials: () => {
        let testimonialsHTML = "";
        for (let i = 1; i <= 3; i++) {
          const testimonial = data[`testimonial${i}`];
          const author = data[`testimonial${i}Author`];
          const role = data[`testimonial${i}Role`];
          const image = data[`testimonial${i}Image`];
          
          if (testimonial && author) {
            testimonialsHTML += `
              <div class="testimonial-card">
                <div class="testimonial-stars">${'★'.repeat(5)}</div>
                <p class="testimonial-text">"${testimonial}"</p>
                <div class="testimonial-author">
                  ${image ? `<img src="${image}" alt="${author}" class="testimonial-avatar" />` : `<div class="testimonial-avatar-placeholder">${author.charAt(0)}</div>`}
                  <div class="testimonial-info">
                    <strong>${author}</strong>
                    ${role ? `<span class="testimonial-role">${role}</span>` : ""}
                  </div>
                </div>
              </div>
            `;
          }
        }
        
        if (!testimonialsHTML) return '';
        
        return `
          <section class="section" style="background: var(--bg-secondary);">
            <div class="container">
              <div class="section-header">
                <h2 class="section-title">Client Testimonials</h2>
                <p class="section-subtitle">What clients say about working with me</p>
              </div>
              <div class="testimonials-grid">
                ${testimonialsHTML}
              </div>
            </div>
          </section>
        `;
      },
      
      contact: () => `
        <section class="section">
          <div class="container">
            <div class="contact-section">
              <h2>Let's Create Something Amazing</h2>
              <p>Ready to elevate your content? Let's discuss your project.</p>
              <a href="mailto:${email}" class="contact-button">
                Start a Conversation
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 13L13 7M13 7H7M13 7V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </section>
      `,
      
      footer: () => `
        <footer>
          <div class="container">
            <p>Built with <a href="https://foliobase.vercel.app" target="_blank">Foliobase</a> ✨</p>
          </div>
        </footer>
      `
    };
    
    // Build the main content by iterating through sorted sections
    let mainContent = '';
    sortedSections.forEach(section => {
      if (section.enabled && sectionContent[section.id]) {
        mainContent += sectionContent[section.id]();
      }
    });
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <title>${name} - ${headline}</title>
          <style>
            ${getStyles(primaryColor, accentColor)}
          </style>
        </head>
        <body>
          ${mainContent}

          <script>
            function openModal(id) {
              document.getElementById(id).classList.add('active');
              document.body.style.overflow = 'hidden';
            }

            function closeModal(id) {
              document.getElementById(id).classList.remove('active');
              document.body.style.overflow = 'auto';
            }

            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                  closeModal(modal.id);
                });
              }
            });
          </script>
          
          <!-- Embed portfolio data for future editing -->
          <script type="application/json" id="portfolio-data">
            ${JSON.stringify({ 
              formData: data, 
              sections: activeSections 
            })}
          </script>
        </body>
      </html>
    `;
  },

  getStyles: function(primaryColor, accentColor) {
    return `
      
    `;
  }
};

export default professionalWriterTemplate;