// Helper functions (defined outside template object)
function getSocialIcon(type) {
  const icons = {
    linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    github: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    dribbble: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.628 0-12 5.373-12 12s5.372 12 12 12 12-5.373 12-12-5.372-12-12-12zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.301 2.431-.301 2.275 0 4.368.779 6.043 2.059zm-10.516-.993c1.331 1.742 2.511 3.538 3.537 5.381-2.43.715-5.331 1.082-8.684 1.105.692-2.835 2.601-5.193 5.147-6.486zm-5.44 8.834l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48-1.65-1.57-2.748-3.684-2.296-6.334zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027.928 2.42 1.609 4.91 2.043 7.46-3.349 1.291-7.418.788-9.641-1.433zm11.586.43c-.438-2.353-1.08-4.653-1.92-6.897 1.876-.265 3.94-.196 6.199.196-.437 2.786-2.048 5.191-4.279 6.701z"/></svg>',
    behance: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/></svg>',
    website: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
  };
  return icons[type] || icons.website;
}

function buildSocialLinks(data) {
  const socialLinks = [];
  if (data.linkedin) socialLinks.push({ name: 'LinkedIn', url: data.linkedin, icon: 'linkedin' });
  if (data.twitter) socialLinks.push({ name: 'Twitter', url: data.twitter, icon: 'twitter' });
  if (data.github) socialLinks.push({ name: 'GitHub', url: data.github, icon: 'github' });
  if (data.dribbble) socialLinks.push({ name: 'Dribbble', url: data.dribbble, icon: 'dribbble' });
  if (data.behance) socialLinks.push({ name: 'Behance', url: data.behance, icon: 'behance' });
  if (data.website) socialLinks.push({ name: 'Website', url: data.website, icon: 'website' });
  
  if (socialLinks.length === 0) return '';
  
  return socialLinks.map(social => `
    <a href="${social.url}" target="_blank" class="social-link" data-social="${social.name.toLowerCase()}">
      ${getSocialIcon(social.icon)}
      <span>${social.name}</span>
    </a>
  `).join('');
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
    
    caseStudiesHTML += `
      <article class="case-study" data-aos="fade-up">
        ${image ? `
          <div class="case-image">
            <img src="${image}" alt="${title}" />
            <div class="case-overlay">
              <button class="view-case" onclick="openCaseModal(${i})">View Case Study</button>
            </div>
          </div>
        ` : ''}
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
          <button class="read-more" onclick="openCaseModal(${i})">Read Full Case Study →</button>
        </div>
      </article>
      
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
    const image = data[`blog${i}Image`];
    
    blogHTML += `
      <article class="blog-card" data-aos="fade-up" data-aos-delay="${(i-1) * 100}">
        ${image ? `
          <div class="blog-image">
            <img src="${image}" alt="${title}" />
            ${category ? `<span class="blog-category">${category}</span>` : ''}
          </div>
        ` : ''}
        <div class="blog-content">
          <div class="blog-meta">
            ${date ? `<time>${date}</time>` : ''}
            ${readTime ? `<span>${readTime} min read</span>` : ''}
          </div>
          <h3 class="blog-title">${title}</h3>
          ${excerpt ? `<p class="blog-excerpt">${excerpt}</p>` : ''}
          ${link ? `
            <a href="${link}" target="_blank" class="blog-link">
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
  id: "modern-portfolio-template",
  name: "Modern Portfolio",
  description: "Premium template with animations, video backgrounds, dark mode, and interactive elements",
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
            skillsHTML += `
              <div class="skill-card" data-aos="flip-left" data-aos-delay="${i * 50}">
                <div class="skill-icon">💎</div>
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root[data-theme="light"] {
      --primary: ${primaryColor};
      --accent: ${accentColor};
      --bg: #ffffff;
      --bg-alt: #f8fafc;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --shadow: rgba(0, 0, 0, 0.1);
    }
    
    :root[data-theme="dark"] {
      --primary: ${primaryColor};
      --accent: ${accentColor};
      --bg: #0f172a;
      --bg-alt: #1e293b;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --border: #334155;
      --shadow: rgba(0, 0, 0, 0.5);
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    body {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      transition: background 0.3s, color 0.3s;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    /* Theme Toggle */
    .theme-toggle-fixed {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 1000;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid var(--border);
      background: var(--bg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      transition: all 0.3s;
      box-shadow: 0 4px 12px var(--shadow);
    }
    
    .theme-toggle-fixed:hover {
      transform: scale(1.1);
      border-color: var(--primary);
    }
    
    [data-theme="light"] .moon-icon,
    [data-theme="dark"] .sun-icon {
      display: none;
    }
    
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
      overflow: hidden;
      padding: 4rem 2rem;
    }
    
    .hero-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      opacity: 0.3;
    }
    
    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, ${primaryColor}20, ${accentColor}10);
      z-index: 1;
    }
    
    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .hero-avatar {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 5px solid var(--primary);
      box-shadow: 0 20px 40px var(--shadow);
      margin-bottom: 2rem;
    }
    
    .hero-avatar-letter {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      font-weight: 900;
      color: white;
      margin: 0 auto 2rem;
      box-shadow: 0 20px 40px var(--shadow);
    }
    
    .hero-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(3rem, 8vw, 5rem);
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero-tagline {
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--text);
      margin-bottom: 1.5rem;
      font-weight: 500;
    }
    
    .hero-bio {
      font-size: 1.25rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto 2.5rem;
      line-height: 1.8;
    }
    
    .hero-cta {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 4rem;
    }
    
    .btn {
      padding: 1rem 2.5rem;
      border-radius: 50px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
      display: inline-block;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
      box-shadow: 0 10px 30px ${primaryColor}40;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px ${primaryColor}60;
    }
    
    .btn-secondary {
      background: transparent;
      color: var(--text);
      border: 2px solid var(--border);
    }
    
    .btn-secondary:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    
    .scroll-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    
    .scroll-arrow {
      width: 24px;
      height: 40px;
      border: 2px solid var(--text-muted);
      border-radius: 12px;
      position: relative;
      animation: scroll 2s infinite;
    }
    
    .scroll-arrow::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 8px;
      background: var(--text-muted);
      border-radius: 2px;
      animation: scroll-dot 2s infinite;
    }
    
    @keyframes scroll {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    
    @keyframes scroll-dot {
      0% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(12px); }
      100% { transform: translateX(-50%) translateY(0); }
    }
    
    /* Section Title */
    .section-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      margin-bottom: 3rem;
      text-align: center;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* About Section */
    .about-section {
      padding: 8rem 0;
      background: var(--bg-alt);
    }
    
    .about-content p {
      font-size: 1.25rem;
      line-height: 1.8;
      color: var(--text-muted);
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    
    /* Skills Section */
    .skills-section {
      padding: 8rem 0;
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 4rem;
    }
    
    .skill-card {
      background: var(--bg-alt);
      border: 2px solid var(--border);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      text-align: center;
      transition: all 0.3s;
      cursor: pointer;
    }
    
    .skill-card:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: var(--primary);
      box-shadow: 0 20px 40px var(--shadow);
    }
    
    .skill-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
      filter: grayscale(0.3);
      transition: filter 0.3s;
    }
    
    .skill-card:hover .skill-icon {
      filter: grayscale(0);
    }
    
    .skill-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
    }
    
    /* Case Studies Section */
    .case-studies-section {
      padding: 8rem 0;
      background: var(--bg-alt);
    }
    
    .case-studies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 3rem;
      margin-top: 4rem;
    }
    
    .case-study {
      background: var(--bg);
      border-radius: 20px;
      overflow: hidden;
      border: 2px solid var(--border);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .case-study:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px var(--shadow);
      border-color: var(--primary);
    }
    
    .case-image {
      position: relative;
      height: 250px;
      overflow: hidden;
      background: var(--bg-alt);
    }
    
    .case-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    .case-study:hover .case-image img {
      transform: scale(1.1);
    }
    
    .case-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 2rem;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .case-study:hover .case-overlay {
      opacity: 1;
    }
    
    .view-case {
      padding: 0.875rem 2rem;
      background: white;
      color: #000;
      border: none;
      border-radius: 50px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.9375rem;
    }
    
    .view-case:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    
    .case-content {
      padding: 2rem;
    }
    
    .case-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      flex-wrap: wrap;
    }
    
    .case-client {
      color: var(--primary);
      font-weight: 600;
    }
    
    .case-role {
      color: var(--text-muted);
    }
    
    .case-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text);
      line-height: 1.3;
    }
    
    .case-description {
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }
    
    .case-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    
    .tag {
      padding: 0.375rem 0.875rem;
      background: var(--bg-alt);
      border: 1px solid var(--border);
      border-radius: 20px;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    
    .read-more {
      background: transparent;
      border: none;
      color: var(--primary);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9375rem;
      padding: 0;
    }
    
    .read-more:hover {
      transform: translateX(5px);
    }
    
    /* Case Study Modal */
    .case-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      animation: fadeIn 0.3s ease;
    }
    
    .case-modal.active {
      display: flex;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(10px);
    }
    
    .modal-content {
      position: relative;
      background: var(--bg);
      border-radius: 24px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 3rem;
      box-shadow: 0 30px 60px rgba(0,0,0,0.5);
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--border);
      background: var(--bg);
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
    }
    
    .modal-close:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      transform: rotate(90deg);
    }
    
    .modal-hero-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 16px;
      margin-bottom: 2rem;
    }
    
    .modal-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text);
      line-height: 1.2;
    }
    
    .modal-meta {
      display: flex;
      gap: 2rem;
      margin-bottom: 2.5rem;
      color: var(--text-muted);
      flex-wrap: wrap;
    }
    
    .modal-meta strong {
      color: var(--text);
    }
    
    .modal-body {
      margin-top: 2rem;
    }
    
    .modal-section {
      margin-bottom: 2.5rem;
    }
    
    .modal-section h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--text);
      font-weight: 600;
    }
    
    .modal-section p {
      color: var(--text-muted);
      line-height: 1.8;
      font-size: 1.125rem;
    }
    
    /* Blog Section */
    .blog-section {
      padding: 8rem 0;
    }
    
    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2.5rem;
      margin-top: 4rem;
    }
    
    .blog-card {
      background: var(--bg-alt);
      border-radius: 20px;
      overflow: hidden;
      border: 2px solid var(--border);
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
    }
    
    .blog-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px var(--shadow);
      border-color: var(--primary);
    }
    
    .blog-image {
      position: relative;
      height: 200px;
      overflow: hidden;
      background: var(--bg);
    }
    
    .blog-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    .blog-card:hover .blog-image img {
      transform: scale(1.1);
    }
    
    .blog-category {
      position: absolute;
      top: 1rem;
      left: 1rem;
      padding: 0.5rem 1rem;
      background: var(--primary);
      color: white;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .blog-content {
      padding: 2rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .blog-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .blog-title {
      font-size: 1.375rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text);
      line-height: 1.4;
    }
    
    .blog-excerpt {
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      flex: 1;
    }
    
    .blog-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
      align-self: flex-start;
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
    
    .social-links {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    
    .social-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.75rem;
      background: var(--bg);
      border: 2px solid var(--border);
      border-radius: 50px;
      color: var(--text);
      text-decoration: none;
      transition: all 0.3s;
      font-weight: 500;
    }
    
    .social-link:hover {
      border-color: var(--primary);
      transform: translateY(-3px);
      box-shadow: 0 10px 25px var(--shadow);
      background: var(--primary);
      color: white;
    }
    
    .social-link svg {
      width: 20px;
      height: 20px;
    }
    
    /* Footer */
    .footer {
      padding: 3rem 0;
      background: var(--bg);
      border-top: 2px solid var(--border);
    }
    
    .footer .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer p {
      color: var(--text-muted);
      font-size: 0.9375rem;
    }
    
    .footer a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    
    ::-webkit-scrollbar-track {
      background: var(--bg-alt);
    }
    
    ::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: var(--primary);
    }
    
    /* Selection */
    ::selection {
      background: var(--primary);
      color: white;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .hero {
        padding: 3rem 1.5rem;
      }
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-tagline {
        font-size: 1.25rem;
      }
      
      .hero-cta {
        flex-direction: column;
        width: 100%;
      }
      
      .btn {
        width: 100%;
      }
      
      .section-title {
        font-size: 2rem;
      }
      
      .skills-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      
      .case-studies-grid,
      .blog-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      .footer .container {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }
      
      .modal-content {
        padding: 2rem 1.5rem;
      }
      
      .modal-header h2 {
        font-size: 2rem;
      }
      
      .theme-toggle-fixed {
        top: 1rem;
        right: 1rem;
      }
      
      .contact-email {
        font-size: 1.5rem;
      }
      
      .about-section,
      .skills-section,
      .case-studies-section,
      .blog-section,
      .contact-section {
        padding: 5rem 0;
      }
    }
    
    @media (max-width: 480px) {
      .container {
        padding: 0 1.25rem;
      }
      
      .hero-avatar,
      .hero-avatar-letter {
        width: 120px;
        height: 120px;
      }
      
      .hero-avatar-letter {
        font-size: 3rem;
      }
      
      .case-image,
      .blog-image {
        height: 180px;
      }
    }
  `;
}

export default modernTemplate;