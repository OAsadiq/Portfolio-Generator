// ─── Social icons ────────────────────────────────────────────────────────────
function socialIcon(type) {
  const icons = {
    linkedin:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    twitter:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    github:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    website:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  };
  return icons[type] || icons.website;
}

function buildSocials(data, inline = false) {
  const map = [
    ['linkedin', data.linkedin], ['twitter', data.twitter],
    ['github', data.github], ['website', data.website],
  ];
  const links = map.filter(([, v]) => v && v.trim()).map(([k, v]) => `
    <a href="${v}" target="_blank" rel="noopener" class="social-icon-link" title="${k}">${socialIcon(k)}</a>`).join('');
  return links ? `<div class="social-icons${inline ? ' social-icons--inline' : ''}">${links}</div>` : '';
}

// ─── Section builders (read the existing builder field model) ─────────────────
function buildSkills(data) {
  const skills = [];
  for (let i = 1; i <= 6; i++) {
    const s = data[`skill${i}`];
    if (s) skills.push(`<span class="skill-pill">${s}</span>`);
  }
  return skills;
}

function buildWork(data) {
  const cards = [];
  const modals = [];
  for (let i = 1; i <= 50; i++) {
    const title = data[`case${i}Title`];
    if (!title) continue;
    const client = data[`case${i}Client`] || '';
    const role = data[`case${i}Role`] || '';
    const desc = data[`case${i}Description`] || '';
    const image = data[`case${i}Image`] || '';
    const tags = (data[`case${i}Tags`] || '').split(',').map(t => t.trim()).filter(Boolean);
    const challenge = data[`case${i}Challenge`];
    const solution = data[`case${i}Solution`];
    const results = data[`case${i}Results`];
    const hasDetail = challenge || solution || results;

    const tagHtml = tags.map(t => `<span class="tag">${t}</span>`).join('');
    const media = image
      ? `<img src="${image}" alt="${title}" class="project-img" />`
      : `<div class="project-img-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" opacity="0.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

    cards.push(`
    <article class="project-card">
      <div class="project-media">
        ${media}
        ${hasDetail ? `<div class="project-overlay"><button class="proj-btn proj-btn--detail" onclick="openModal(${i})">View details</button></div>` : ''}
      </div>
      <div class="project-body">
        ${(client || role) ? `<div class="project-meta">
          ${client ? `<span class="project-client">${client}</span>` : ''}
          ${(client && role) ? '<span class="meta-sep">·</span>' : ''}
          ${role ? `<span class="project-role">${role}</span>` : ''}
        </div>` : ''}
        <h3 class="project-title">${title}</h3>
        ${desc ? `<p class="project-desc">${desc}</p>` : ''}
        ${tagHtml ? `<div class="project-tags">${tagHtml}</div>` : ''}
      </div>
    </article>`);

    if (hasDetail) {
      const sections = [
        challenge && `<div class="modal-section"><h4>Challenge</h4><p>${challenge}</p></div>`,
        solution && `<div class="modal-section"><h4>Approach</h4><p>${solution}</p></div>`,
        results && `<div class="modal-section"><h4>Results</h4><p>${results}</p></div>`,
      ].filter(Boolean).join('');
      modals.push(`
  <div id="modal-${i}" class="modal" role="dialog" aria-modal="true">
    <div class="modal-backdrop" onclick="closeModal(${i})"></div>
    <div class="modal-box">
      <button class="modal-close" onclick="closeModal(${i})" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      <h2 class="modal-title">${title}</h2>
      <div class="modal-sections">${sections}</div>
    </div>
  </div>`);
    }
  }
  return { cards, modals };
}

function buildBlog(data) {
  const cards = [];
  for (let i = 1; i <= 50; i++) {
    const title = data[`blog${i}Title`];
    if (!title) continue;
    const excerpt = data[`blog${i}Excerpt`] || '';
    const date = data[`blog${i}Date`] || '';
    const readTime = data[`blog${i}ReadTime`] || '';
    const category = data[`blog${i}Category`] || '';
    const link = data[`blog${i}Link`] || '#';
    cards.push(`
    <a href="${link}" target="_blank" rel="noopener" class="blog-card">
      ${category ? `<span class="blog-cat">${category}</span>` : ''}
      <h3 class="blog-title">${title}</h3>
      ${excerpt ? `<p class="blog-excerpt">${excerpt}</p>` : ''}
      <div class="blog-meta">${[date, readTime ? `${readTime} min read` : ''].filter(Boolean).join(' · ')}</div>
    </a>`);
  }
  return cards;
}

function buildTestimonials(data) {
  const cards = [];
  for (let i = 1; i <= 50; i++) {
    const quote = data[`testimonial${i}`];
    if (!quote) continue;
    const author = data[`testimonial${i}Author`] || '';
    const role = data[`testimonial${i}Role`] || '';
    const img = data[`testimonial${i}Image`] || '';
    const avatar = img
      ? `<img src="${img}" alt="${author}" class="testi-avatar" />`
      : author ? `<div class="testi-avatar-letter">${author.charAt(0).toUpperCase()}</div>` : '';
    cards.push(`
    <blockquote class="testi-card">
      <p class="testi-quote">"${quote}"</p>
      ${(author || role) ? `<footer class="testi-footer">${avatar}<div class="testi-info">${author ? `<strong>${author}</strong>` : ''}${role ? `<span>${role}</span>` : ''}</div></footer>` : ''}
    </blockquote>`);
  }
  return cards;
}

function getStyles(accent) {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root[data-theme="light"] {
      --accent: ${accent};
      --bg: #ffffff; --bg-2: #f7f7f7;
      --text: #0a0a0a; --text-2: #6b7280; --border: #e5e7eb;
    }
    :root[data-theme="dark"] {
      --accent: ${accent};
      --bg: #0a0a0a; --bg-2: #141414;
      --text: #f5f5f5; --text-2: #9ca3af; --border: #262626;
    }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; transition: background .2s, color .2s; }
    .container { max-width: 1080px; margin: 0 auto; padding: 0 2rem; }

    .site-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 56px; background: var(--bg); border-bottom: 1px solid var(--border); transition: background .2s, border-color .2s; }
    .nav-name { font-weight: 600; font-size: .9375rem; color: var(--text); text-decoration: none; letter-spacing: -.01em; }
    .nav-right { display: flex; align-items: center; gap: .75rem; }
    .social-icons { display: flex; align-items: center; gap: .25rem; }
    .social-icon-link { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; color: var(--text-2); transition: color .15s, background .15s; }
    .social-icon-link:hover { color: var(--text); background: var(--bg-2); }
    .theme-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border); background: transparent; cursor: pointer; color: var(--text-2); transition: all .15s; }
    .theme-btn:hover { color: var(--text); background: var(--bg-2); }
    :root[data-theme="light"] .icon-moon { display: none; }
    :root[data-theme="dark"] .icon-sun { display: none; }

    .page { padding-top: 56px; }
    .hero { min-height: calc(100vh - 56px); display: flex; align-items: center; padding: 5rem 0 4rem; }
    .hero-inner { display: grid; grid-template-columns: 1fr auto; gap: 4rem; align-items: center; width: 100%; }
    .hero-label { display: inline-flex; align-items: center; gap: .5rem; font-size: .8125rem; font-weight: 500; color: var(--accent); letter-spacing: .04em; text-transform: uppercase; margin-bottom: 1.25rem; padding: .35rem .875rem; border: 1px solid var(--accent); border-radius: 100px; }
    .hero-name { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700; letter-spacing: -.03em; line-height: 1.1; margin-bottom: 1.5rem; }
    .hero-bio { font-size: 1.125rem; color: var(--text-2); max-width: 520px; line-height: 1.75; margin-bottom: 2rem; }
    .hero-cta { display: flex; gap: .75rem; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: .5rem; padding: .75rem 1.5rem; border-radius: 10px; font-size: .9375rem; font-weight: 500; text-decoration: none; transition: all .15s; cursor: pointer; border: none; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { opacity: .85; transform: translateY(-1px); }
    .btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
    .btn-outline:hover { border-color: var(--text-2); background: var(--bg-2); }
    .hero-avatar { width: 220px; height: 220px; border-radius: 20px; overflow: hidden; flex-shrink: 0; background: var(--bg-2); border: 1px solid var(--border); }
    .hero-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hero-avatar-letter { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 4.5rem; font-weight: 700; color: var(--text-2); letter-spacing: -.03em; }

    .section { padding: 6rem 0; border-top: 1px solid var(--border); }
    .section-header { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 3rem; }
    .section-title { font-size: 1.75rem; font-weight: 700; letter-spacing: -.025em; }
    .section-count { font-size: .8125rem; color: var(--text-2); }
    .about-text { font-size: 1.25rem; line-height: 1.75; color: var(--text-2); max-width: 760px; }

    .skills-wrap { display: flex; flex-wrap: wrap; gap: .625rem; }
    .skill-pill { font-size: .875rem; padding: .5rem 1rem; border-radius: 100px; border: 1px solid var(--border); color: var(--text); font-weight: 500; transition: border-color .15s, color .15s; }
    .skill-pill:hover { border-color: var(--accent); color: var(--accent); }

    .work-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .project-card { border: 1px solid var(--border); border-radius: 14px; overflow: hidden; background: var(--bg); transition: border-color .15s, box-shadow .15s; }
    .project-card:hover { border-color: var(--text-2); box-shadow: 0 4px 24px rgba(0,0,0,.06); }
    .project-media { position: relative; height: 200px; background: var(--bg-2); overflow: hidden; }
    .project-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s; }
    .project-card:hover .project-img { transform: scale(1.03); }
    .project-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .project-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .2s; }
    .project-card:hover .project-overlay { opacity: 1; }
    .proj-btn { padding: .625rem 1.25rem; border-radius: 8px; font-size: .875rem; font-weight: 500; cursor: pointer; border: none; background: #fff; color: #000; }
    .project-body { padding: 1.25rem 1.5rem 1.5rem; }
    .project-meta { display: flex; align-items: center; gap: .5rem; margin-bottom: .5rem; font-size: .8125rem; color: var(--text-2); }
    .project-client { font-weight: 500; color: var(--accent); }
    .meta-sep { color: var(--border); }
    .project-title { font-size: 1.125rem; font-weight: 600; letter-spacing: -.01em; margin-bottom: .5rem; line-height: 1.35; }
    .project-desc { font-size: .9rem; color: var(--text-2); line-height: 1.65; margin-bottom: .875rem; }
    .project-tags { display: flex; flex-wrap: wrap; gap: .375rem; }
    .tag { font-size: .75rem; padding: .25rem .625rem; border-radius: 100px; background: var(--bg-2); color: var(--text-2); border: 1px solid var(--border); font-weight: 500; }

    .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
    .blog-card { display: block; border: 1px solid var(--border); border-radius: 14px; padding: 1.75rem; background: var(--bg); text-decoration: none; color: inherit; transition: border-color .15s; }
    .blog-card:hover { border-color: var(--accent); }
    .blog-cat { display: inline-block; font-size: .6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--accent); margin-bottom: .75rem; }
    .blog-title { font-size: 1.125rem; font-weight: 600; margin-bottom: .5rem; line-height: 1.4; }
    .blog-excerpt { font-size: .9rem; color: var(--text-2); line-height: 1.6; margin-bottom: 1rem; }
    .blog-meta { font-size: .8125rem; color: var(--text-2); }

    .testi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
    .testi-card { border: 1px solid var(--border); border-radius: 14px; padding: 1.75rem; background: var(--bg); transition: border-color .15s; }
    .testi-card:hover { border-color: var(--text-2); }
    .testi-quote { font-size: .9375rem; line-height: 1.75; color: var(--text); margin-bottom: 1.25rem; font-style: italic; }
    .testi-footer { display: flex; align-items: center; gap: .75rem; }
    .testi-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid var(--border); }
    .testi-avatar-letter { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: .875rem; font-weight: 600; color: var(--text-2); flex-shrink: 0; }
    .testi-info { display: flex; flex-direction: column; }
    .testi-info strong { font-size: .875rem; font-weight: 600; }
    .testi-info span { font-size: .8125rem; color: var(--text-2); }

    .contact-inner { display: flex; flex-direction: column; align-items: flex-start; gap: 1.5rem; }
    .contact-email { font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 700; color: var(--text); text-decoration: none; letter-spacing: -.025em; transition: color .15s; }
    .contact-email:hover { color: var(--accent); }
    .contact-sub { font-size: 1rem; color: var(--text-2); line-height: 1.6; max-width: 480px; }

    .modal { display: none; position: fixed; inset: 0; z-index: 1000; align-items: center; justify-content: center; padding: 1.5rem; }
    .modal.is-open { display: flex; }
    .modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); }
    .modal-box { position: relative; background: var(--bg); border-radius: 16px; padding: 2.5rem; max-width: 640px; width: 100%; max-height: 88vh; overflow-y: auto; border: 1px solid var(--border); box-shadow: 0 24px 48px rgba(0,0,0,.15); }
    .modal-close { position: absolute; top: 1.25rem; right: 1.25rem; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); cursor: pointer; color: var(--text-2); }
    .modal-close:hover { background: var(--bg-2); color: var(--text); }
    .modal-title { font-size: 1.5rem; font-weight: 700; letter-spacing: -.02em; margin-bottom: 1.75rem; padding-right: 2.5rem; }
    .modal-sections { display: flex; flex-direction: column; gap: 1.5rem; }
    .modal-section h4 { font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-2); margin-bottom: .5rem; }
    .modal-section p { font-size: .9375rem; line-height: 1.75; color: var(--text); }

    .site-footer { padding: 2rem 0; border-top: 1px solid var(--border); }
    .footer-inner { display: flex; align-items: center; justify-content: space-between; font-size: .8125rem; color: var(--text-2); }
    .footer-inner a { color: var(--text-2); text-decoration: none; }
    .footer-inner a:hover { color: var(--text); }

    @media (max-width: 900px) {
      .hero-inner { grid-template-columns: 1fr; }
      .hero-avatar { display: none; }
      .work-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .container { padding: 0 1.25rem; }
      .site-nav { padding: 0 1.25rem; }
      .section { padding: 4rem 0; }
      .hero { padding: 3rem 0 2.5rem; min-height: auto; }
      .hero-name { font-size: 2.25rem; }
      .testi-grid, .blog-grid { grid-template-columns: 1fr; }
      .modal-box { padding: 1.75rem 1.25rem; }
    }
    ::selection { background: var(--accent); color: #fff; }
    [id] { scroll-margin-top: 72px; }
  `;
}

function generateHTML(data, sections = []) {
  const accent = data.primaryColor || '#0a0a0a';
  const name = data.fullName || 'Your Name';
  const role = data.tagline || data.headline || 'Professional';
  const bio = data.bio || '';
  const email = data.email || '';
  const profileImage = data.profileImage || '';

  const avatar = profileImage
    ? `<img src="${profileImage}" alt="${name}" />`
    : `<div class="hero-avatar-letter">${name.charAt(0).toUpperCase()}</div>`;

  const skills = buildSkills(data);
  const { cards: workCards, modals: workModals } = buildWork(data);
  const blogCards = buildBlog(data);
  const testiCards = buildTestimonials(data);

  const hasWork = workCards.length > 0;

  const sectionContent = {
    hero: () => `
  <section class="hero" id="hero">
    <div class="container">
      <div class="hero-inner">
        <div class="hero-text">
          ${role ? `<span class="hero-label">${role}</span>` : ''}
          <h1 class="hero-name">${name}</h1>
          ${bio ? `<p class="hero-bio">${bio}</p>` : ''}
          <div class="hero-cta">
            ${hasWork ? `<a href="#work" class="btn btn-primary">View Work</a>` : ''}
            ${email ? `<a href="mailto:${email}" class="btn btn-outline">Get in touch ↗</a>` : ''}
          </div>
        </div>
        <div class="hero-avatar">${avatar}</div>
      </div>
    </div>
  </section>`,

    about: () => bio ? `
  <section class="section" id="about">
    <div class="container">
      <div class="section-header"><h2 class="section-title">About</h2></div>
      <p class="about-text">${bio}</p>
    </div>
  </section>` : '',

    skills: () => skills.length ? `
  <section class="section" id="skills">
    <div class="container">
      <div class="section-header"><h2 class="section-title">Skills &amp; Tools</h2></div>
      <div class="skills-wrap">${skills.join('')}</div>
    </div>
  </section>` : '',

    'case-studies': () => hasWork ? `
  <section class="section" id="work">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Selected Work</h2>
        <span class="section-count">${workCards.length} project${workCards.length > 1 ? 's' : ''}</span>
      </div>
      <div class="work-grid">${workCards.join('')}</div>
    </div>
  </section>`: '',

    blog: () => blogCards.length ? `
  <section class="section" id="blog">
    <div class="container">
      <div class="section-header"><h2 class="section-title">Writing</h2></div>
      <div class="blog-grid">${blogCards.join('')}</div>
    </div>
  </section>` : '',

    testimonials: () => testiCards.length ? `
  <section class="section" id="testimonials">
    <div class="container">
      <div class="section-header"><h2 class="section-title">Testimonials</h2></div>
      <div class="testi-grid">${testiCards.join('')}</div>
    </div>
  </section>` : '',

    contact: () => `
  <section class="section" id="contact">
    <div class="container">
      <div class="section-header"><h2 class="section-title">Get In Touch</h2></div>
      <div class="contact-inner">
        ${email ? `<a href="mailto:${email}" class="contact-email">${email}</a>` : ''}
        <p class="contact-sub">Open to freelance projects, full-time roles, and interesting conversations.</p>
        ${buildSocials(data, true)}
      </div>
    </div>
  </section>`,

    footer: () => `
  <footer class="site-footer" id="footer">
    <div class="container">
      <div class="footer-inner">
        <span>© ${new Date().getFullYear()} ${name}</span>
        <span>Made with <a href="https://porfilr.com" target="_blank" rel="noopener">Porfilr</a></span>
      </div>
    </div>
  </footer>`,
  };

  const defaultSections = [
    { id: 'hero', enabled: true, order: 0 },
    { id: 'about', enabled: true, order: 1 },
    { id: 'skills', enabled: true, order: 2 },
    { id: 'case-studies', enabled: true, order: 3 },
    { id: 'testimonials', enabled: true, order: 4 },
    { id: 'contact', enabled: true, order: 5 },
    { id: 'footer', enabled: true, order: 6 },
  ];

  const activeSections = (sections && sections.length > 0) ? sections : defaultSections;
  const sorted = [...activeSections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Footer should always render last even if not in saved sections
  let body = sorted
    .filter(s => (s.enabled === undefined ? true : s.enabled) && sectionContent[s.id])
    .map(s => sectionContent[s.id]())
    .join('');
  if (!sorted.some(s => s.id === 'footer')) body += sectionContent.footer();

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
    ${body}
  </div>
  ${workModals.join('')}
  <script>
    (function(){ var s = localStorage.getItem('theme') || 'light'; document.documentElement.setAttribute('data-theme', s); })();
    function toggleTheme(){ var c = document.documentElement.getAttribute('data-theme'); var n = c === 'light' ? 'dark' : 'light'; document.documentElement.setAttribute('data-theme', n); localStorage.setItem('theme', n); }
    function openModal(n){ var m = document.getElementById('modal-' + n); if (m){ m.classList.add('is-open'); document.body.style.overflow = 'hidden'; } }
    function closeModal(n){ var m = document.getElementById('modal-' + n); if (m){ m.classList.remove('is-open'); document.body.style.overflow = ''; } }
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') document.querySelectorAll('.modal.is-open').forEach(function(m){ m.classList.remove('is-open'); document.body.style.overflow = ''; }); });
  </script>
  <script type="application/json" id="portfolio-data">${JSON.stringify({ formData: data, sections: activeSections })}</script>
</body>
</html>`;
}

const modernTemplate = {
  id: 'modern-writer-template',
  name: 'Modern Portfolio',
  description: 'Clean, minimal, universal portfolio that works for any profession.',
  thumbnail: '/images/modern-template.jpg',
  isPro: true,
  generateHTML,
};

export default modernTemplate;
