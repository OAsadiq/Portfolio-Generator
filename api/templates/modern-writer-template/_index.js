// ─── Social icon SVGs ────────────────────────────────────────────────────────
function socialIcon(type) {
  const icons = {
    linkedin:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    twitter:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    github:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    dribbble:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.628 0-12 5.373-12 12s5.372 12 12 12 12-5.373 12-12-5.372-12-12-12zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.301 2.431-.301 2.275 0 4.368.779 6.043 2.059zm-10.516-.993c1.331 1.742 2.511 3.538 3.537 5.381-2.43.715-5.331 1.082-8.684 1.105.692-2.835 2.601-5.193 5.147-6.486zm-5.44 8.834l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48-1.65-1.57-2.748-3.684-2.296-6.334zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027.928 2.42 1.609 4.91 2.043 7.46-3.349 1.291-7.418.788-9.641-1.433zm11.586.43c-.438-2.353-1.08-4.653-1.92-6.897 1.876-.265 3.94-.196 6.199.196-.437 2.786-2.048 5.191-4.279 6.701z"/></svg>',
    behance:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/></svg>',
    instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    website:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  };
  return icons[type] || icons.website;
}

function buildSocials(data, inline = false) {
  const map = [
    ['linkedin', data.linkedin], ['twitter', data.twitter], ['github', data.github],
    ['dribbble', data.dribbble], ['behance', data.behance], ['instagram', data.instagram],
    ['website', data.website],
  ];
  const links = map.filter(([, v]) => v).map(([k, v]) => `
    <a href="${v}" target="_blank" rel="noopener" class="social-icon-link" title="${k}">${socialIcon(k)}</a>`).join('');
  return links ? `<div class="social-icons${inline ? ' social-icons--inline' : ''}">${links}</div>` : '';
}

function buildCaseStudies(data) {
  let caseStudiesHTML = "";

  for (let i = 1; i <= 100; i++) {
    const title = data[`case${i}Title`];
    if (!title) break;

    const client = data[`case${i}Client`];
    const role = data[`case${i}Role`];
    const description = data[`case${i}Description`];
    const challenge = data[`case${i}Challenge`];
    const solution = data[`case${i}Solution`];
    const results = data[`case${i}Results`];
    const image = data[`case${i}Image`];
    const tags = data[`case${i}Tags`];
    const emoji = getCaseStudyEmoji(i);

    // Determine if we show the modal link based on whether we have extended content
    const hasExtendedContent = challenge || solution || results;

    caseStudiesHTML += `
      <article class="case-study" data-aos="fade-up" data-aos-delay="${(i - 1) * 100}">
        <div class="case-image">
          ${image ? `<img src="${image}" alt="${title}" />` : `<span class="case-emoji">${emoji}</span>`}
        </div>
        <div class="case-content">
          <div class="case-meta">
            <span class="case-client">${client || 'Client Project'}</span>
            ${role ? `<span class="case-role">${role}</span>` : ''}
          </div>
          <h3 class="case-title">${title}</h3>
          <p class="case-description">${description || ''}</p>
          ${tags ? `
            <div class="case-tags">
              ${tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
            </div>
          ` : ''}
          ${hasExtendedContent ? `
            <button class="read-more" onclick="openCaseModal(${i})">Read Full Case Study →</button>
          ` : ''}
        </div>
      </article>
      
      ${hasExtendedContent ? `
        <!-- Case Study Modal -->
        <div id="case-modal-${i}" class="case-modal">
          <div class="modal-overlay" onclick="closeCaseModal(${i})"></div>
          <div class="modal-content">
            <button class="modal-close" onclick="closeCaseModal(${i})">×</button>
            <div class="modal-header">
              ${image ? `<img src="${image}" alt="${title}" class="modal-hero-image" />` : ''}
              <h2>${title}</h2>
              <div class="modal-meta">
                <span><strong>Client:</strong> ${client}</span>
                ${role ? `<span><strong>Role:</strong> ${role}</span>` : ''}
              </div>
            </div>
            <div class="modal-body">
              ${challenge ? `
                <section class="modal-section">
                  <h3>🎯 Challenge</h3>
                  <p>${challenge}</p>
                </section>
              ` : ''}
              ${solution ? `
                <section class="modal-section">
                  <h3>💡 Solution</h3>
                  <p>${solution}</p>
                </section>
              ` : ''}
              ${results ? `
                <section class="modal-section">
                  <h3>📊 Results</h3>
                  <p>${results}</p>
                </section>
              ` : ''}
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }

  return caseStudiesHTML;
}

function buildBlogPosts(data) {
  let blogHTML = "";

  for (let i = 1; i <= 100; i++) {
    const title = data[`blog${i}Title`];
    if (!title) break;

    const excerpt = data[`blog${i}Excerpt`];
    const date = data[`blog${i}Date`];
    const category = data[`blog${i}Category`];
    const readTime = data[`blog${i}ReadTime`];
    const link = data[`blog${i}Link`];

    blogHTML += `
      <article class="blog-card" data-aos="fade-up" data-aos-delay="${(i - 1) * 100}">
        <div class="blog-image">
          ${category ? `<span class="blog-category">${category}</span>` : ''}
          <div class="blog-icon">📄</div>
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            ${date ? `<time>${date}</time>` : 'Recent'}
            ${readTime ? `<span> • ${readTime} min read</span>` : ''}
          </div>
          <h3 class="blog-title">${title}</h3>
          ${excerpt ? `<p class="blog-excerpt">${excerpt}</p>` : ''}
          ${link ? `
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="blog-link">
              Read More <span>→</span>
            </a>
          ` : ''}
        </div>
      </article>
    `;
  }

  return blogHTML;
}

const modernTemplate = {
  id: "modern-writer-template",
  name: "Modern Writer Portfolio",
  description: "Premium template with animations, dark mode, and interactive elements",
  thumbnail: "/images/professional-template.jpg",
  isPro: true,

  fields: [
    // Hero Section
    { name: "fullName", label: "Full Name", type: "text", required: true, section: "hero" },
    { name: "tagline", label: "Tagline", type: "text", placeholder: "Creative Developer & Designer", required: true, section: "hero" },
    { name: "bio", label: "Bio", type: "textarea", required: true, section: "hero" },
    { name: "profileImage", label: "Profile Image", type: "file", section: "hero" },
    { name: "heroVideoUrl", label: "Hero Background Video URL (optional)", type: "text", placeholder: "https://example.com/video.mp4", section: "hero" },

    // Theme
    { name: "primaryColor", label: "Primary Color", type: "color", default: "#6366f1", section: "theme" },
    { name: "accentColor", label: "Accent Color", type: "color", default: "#ec4899", section: "theme" },

    // Skills/Expertise
    { name: "skill1", label: "Skill 1", type: "text", section: "skills" },
    { name: "skill2", label: "Skill 2", type: "text", section: "skills" },
    { name: "skill3", label: "Skill 3", type: "text", section: "skills" },
    { name: "skill4", label: "Skill 4", type: "text", section: "skills" },
    { name: "skill5", label: "Skill 5", type: "text", section: "skills" },
    { name: "skill6", label: "Skill 6", type: "text", section: "skills" },

    // Contact
    { name: "email", label: "Email", type: "email", required: true, section: "contact" },
    { name: "linkedin", label: "LinkedIn", type: "text", section: "contact" },
    { name: "twitter", label: "Twitter/X", type: "text", section: "contact" },
    { name: "github", label: "GitHub", type: "text", section: "contact" },
    { name: "dribbble", label: "Dribbble", type: "text", section: "contact" },
    { name: "behance", label: "Behance", type: "text", section: "contact" },
    { name: "website", label: "Website", type: "text", section: "contact" },
  ],

  generateHTML: (data, sections = []) => {
    const name = data.fullName || "Your Name";
    const tagline = data.tagline || "Creative Professional";
    const bio = data.bio || "Passionate about creating amazing digital experiences";
    const profile = data.profileImage || "";
    const heroVideo = data.heroVideoUrl || "";
    const email = data.email || "";
    const primaryColor = data.primaryColor || "#6366f1";
    const accentColor = data.accentColor || "#ec4899";

    // Default sections
    const defaultSections = [
      { id: 'hero', enabled: true, order: 0 },
      { id: 'about', enabled: true, order: 1 },
      { id: 'skills', enabled: true, order: 2 },
      { id: 'case-studies', enabled: true, order: 3 },
      { id: 'blog', enabled: true, order: 4 },
      { id: 'contact', enabled: true, order: 5 },
      { id: 'footer', enabled: true, order: 6 },
    ];

    const activeSections = sections.length > 0 ? sections : defaultSections;
    const sortedSections = [...activeSections].sort((a, b) => a.order - b.order);

    const sectionContent = {
      hero: () => `
        <section class="hero" data-section="hero">
          ${heroVideo ? `
            <video class="hero-video" autoplay muted loop playsinline>
              <source src="${heroVideo}" type="video/mp4">
            </video>
            <div class="hero-overlay"></div>
          ` : ''}
          <div class="hero-content">
            ${profile ? `
              <img src="${profile}" alt="${name}" class="hero-avatar" data-aos="zoom-in" />
            ` : `
              <div class="hero-avatar-letter" data-aos="zoom-in">${name.charAt(0)}</div>
            `}
            <h1 class="hero-title" data-aos="fade-up" data-aos-delay="100">${name}</h1>
            <p class="hero-tagline" data-aos="fade-up" data-aos-delay="200">${tagline}</p>
            <p class="hero-bio" data-aos="fade-up" data-aos-delay="300">${bio}</p>
            <div class="hero-cta" data-aos="fade-up" data-aos-delay="400">
              <a href="#contact" class="btn btn-primary">Get In Touch</a>
              <a href="#case-studies" class="btn btn-secondary">View Work</a>
            </div>
            <div class="scroll-indicator" data-aos="fade-up" data-aos-delay="500">
              <span>Scroll to explore</span>
              <div class="scroll-arrow"></div>
            </div>
          </div>
        </section>
      `,

      about: () => `
        <section class="about-section" data-section="about">
          <div class="container">
            <h2 class="section-title" data-aos="fade-up">About Me</h2>
            <div class="about-content" data-aos="fade-up" data-aos-delay="100">
              <p>${bio}</p>
            </div>
          </div>
        </section>
      `,

      skills: () => {
        let skillsHTML = "";
        for (let i = 1; i <= 6; i++) {
          const skill = data[`skill${i}`];
          if (skill) {
            const icon = getSkillIcon(skill);
            skillsHTML += `
              <div class="skill-card" data-aos="flip-left" data-aos-delay="${i * 50}">
                <div class="skill-icon">${icon}</div>
                <h3>${skill}</h3>
              </div>
            `;
          }
        }

        if (!skillsHTML) return '';

        return `
          <section class="skills-section" data-section="skills">
            <div class="container">
              <h2 class="section-title" data-aos="fade-up">Skills & Expertise</h2>
              <div class="skills-grid">
                ${skillsHTML}
              </div>
            </div>
          </section>
        `;
      },

      'case-studies': () => {
        const caseStudies = buildCaseStudies(data);
        if (!caseStudies) return '';

        return `
          <section class="case-studies-section" data-section="case-studies">
            <div class="container">
              <h2 class="section-title" data-aos="fade-up">Case Studies</h2>
              <div class="case-studies-grid">
                ${caseStudies}
              </div>
            </div>
          </section>
        `;
      },

      blog: () => {
        const blogPosts = buildBlogPosts(data);
        if (!blogPosts) return '';

        return `
          <section class="blog-section" data-section="blog">
            <div class="container">
              <h2 class="section-title" data-aos="fade-up">Latest Articles</h2>
              <div class="blog-grid">
                ${blogPosts}
              </div>
            </div>
          </section>
        `;
      },

      contact: () => `
        <section class="contact-section" data-section="contact">
          <div class="container">
            <h2 class="section-title" data-aos="fade-up">Let's Work Together</h2>
            <div class="contact-content" data-aos="fade-up" data-aos-delay="100">
              <p class="contact-text">Have a project in mind? Let's create something amazing together.</p>
              <a href="mailto:${email}" class="contact-email">${email}</a>
              <div class="social-links">
                ${buildSocialLinks(data)}
              </div>
            </div>
          </div>
        </section>
      `,

      footer: () => `
        <footer class="footer" data-section="footer">
          <div class="container">
            <p>© ${new Date().getFullYear()} ${name}. Built with <a href="https://foliobase.vercel.app" target="_blank">Foliobase</a></p>
            <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark mode">
              <span class="sun-icon">☀️</span>
              <span class="moon-icon">🌙</span>
            </button>
          </div>
        </footer>
      `
    };

    let mainContent = '';
    sortedSections.forEach(section => {
      if (section.enabled && sectionContent[section.id]) {
        mainContent += sectionContent[section.id]();
      }
    });

    return `
    <!DOCTYPE html>
    <html lang="en" data-theme="light">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${name} - ${tagline}</title>
        <meta name="description" content="${bio}" />
        <meta name="author" content="${name}" />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="${name} - ${tagline}" />
        <meta property="og:description" content="${bio}" />
        <meta property="og:image" content="${profile}" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="${name} - ${tagline}" />
        <meta name="twitter:description" content="${bio}" />
        <meta name="twitter:image" content="${profile}" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" type="image/svg+xml" href="${profile}" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
        
        <!-- AOS Animation Library -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" />
        
        <style>
          ${getModernStyles(primaryColor, accentColor)}
        </style>
      </head>
      <body>
        <!-- Dark Mode Toggle (Fixed Position) -->
        <button class="theme-toggle-fixed" onclick="toggleTheme()" aria-label="Toggle dark mode">
          <span class="sun-icon">☀️</span>
          <span class="moon-icon">🌙</span>
        </button>
        
        ${mainContent}
        
        <!-- AOS Library -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
        
        <script>
          // Initialize AOS
          AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50
          });
          
          // Dark mode toggle
          function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
          }
          
          // Load saved theme
          const savedTheme = localStorage.getItem('theme') || 'light';
          document.documentElement.setAttribute('data-theme', savedTheme);
          
          // Case Study Modals
          function openCaseModal(id) {
            document.getElementById('case-modal-' + id).classList.add('active');
            document.body.style.overflow = 'hidden';
          }
          
          function closeCaseModal(id) {
            document.getElementById('case-modal-' + id).classList.remove('active');
            document.body.style.overflow = 'auto';
          }
          
          // Smooth scroll
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            });
          });
        </script>
      </body>
    </html>
    `;
  }
};

function getModernStyles(primaryColor, accentColor) {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --accent: ${accent};
      --bg: #ffffff;
      --bg-2: #f7f7f7;
      --text: #0a0a0a;
      --text-2: #6b7280;
      --border: #e5e7eb;
      --radius: 10px;
      --max-w: 1100px;
    }

    [data-theme="dark"] {
      --bg: #0a0a0a;
      --bg-2: #111111;
      --text: #f5f5f5;
      --text-2: #9ca3af;
      --border: #222222;
    }

    html { scroll-behavior: smooth; font-size: 16px; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      transition: background 0.2s, color 0.2s;
    }

    /* ── Nav ── */
    .site-nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 56px;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      transition: background 0.2s, border-color 0.2s;
    }

    .nav-name {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text);
      text-decoration: none;
      letter-spacing: -0.01em;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .social-icons { display: flex; align-items: center; gap: 0.25rem; }
    .social-icon-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px; height: 34px;
      border-radius: 8px;
      color: var(--text-2);
      transition: color 0.15s, background 0.15s;
    }
    .social-icon-link:hover { color: var(--text); background: var(--bg-2); }

    .theme-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px; height: 34px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: transparent;
      cursor: pointer;
      color: var(--text-2);
      transition: color 0.15s, background 0.15s, border-color 0.15s;
    }
    .theme-btn:hover { color: var(--text); background: var(--bg-2); }
    [data-theme="light"] .icon-moon { display: none; }
    [data-theme="dark"] .icon-sun { display: none; }

    /* ── Wrapper ── */
    .page { padding-top: 56px; }

    .container {
      max-width: var(--max-w);
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* ── Hero ── */
    .hero {
      min-height: calc(100vh - 56px);
      display: flex;
      align-items: center;
      padding: 5rem 0 4rem;
    }

    .hero-inner {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 4rem;
      align-items: center;
      width: 100%;
    }

    .hero-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--accent);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
      padding: 0.35rem 0.875rem;
      border: 1px solid var(--accent);
      border-radius: 100px;
    }

    .hero-name {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
      color: var(--text);
      margin-bottom: 1.5rem;
    }

    .hero-bio {
      font-size: 1.125rem;
      color: var(--text-2);
      max-width: 520px;
      line-height: 1.75;
      margin-bottom: 1rem;
    }

    .hero-location {
      font-size: 0.875rem;
      color: var(--text-2);
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-bottom: 2rem;
    }

    .hero-cta {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius);
      font-size: 0.9375rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.15s;
      cursor: pointer;
      border: none;
    }

    .btn-primary {
      background: var(--accent);
      color: #fff;
    }
    .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

    .btn-outline {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-outline:hover { border-color: var(--text-2); background: var(--bg-2); }

    .hero-avatar {
      width: 220px;
      height: 220px;
      border-radius: 20px;
      overflow: hidden;
      flex-shrink: 0;
      background: var(--bg-2);
      border: 1px solid var(--border);
    }

    .hero-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .hero-avatar-letter {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4.5rem;
      font-weight: 700;
      color: var(--text-2);
      letter-spacing: -0.03em;
    }

    /* ── Section shared ── */
    .section {
      padding: 6rem 0;
      border-top: 1px solid var(--border);
    }

    .section-header {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text);
    }

    .section-count {
      font-size: 0.8125rem;
      color: var(--text-2);
      font-weight: 400;
    }

    /* ── Work / Projects ── */
    .work-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .project-card {
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      background: var(--bg);
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .project-card:hover {
      border-color: var(--text-2);
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }

    .project-media {
      position: relative;
      height: 220px;
      background: var(--bg-2);
      overflow: hidden;
    }

    .project-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
    .project-card:hover .project-img { transform: scale(1.03); }

    .project-img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .project-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .project-card:hover .project-overlay { opacity: 1; }

    .proj-btn {
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      text-decoration: none;
      transition: all 0.15s;
    }

    .proj-btn--detail {
      background: #fff;
      color: #000;
    }
    .proj-btn--detail:hover { background: #f0f0f0; }

    .proj-btn--link {
      background: transparent;
      color: #fff;
      border: 1px solid rgba(255,255,255,0.5);
    }
    .proj-btn--link:hover { background: rgba(255,255,255,0.15); }

    .project-body { padding: 1.25rem 1.5rem 1.5rem; }

    .project-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-2);
    }

    .project-client { font-weight: 500; color: var(--accent); }
    .meta-sep { color: var(--border); }
    .project-year { margin-left: auto; }

    .project-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.01em;
      margin-bottom: 0.5rem;
      line-height: 1.35;
    }

    .project-desc {
      font-size: 0.9rem;
      color: var(--text-2);
      line-height: 1.65;
      margin-bottom: 0.875rem;
    }

    .project-tags { display: flex; flex-wrap: wrap; gap: 0.375rem; }

    .tag {
      font-size: 0.75rem;
      padding: 0.25rem 0.625rem;
      border-radius: 100px;
      background: var(--bg-2);
      color: var(--text-2);
      border: 1px solid var(--border);
      font-weight: 500;
    }

    /* ── Skills ── */
    .skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.625rem;
    }

    .skill-pill {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      border-radius: 100px;
      border: 1px solid var(--border);
      color: var(--text);
      background: var(--bg);
      font-weight: 500;
      transition: border-color 0.15s, color 0.15s;
    }

    .skill-pill:hover { border-color: var(--accent); color: var(--accent); }

    /* ── Experience ── */
    .exp-list { display: flex; flex-direction: column; gap: 0; }

    .exp-item {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 2rem;
      padding: 1.5rem 0;
      border-bottom: 1px solid var(--border);
    }

    .exp-item:last-child { border-bottom: none; }

    .exp-period {
      font-size: 0.8125rem;
      color: var(--text-2);
      padding-top: 0.125rem;
      white-space: nowrap;
    }

    .exp-head {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-bottom: 0.375rem;
      flex-wrap: wrap;
    }

    .exp-role { font-weight: 600; font-size: 0.9375rem; color: var(--text); }
    .exp-at { color: var(--border); }
    .exp-company { font-size: 0.9375rem; color: var(--text-2); }

    .exp-desc { font-size: 0.875rem; color: var(--text-2); line-height: 1.65; margin-top: 0.375rem; }

    /* ── Testimonials ── */
    .testi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .testi-card {
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.75rem;
      background: var(--bg);
      transition: border-color 0.15s;
    }

    .testi-card:hover { border-color: var(--text-2); }

    .testi-quote {
      font-size: 0.9375rem;
      line-height: 1.75;
      color: var(--text);
      margin-bottom: 1.25rem;
      font-style: italic;
    }

    .testi-footer { display: flex; align-items: center; gap: 0.75rem; }

    .testi-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      border: 1px solid var(--border);
    }

    .testi-avatar-letter {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: var(--bg-2);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-2);
      flex-shrink: 0;
    }

    .testi-info { display: flex; flex-direction: column; }
    .testi-info strong { font-size: 0.875rem; font-weight: 600; color: var(--text); }
    .testi-info span { font-size: 0.8125rem; color: var(--text-2); }

    /* ── Contact ── */
    .contact-inner {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .contact-email {
      font-size: clamp(1.5rem, 3vw, 2.5rem);
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
      letter-spacing: -0.025em;
      transition: color 0.15s;
      display: inline-block;
    }

    .contact-email:hover { color: var(--accent); }

    .contact-sub {
      font-size: 1rem;
      color: var(--text-2);
      line-height: 1.6;
      max-width: 480px;
    }

    /* ── Modals ── */
    .modal {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal.is-open { display: flex; }

    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
    }
    
    .blog-link:hover {
      gap: 1rem;
    }
    
    .blog-link span {
      transition: transform 0.2s;
    }
    
    .blog-link:hover span {
      transform: translateX(5px);
    }
    
    /* Contact Section */
    .contact-section {
      padding: 8rem 0;
      background: var(--bg-alt);
    }
    
    .contact-content {
      text-align: center;
      max-width: 700px;
      margin: 0 auto;
    }
    
    .contact-text {
      font-size: 1.375rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .contact-email {
      display: inline-block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
      margin-bottom: 3rem;
      transition: color 0.3s;
      position: relative;
    }
    
    .contact-email::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 3px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      transition: width 0.3s;
    }
    
    .contact-email:hover {
      color: var(--primary);
    }
    
    .contact-email:hover::after {
      width: 100%;
    }
    .modal-link:hover { border-color: var(--accent); }

    /* ── Footer ── */
    .site-footer {
      padding: 2rem 0;
      border-top: 1px solid var(--border);
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8125rem;
      color: var(--text-2);
    }

    .footer-inner a { color: var(--text-2); text-decoration: none; }
    .footer-inner a:hover { color: var(--text); }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .hero-inner { grid-template-columns: 1fr; }
      .hero-avatar { display: none; }
      .work-grid { grid-template-columns: 1fr; }
      .exp-item { grid-template-columns: 1fr; gap: 0.25rem; }
      .exp-period { font-size: 0.75rem; }
    }

    @media (max-width: 640px) {
      .container { padding: 0 1.25rem; }
      .site-nav { padding: 0 1.25rem; }
      .section { padding: 4rem 0; }
      .section-title { font-size: 1.5rem; }
      .hero { padding: 3rem 0 2.5rem; min-height: auto; }
      .hero-name { font-size: 2.25rem; }
      .testi-grid { grid-template-columns: 1fr; }
      .modal-box { padding: 1.75rem 1.25rem; }
    }

    ::selection { background: var(--accent); color: #fff; }

    /* Scroll offset for fixed nav */
    [id] { scroll-margin-top: 72px; }
  `;
}

function generateHTML(data, sections = []) {
  const accent = data.primaryColor || '#0a0a0a';
  const name = data.fullName || 'Your Name';
  const role = data.tagline || data.role || 'Professional';
  const bio = data.bio || '';
  const location = data.location || '';
  const email = data.email || '';
  const profileImage = data.profileImage || '';

  const activeSections = sections.length > 0 ? sections : defaultSections;

  const avatar = profileImage
    ? `<img src="${profileImage}" alt="${name}" />`
    : `<div class="hero-avatar-letter">${name.charAt(0).toUpperCase()}</div>`;

  const projectsHtml = buildProjects(data);
  const projectCount = (projectsHtml.match(/class="project-card"/g) || []).length;
  const skillsHtml = buildSkills(data);
  const expHtml = buildExperience(data);
  const testiHtml = buildTestimonials(data);
  const testiCount = (testiHtml.match(/class="testi-card"/g) || []).length;

  const sectionBlocks = activeSections.map(id => {
    if (id === 'work' && projectsHtml) return `
  <section class="section" id="work">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Selected Work</h2>
        ${projectCount > 0 ? `<span class="section-count">${projectCount} project${projectCount > 1 ? 's' : ''}</span>` : ''}
      </div>
      <div class="work-grid">${projectsHtml}</div>
    </div>
  </section>`;

    if (id === 'skills' && skillsHtml) return `
  <section class="section" id="skills">
    <div class="container">
      <div class="section-header"><h2 class="section-title">Skills & Tools</h2></div>
      ${skillsHtml}
    </div>
  </section>`;

    if (id === 'experience' && expHtml) return `
  <section class="section" id="experience">
    <div class="container">
      <div class="section-header"><h2 class="section-title">Experience</h2></div>
      <div class="exp-list">${expHtml}</div>
    </div>
  </section>`;

    if (id === 'testimonials' && testiHtml) return `
  <section class="section" id="testimonials">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Testimonials</h2>
        ${testiCount > 0 ? `<span class="section-count">${testiCount}</span>` : ''}
      </div>
      <div class="testi-grid">${testiHtml}</div>
    </div>
  </section>`;

    if (id === 'contact') return `
  <section class="section" id="contact">
    <div class="container">
      <div class="section-header"><h2 class="section-title">Get In Touch</h2></div>
      <div class="contact-inner">
        ${email ? `<a href="mailto:${email}" class="contact-email">${email}</a>` : ''}
        ${bio ? `<p class="contact-sub">Open to freelance projects, full-time roles, and interesting conversations.</p>` : ''}
        ${buildSocials(data, true)}
      </div>
    </div>
  </section>`;

    return '';
  }).filter(Boolean).join('');

  const porfilrFavicon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23ea580c'/%3E%3Crect x='6' y='7' width='7' height='26' rx='1.5' fill='white' transform='rotate(-8 9.5 20)'/%3E%3Crect x='19' y='7' width='7' height='19' rx='1.5' fill='white' transform='rotate(-8 22.5 16.5)'/%3E%3Crect x='6' y='7' width='20' height='7' rx='1.5' fill='white' transform='rotate(-8 16 10.5)'/%3E%3Crect x='6' y='17' width='15' height='6' rx='1.5' fill='white' transform='rotate(-8 13.5 20)'/%3E%3C/svg%3E`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} — ${role}</title>
  <meta name="description" content="${bio.slice(0, 160)}" />
  <meta name="author" content="${name}" />
  <meta property="og:title" content="${name} — ${role}" />
  <meta property="og:description" content="${bio.slice(0, 160)}" />
  <meta property="og:type" content="profile" />
  <meta name="twitter:card" content="summary" />
  <link rel="icon" type="image/svg+xml" href="${porfilrFavicon}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>${getStyles(accent)}</style>
</head>
<body>

  <!-- Nav -->
  <nav class="site-nav">
    <a href="#" class="nav-name">${name}</a>
    <div class="nav-right">
      ${buildSocials(data)}
      <button class="theme-btn" onclick="toggleTheme()" aria-label="Toggle theme">
        <svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </div>
  </nav>

  <div class="page">

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <div class="hero-inner">
          <div class="hero-text">
            ${role ? `<span class="hero-label">${role}</span>` : ''}
            <h1 class="hero-name">${name}</h1>
            ${bio ? `<p class="hero-bio">${bio}</p>` : ''}
            ${location ? `<p class="hero-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${location}</p>` : ''}
            <div class="hero-cta">
              ${activeSections.includes('work') && projectsHtml ? `<a href="#work" class="btn btn-primary">View Work</a>` : ''}
              ${email ? `<a href="mailto:${email}" class="btn btn-outline">Get in touch ↗</a>` : ''}
            </div>
          </div>
          <div class="hero-avatar">${avatar}</div>
        </div>
      </div>
    </section>

    <!-- Dynamic sections -->
    ${sectionBlocks}

    <!-- Footer -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-inner">
          <span>© ${new Date().getFullYear()} ${name}</span>
          <span>Made with <a href="https://porfilr.com" target="_blank" rel="noopener">Porfilr</a></span>
        </div>
      </div>
    </footer>

  </div>

  <!-- Project Modals -->
  ${buildProjectModals(data)}

  <script>
    // Theme
    (function() {
      const saved = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', saved);
    })();

    function toggleTheme() {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    }

    // Modals
    function openModal(n) {
      const m = document.getElementById('modal-' + n);
      if (m) { m.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
    }

    function closeModal(n) {
      const m = document.getElementById('modal-' + n);
      if (m) { m.classList.remove('is-open'); document.body.style.overflow = ''; }
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.querySelectorAll('.modal.is-open').forEach(m => {
        m.classList.remove('is-open'); document.body.style.overflow = '';
      });
    });
  </script>

  <!-- Portfolio data -->
  <script type="application/json" id="portfolio-data">
    ${JSON.stringify({ formData: data, sections: activeSections })}
  </script>
</body>
</html>`;
}

const defaultSections = ['work', 'skills', 'experience', 'testimonials', 'contact'];

const fields = [
  // Identity
  { name: 'fullName',      label: 'Full Name',        type: 'text',  section: 'personal',  required: true },
  { name: 'tagline',       label: 'Role / Title',      type: 'text',  section: 'personal',  placeholder: 'Product Designer, Software Engineer, Consultant…' },
  { name: 'bio',           label: 'Short Bio',         type: 'textarea', section: 'personal' },
  { name: 'profileImage',  label: 'Profile Photo URL', type: 'url',   section: 'personal' },
  { name: 'location',      label: 'Location',          type: 'text',  section: 'personal',  placeholder: 'San Francisco, CA' },
  { name: 'primaryColor',  label: 'Accent Color',      type: 'color', section: 'personal',  default: '#0a0a0a' },

  // Projects (6 slots, 10 fields each)
  ...([1,2,3,4,5,6].flatMap(i => [
    { name: `project${i}Title`,       label: `Project ${i} — Title`,       type: 'text',     section: 'projects' },
    { name: `project${i}Client`,      label: `Project ${i} — Client`,      type: 'text',     section: 'projects' },
    { name: `project${i}Role`,        label: `Project ${i} — Your Role`,   type: 'text',     section: 'projects' },
    { name: `project${i}Year`,        label: `Project ${i} — Year`,        type: 'text',     section: 'projects', placeholder: '2024' },
    { name: `project${i}Description`, label: `Project ${i} — Description`, type: 'textarea', section: 'projects' },
    { name: `project${i}Tags`,        label: `Project ${i} — Tags`,        type: 'text',     section: 'projects', placeholder: 'Design, React, Strategy' },
    { name: `project${i}Image`,       label: `Project ${i} — Image URL`,   type: 'url',      section: 'projects' },
    { name: `project${i}Overview`,    label: `Project ${i} — Overview`,    type: 'textarea', section: 'projects' },
    { name: `project${i}Approach`,    label: `Project ${i} — Approach`,    type: 'textarea', section: 'projects' },
    { name: `project${i}Outcome`,     label: `Project ${i} — Outcome`,     type: 'textarea', section: 'projects' },
    { name: `project${i}Link`,        label: `Project ${i} — Live Link`,   type: 'url',      section: 'projects' },
  ])),

  // Skills (16 slots)
  ...([...Array(16)].map((_, i) => ({
    name: `skill${i + 1}`, label: `Skill ${i + 1}`, type: 'text', section: 'skills',
    placeholder: i === 0 ? 'e.g. Figma, React, Python, Strategy…' : undefined,
  }))),

  // Experience (6 entries)
  ...([1,2,3,4,5,6].flatMap(i => [
    { name: `exp${i}Role`,        label: `Experience ${i} — Role`,        type: 'text',     section: 'experience' },
    { name: `exp${i}Company`,     label: `Experience ${i} — Company`,     type: 'text',     section: 'experience' },
    { name: `exp${i}Period`,      label: `Experience ${i} — Period`,      type: 'text',     section: 'experience', placeholder: '2022–2024' },
    { name: `exp${i}Description`, label: `Experience ${i} — Description`, type: 'textarea', section: 'experience' },
  ])),

  // Testimonials (6 slots)
  ...([1,2,3,4,5,6].flatMap(i => [
    { name: `testimonial${i}`,        label: `Testimonial ${i} — Quote`,       type: 'textarea', section: 'testimonials' },
    { name: `testimonial${i}Author`,  label: `Testimonial ${i} — Author Name`, type: 'text',     section: 'testimonials' },
    { name: `testimonial${i}Role`,    label: `Testimonial ${i} — Author Role`, type: 'text',     section: 'testimonials' },
    { name: `testimonial${i}Image`,   label: `Testimonial ${i} — Author Photo`,type: 'url',      section: 'testimonials' },
  ])),

  // Social
  { name: 'email',     label: 'Email',     type: 'email', section: 'social' },
  { name: 'linkedin',  label: 'LinkedIn',  type: 'url',   section: 'social' },
  { name: 'twitter',   label: 'Twitter / X', type: 'url', section: 'social' },
  { name: 'github',    label: 'GitHub',    type: 'url',   section: 'social' },
  { name: 'dribbble',  label: 'Dribbble',  type: 'url',   section: 'social' },
  { name: 'behance',   label: 'Behance',   type: 'url',   section: 'social' },
  { name: 'instagram', label: 'Instagram', type: 'url',   section: 'social' },
  { name: 'website',   label: 'Website',   type: 'url',   section: 'social' },
];

const sectionContent = {
  work:         { id: 'work',         label: 'Selected Work',  description: 'Showcase your projects' },
  skills:       { id: 'skills',       label: 'Skills & Tools', description: 'Technologies and disciplines you work with' },
  experience:   { id: 'experience',   label: 'Experience',     description: 'Work history and roles' },
  testimonials: { id: 'testimonials', label: 'Testimonials',   description: 'What people say about working with you' },
  contact:      { id: 'contact',      label: 'Contact',        description: 'How to reach you' },
};

export default { generateHTML, fields, defaultSections, sectionContent };
