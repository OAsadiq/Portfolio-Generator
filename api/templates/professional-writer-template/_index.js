// ─── Icons ────────────────────────────────────────────────────────────────────
function getSocialIcon(type) {
  const icons = {
    linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    twitter: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    globe: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  };
  return icons[type] || icons.globe;
}

function getSampleIcon() {
  return `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
}

function buildSocialLinks(data) {
  const links = [
    ['linkedin', data.linkedin], ['twitter', data.twitter],
    ['instagram', data.instagram], ['globe', data.website],
  ].filter(([, v]) => v && v.trim());
  if (!links.length) return '';
  return `<div class="side-socials">${links.map(([icon, url]) =>
    `<a href="${url}" target="_blank" rel="noopener" class="side-social" title="${icon}">${getSocialIcon(icon)}</a>`).join('')}</div>`;
}

function buildServices(data) {
  const out = [];
  for (let i = 1; i <= 6; i++) {
    const title = data[`service${i}Title`];
    if (!title) continue;
    out.push(`
    <div class="service-card">
      <h3 class="service-title">${title}</h3>
      ${data[`service${i}Desc`] ? `<p class="service-desc">${data[`service${i}Desc`]}</p>` : ''}
    </div>`);
  }
  return out;
}

function buildEducation(data) {
  const out = [];
  for (let i = 1; i <= 6; i++) {
    const title = data[`edu${i}Title`];
    if (!title) continue;
    out.push(`
    <div class="edu-item">
      <div class="edu-year">${data[`edu${i}Year`] || ''}</div>
      <div class="edu-body">
        <div class="edu-title">${title}</div>
        ${data[`edu${i}School`] ? `<div class="edu-school">${data[`edu${i}School`]}</div>` : ''}
      </div>
    </div>`);
  }
  return out;
}

function buildExperience(data) {
  const out = [];
  for (let i = 1; i <= 6; i++) {
    const role = data[`exp${i}Role`];
    if (!role) continue;
    out.push(`
    <div class="exp-item">
      <div class="exp-period">${data[`exp${i}Period`] || ''}</div>
      <div class="exp-body">
        <div class="exp-head"><span class="exp-role">${role}</span>${data[`exp${i}Company`] ? `<span class="exp-at">at</span><span class="exp-company">${data[`exp${i}Company`]}</span>` : ''}</div>
        ${data[`exp${i}Description`] ? `<p class="exp-desc">${data[`exp${i}Description`]}</p>` : ''}
      </div>
    </div>`);
  }
  return out;
}

function buildSamples(data) {
  let cards = '', modals = '';
  for (let i = 1; i <= 50; i++) {
    const title = data[`sample${i}Title`];
    if (!title) continue;
    const type = data[`sample${i}Type`];
    const desc = data[`sample${i}Description`];
    const content = data[`sample${i}Content`];
    const link = data[`sample${i}Link`];
    const image = data[`sample${i}Image`];
    const hasContent = content && content.trim();
    const hasLink = link && link.trim();
    const media = image
      ? `<img src="${image}" alt="${title}" class="sample-img" />`
      : `<div class="sample-icon">${getSampleIcon()}</div>`;
    cards += `
      <article class="sample-card">
        <div class="sample-media">${media}</div>
        <div class="sample-body">
          ${type ? `<span class="sample-type">${type}</span>` : ''}
          <h3 class="sample-title">${title}</h3>
          ${desc ? `<p class="sample-desc">${desc}</p>` : ''}
          <div class="sample-actions">
            ${hasContent ? `<button class="sample-btn" onclick="openModal('modal-${i}')">View details →</button>` : ''}
            ${hasLink ? `<a href="${link}" target="_blank" rel="noopener" class="sample-link">Live link ↗</a>` : ''}
          </div>
        </div>
      </article>`;
    if (hasContent) {
      modals += `
      <div id="modal-${i}" class="modal">
        <div class="modal-backdrop" onclick="closeModal('modal-${i}')"></div>
        <div class="modal-box">
          <button class="modal-close" onclick="closeModal('modal-${i}')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          ${type ? `<span class="modal-type">${type}</span>` : ''}
          <h2 class="modal-title">${title}</h2>
          <div class="modal-body">${content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}</div>
          ${hasLink ? `<a href="${link}" target="_blank" rel="noopener" class="modal-cta">Visit project ↗</a>` : ''}
        </div>
      </div>`;
    }
  }
  return { cards, modals };
}

function buildTestimonials(data) {
  const out = [];
  for (let i = 1; i <= 50; i++) {
    const quote = data[`testimonial${i}`];
    if (!quote) continue;
    const author = data[`testimonial${i}Author`] || '';
    const role = data[`testimonial${i}Role`] || '';
    const image = data[`testimonial${i}Image`] || '';
    const avatar = image
      ? `<img src="${image}" alt="${author}" class="testi-avatar" />`
      : author ? `<div class="testi-avatar-letter">${author.charAt(0).toUpperCase()}</div>` : '';
    out.push(`
    <blockquote class="testi-card">
      <svg class="testi-quote-mark" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 4C6.46 4 4 6.46 4 9.5c0 2.5 1.67 4.6 3.95 5.28-.13.9-.6 2.1-1.95 3.22-.3.25-.1.75.3.7C9.9 18.1 12 14.5 12 10.5V9.5C12 6.46 9.54 4 9.5 4zm9 0C15.46 4 13 6.46 13 9.5c0 2.5 1.67 4.6 3.95 5.28-.13.9-.6 2.1-1.95 3.22-.3.25-.1.75.3.7C18.9 18.1 21 14.5 21 10.5V9.5C21 6.46 18.54 4 18.5 4z"/></svg>
      <p class="testi-quote">${quote}</p>
      ${(author || role) ? `<footer class="testi-footer">${avatar}<div class="testi-info">${author ? `<strong>${author}</strong>` : ''}${role ? `<span>${role}</span>` : ''}</div></footer>` : ''}
    </blockquote>`);
  }
  return out;
}

function getStyles(primary, accent) {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: ${primary}; --accent: ${accent};
      --grad: linear-gradient(135deg, ${primary}, ${accent});
      --bg: #ffffff; --bg-2: #f8fafc; --text: #0f172a; --text-2: #64748b; --border: #e9edf2; --sidebar-w: 340px;
      --pop: #0d9488; --serif: 'Fraunces', Georgia, 'Times New Roman', serif;
    }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; }

    .layout { display: grid; grid-template-columns: var(--sidebar-w) 1fr; min-height: 100vh; background-color: var(--bg); background-image: radial-gradient(circle at 1px 1px, rgba(100,116,139,0.10) 1px, transparent 0); background-size: 22px 22px; }

    /* ── Sidebar ── */
    .sidebar { position: sticky; top: 0; align-self: start; height: 100vh; overflow-y: auto; padding: 3rem 2.25rem; border-right: 1px solid var(--border); display: flex; flex-direction: column; gap: 1.5rem; background: var(--bg-2); }
    .side-avatar { width: 96px; height: 96px; border-radius: 20px; overflow: hidden; background: var(--grad); box-shadow: 0 12px 30px rgba(15,23,42,.16); border: 3px solid #fff; }
    .side-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .side-avatar-letter { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 2.4rem; font-weight: 700; font-family: var(--serif); }
    .side-name { font-family: var(--serif); font-size: 1.85rem; font-weight: 600; letter-spacing: -.02em; line-height: 1.08; background: var(--grad); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    .side-role { font-size: .95rem; font-weight: 600; color: var(--text); margin-top: .35rem; }
    .side-location { display: flex; align-items: center; gap: .35rem; font-size: .82rem; color: var(--text-2); margin-top: .4rem; }
    .side-avail { display: inline-flex; align-items: center; gap: .5rem; font-size: .78rem; font-weight: 500; color: var(--text-2); padding: .3rem .7rem; border: 1px solid var(--border); border-radius: 100px; background: var(--bg); width: fit-content; }
    .side-avail-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,.2); }
    .side-nav { display: flex; flex-direction: column; gap: .15rem; margin-top: .5rem; }
    .side-link { display: flex; align-items: center; gap: .7rem; font-size: .9rem; color: var(--text-2); text-decoration: none; padding: .45rem .25rem; transition: color .15s; }
    .side-link .side-link-num { font-size: .72rem; font-variant-numeric: tabular-nums; color: var(--text-2); opacity: .6; width: 1.2rem; }
    .side-link:hover { color: var(--text); }
    .side-link.active { color: var(--pop); font-weight: 600; }
    .side-link.active .side-link-num { color: var(--primary); opacity: 1; }
    .side-foot { margin-top: auto; display: flex; flex-direction: column; gap: 1rem; padding-top: 1.5rem; }
    .side-actions { display: flex; flex-direction: column; gap: .6rem; }
    .side-btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; padding: .7rem 1rem; border-radius: 10px; font-size: .9rem; font-weight: 600; text-decoration: none; transition: all .15s; }
    .side-btn-primary { background: var(--grad); color: #fff; }
    .side-btn-primary:hover { opacity: .9; transform: translateY(-1px); }
    .side-btn-outline { border: 1px solid var(--border); color: var(--text); background: var(--bg); }
    .side-btn-outline:hover { border-color: var(--text-2); }
    .side-socials { display: flex; gap: .4rem; }
    .side-social { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--border); background: var(--bg); color: var(--text-2); transition: all .15s; }
    .side-social:hover { color: #fff; background: var(--primary); border-color: var(--primary); }

    /* ── Content ── */
    .content { padding: 4rem 4.5rem; max-width: 920px; }
    .section { padding: 3rem 0; }
    .section:first-child { padding-top: 1rem; }
    .section + .section { border-top: 1px solid var(--border); }
    .sec-head { margin-bottom: 2rem; }
    .sec-kicker { display: inline-flex; align-items: center; gap: .6rem; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .14em; color: var(--pop); margin-bottom: .65rem; }
    .sec-kicker::before { content: ''; width: 22px; height: 1px; background: var(--pop); }
    .sec-title { font-family: var(--serif); font-size: 2.1rem; font-weight: 600; letter-spacing: -.02em; line-height: 1.1; }
    .sec-count { font-size: .85rem; color: var(--text-2); font-weight: 400; margin-left: .6rem; -webkit-text-fill-color: var(--text-2); }
    .about-text { font-size: 1.35rem; line-height: 1.65; color: var(--text); letter-spacing: -.01em; }
    .lead-statement { font-family: var(--serif); font-size: clamp(1.7rem, 3.2vw, 2.6rem); font-weight: 500; line-height: 1.18; letter-spacing: -.02em; color: var(--text); padding-bottom: 2.5rem; border-bottom: 1px solid var(--border); }
    .lead-statement em { font-style: italic; color: var(--pop); }

    .exp-list { display: flex; flex-direction: column; }
    .exp-item { display: grid; grid-template-columns: 150px 1fr; gap: 1.5rem; padding: 1.5rem 0; border-bottom: 1px solid var(--border); }
    .exp-item:last-child { border-bottom: none; }
    .exp-period { font-size: .85rem; color: var(--text-2); font-weight: 500; padding-top: .15rem; }
    .exp-head { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; margin-bottom: .35rem; }
    .exp-role { font-size: 1.1rem; font-weight: 700; }
    .exp-at { font-size: .9rem; color: var(--text-2); }
    .exp-company { font-size: 1rem; font-weight: 600; color: var(--primary); }
    .exp-desc { font-size: .95rem; color: var(--text-2); line-height: 1.6; }

    .edu-list { display: flex; flex-direction: column; }
    .edu-item { display: grid; grid-template-columns: 90px 1fr; gap: 1.5rem; padding: 1.1rem 0; border-bottom: 1px solid var(--border); }
    .edu-item:last-child { border-bottom: none; }
    .edu-year { font-size: .85rem; color: var(--text-2); font-weight: 500; padding-top: .1rem; }
    .edu-title { font-size: 1.05rem; font-weight: 700; }
    .edu-school { font-size: .92rem; color: var(--text-2); margin-top: .15rem; }

    .services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .service-card { border: 1px solid var(--border); border-radius: 16px; padding: 1.6rem; background: var(--bg); transition: all .15s; }
    .service-card:hover { border-color: var(--primary); box-shadow: 0 8px 30px rgba(0,0,0,.05); transform: translateY(-2px); }
    .service-num { display: inline-block; font-size: .8rem; font-weight: 700; background: var(--grad); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: .9rem; }
    .service-title { font-size: 1.15rem; font-weight: 700; margin-bottom: .45rem; }
    .service-desc { font-size: .92rem; color: var(--text-2); line-height: 1.6; }

    .samples-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .sample-card { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; background: var(--bg); transition: all .2s; display: flex; flex-direction: column; }
    .sample-card:hover { border-color: var(--primary); box-shadow: 0 12px 36px rgba(0,0,0,.07); transform: translateY(-3px); }
    .sample-media { height: 170px; background: var(--bg-2); display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .sample-media .sample-img { width: 100%; height: 100%; object-fit: cover; }
    .sample-icon { color: var(--primary); }
    .sample-body { padding: 1.4rem; display: flex; flex-direction: column; flex: 1; }
    .sample-type { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--primary); margin-bottom: .6rem; }
    .sample-title { font-size: 1.2rem; font-weight: 700; margin-bottom: .5rem; line-height: 1.3; }
    .sample-desc { font-size: .92rem; color: var(--text-2); line-height: 1.6; margin-bottom: 1rem; flex: 1; }
    .sample-actions { display: flex; gap: 1rem; align-items: center; }
    .sample-btn { background: none; border: none; padding: 0; font-size: .9rem; font-weight: 600; color: var(--primary); cursor: pointer; font-family: inherit; }
    .sample-link { font-size: .9rem; font-weight: 600; color: var(--text-2); text-decoration: none; }
    .sample-link:hover { color: var(--text); }

    .testi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
    .testi-card { border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; background: var(--bg); position: relative; }
    .testi-quote-mark { color: var(--primary); opacity: .18; margin-bottom: .5rem; }
    .testi-quote { font-size: 1rem; line-height: 1.65; color: var(--text); margin-bottom: 1.25rem; }
    .testi-footer { display: flex; align-items: center; gap: .75rem; }
    .testi-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
    .testi-avatar-letter { width: 40px; height: 40px; border-radius: 50%; background: var(--grad); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .testi-info { display: flex; flex-direction: column; }
    .testi-info strong { font-size: .92rem; font-weight: 700; }
    .testi-info span { font-size: .82rem; color: var(--text-2); }

    .contact-card { border-radius: 20px; padding: 3rem; background: var(--grad); color: #fff; text-align: center; }
    .contact-card h2 { font-size: 2rem; font-weight: 800; margin-bottom: .75rem; letter-spacing: -.02em; }
    .contact-card p { font-size: 1.05rem; opacity: .92; margin-bottom: 2rem; }
    .contact-btn { display: inline-block; background: #fff; color: var(--primary); padding: .9rem 2rem; border-radius: 10px; font-weight: 700; text-decoration: none; transition: transform .15s; }
    .contact-btn:hover { transform: translateY(-2px); }

    /* Modal */
    .modal { display: none; position: fixed; inset: 0; z-index: 1000; align-items: center; justify-content: center; padding: 1.5rem; }
    .modal.is-open { display: flex; }
    .modal-backdrop { position: absolute; inset: 0; background: rgba(15,23,42,.6); backdrop-filter: blur(4px); }
    .modal-box { position: relative; background: var(--bg); border-radius: 18px; padding: 2.5rem; max-width: 640px; width: 100%; max-height: 88vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,.2); }
    .modal-close { position: absolute; top: 1.25rem; right: 1.25rem; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 9px; border: 1px solid var(--border); background: var(--bg); cursor: pointer; color: var(--text-2); }
    .modal-close:hover { color: var(--text); }
    .modal-type { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--primary); }
    .modal-title { font-family: var(--serif); font-size: 1.8rem; font-weight: 600; margin: .5rem 0 1.5rem; letter-spacing: -.02em; }
    .modal-body p { font-size: 1rem; line-height: 1.75; color: var(--text-2); margin-bottom: 1rem; }
    .modal-cta { display: inline-block; margin-top: 1rem; background: var(--grad); color: #fff; padding: .7rem 1.5rem; border-radius: 10px; font-weight: 600; text-decoration: none; }

    .credit { padding: 2rem 0 0; font-size: .8rem; color: var(--text-2); }
    .credit a { color: var(--primary); text-decoration: none; font-weight: 600; }

    .reveal { opacity: 0; transform: translateY(16px); transition: opacity .6s ease, transform .6s ease; }
    .reveal.in { opacity: 1; transform: none; }
    @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }

    @media (max-width: 980px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { position: static; height: auto; border-right: none; border-bottom: 1px solid var(--border); }
      .side-nav { display: none; }
      .side-foot { margin-top: 1rem; }
      .content { padding: 2.5rem 1.5rem; }
      .services-grid, .samples-grid, .testi-grid { grid-template-columns: 1fr; }
      .exp-item { grid-template-columns: 1fr; gap: .25rem; }
    }
    ::selection { background: var(--primary); color: #fff; }
    [id] { scroll-margin-top: 1.5rem; }
  `;
}

function generateHTML(data, sections = []) {
  const name = data.fullName || "Your Name";
  const role = data.headline || "Professional";
  const bio = data.bio || "";
  const profile = data.profileImage || "";
  const email = data.email || "";
  const primary = data.primaryColor || "#475569";
  const accent = data.accentColor || "#1e293b";
  const resumeUrl = data.resumeUrl || "";
  const showAvail = data.availability === "true" || data.availability === true;
  const availText = data.availabilityText || "Available for work";
  const statement = data.statement || "";
  const location = data.location || "";

  const services = buildServices(data);
  const experience = buildExperience(data);
  const education = buildEducation(data);
  const { cards: sampleCards, modals: sampleModals } = buildSamples(data);
  const hasSamples = sampleCards.trim().length > 0;
  const testimonials = buildTestimonials(data);

  const head = (title, kicker) => `<div class="sec-head"><div class="sec-kicker">${kicker}</div><h2 class="sec-title">${title}</h2></div>`;

  const sectionContent = {
    about: () => bio ? `<section class="section reveal" id="about">${head('About', 'Profile')}<p class="about-text">${bio}</p></section>` : '',
    experience: () => experience.length ? `<section class="section reveal" id="experience">${head('Experience', 'Career')}<div class="exp-list">${experience.join('')}</div></section>` : '',
    services: () => services.length ? `<section class="section reveal" id="services">${head('Services', 'Offerings')}<div class="services-grid">${services.join('')}</div></section>` : '',
    samples: () => hasSamples ? `<section class="section reveal" id="work">${head('Selected Work', 'Portfolio')}<div class="samples-grid">${sampleCards}</div></section>` : '',
    testimonials: () => testimonials.length ? `<section class="section reveal" id="testimonials">${head('Testimonials', 'Praise')}<div class="testi-grid">${testimonials.join('')}</div></section>` : '',
    education: () => education.length ? `<section class="section reveal" id="education">${head('Education & Certifications', 'Background')}<div class="edu-list">${education.join('')}</div></section>` : '',
  };

  const navLabels = { about: 'About', experience: 'Experience', services: 'Services', samples: 'Work', testimonials: 'Testimonials', education: 'Education' };
  const navTarget = { about: 'about', experience: 'experience', services: 'services', samples: 'work', testimonials: 'testimonials', education: 'education' };

  const defaultSections = [
    { id: 'about', enabled: true, order: 0 },
    { id: 'experience', enabled: true, order: 1 },
    { id: 'services', enabled: true, order: 2 },
    { id: 'samples', enabled: true, order: 3 },
    { id: 'testimonials', enabled: true, order: 4 },
    { id: 'education', enabled: true, order: 5 },
  ];
  const active = (sections && sections.length > 0) ? sections : defaultSections;
  const sorted = [...active].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  // Render each section exactly once (head() increments the section number as it runs).
  const rendered = sorted
    .filter(s => (s.enabled === undefined ? true : s.enabled) && sectionContent[s.id])
    .map(s => ({ id: s.id, html: sectionContent[s.id]() }))
    .filter(r => r.html.trim() !== '');

  const contentHTML = rendered.map(r => r.html).join('');

  // Sidebar nav from the sections that actually rendered.
  const navHTML = rendered.filter(r => navLabels[r.id]).map(r =>
    `<a href="#${navTarget[r.id]}" class="side-link" data-target="${navTarget[r.id]}">${navLabels[r.id]}</a>`
  ).join('');

  const avatar = profile
    ? `<img src="${profile}" alt="${name}" />`
    : `<div class="side-avatar-letter">${name.charAt(0).toUpperCase()}</div>`;

  const favicon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23ea580c'/%3E%3Crect x='6' y='7' width='7' height='26' rx='1.5' fill='white' transform='rotate(-8 9.5 20)'/%3E%3Crect x='19' y='7' width='7' height='19' rx='1.5' fill='white' transform='rotate(-8 22.5 16.5)'/%3E%3Crect x='6' y='7' width='20' height='7' rx='1.5' fill='white' transform='rotate(-8 16 10.5)'/%3E%3Crect x='6' y='17' width='15' height='6' rx='1.5' fill='white' transform='rotate(-8 13.5 20)'/%3E%3C/svg%3E`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} — ${role}</title>
  <meta name="description" content="${bio.slice(0, 160)}" />
  <meta name="author" content="${name}" />
  <meta property="og:title" content="${name} — ${role}" />
  <meta property="og:description" content="${bio.slice(0, 160)}" />
  <meta property="og:type" content="profile" />
  <meta property="og:image" content="${profile}" />
  <meta name="twitter:card" content="summary" />
  <link rel="icon" type="image/svg+xml" href="${favicon}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>${getStyles(primary, accent)}</style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <div class="side-avatar">${avatar}</div>
      <div>
        <div class="side-name">${name}</div>
        <div class="side-role">${role}</div>
        ${location ? `<p class="side-location"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${location}</p>` : ''}
      </div>
      ${showAvail ? `<span class="side-avail"><span class="side-avail-dot"></span>${availText}</span>` : ''}
      ${navHTML ? `<nav class="side-nav">${navHTML}</nav>` : ''}
      <div class="side-foot">
        <div class="side-actions">
          ${email ? `<a href="mailto:${email}" class="side-btn side-btn-primary">Get in touch</a>` : ''}
          ${resumeUrl ? `<a href="${resumeUrl}" target="_blank" rel="noopener" class="side-btn side-btn-outline">Resume ↓</a>` : ''}
        </div>
        ${buildSocialLinks(data)}
      </div>
    </aside>
    <main class="content">
      ${statement ? `<p class="lead-statement">${statement}</p>` : ''}
      ${contentHTML}
      <p class="credit">Made with <a href="https://porfilr.com" target="_blank" rel="noopener">Porfilr</a></p>
    </main>
  </div>
  ${sampleModals}
  <script>
    function openModal(id){ var m = document.getElementById(id); if(m){ m.classList.add('is-open'); document.body.style.overflow='hidden'; } }
    function closeModal(id){ var m = document.getElementById(id); if(m){ m.classList.remove('is-open'); document.body.style.overflow=''; } }
    document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ document.querySelectorAll('.modal.is-open').forEach(function(m){ m.classList.remove('is-open'); }); document.body.style.overflow=''; } });
    (function(){
      var els = document.querySelectorAll('.reveal');
      if(!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches){ els.forEach(function(el){ el.classList.add('in'); }); return; }
      var io = new IntersectionObserver(function(en){ en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12 });
      els.forEach(function(el){ io.observe(el); });
    })();
    (function(){
      var links = document.querySelectorAll('.side-link'); if(!links.length || !('IntersectionObserver' in window)) return;
      var map = {}; links.forEach(function(l){ map[l.getAttribute('data-target')] = l; });
      var io = new IntersectionObserver(function(en){ en.forEach(function(e){ var l = map[e.target.id]; if(l && e.isIntersecting){ links.forEach(function(x){ x.classList.remove('active'); }); l.classList.add('active'); } }); }, { rootMargin: '-30% 0px -60% 0px' });
      Object.keys(map).forEach(function(id){ var s = document.getElementById(id); if(s) io.observe(s); });
    })();
  </script>
  <script type="application/json" id="portfolio-data">${JSON.stringify({ formData: data, sections: active })}</script>
</body>
</html>`;
}

const professionalWriterTemplate = {
  id: "professional-writer-template",
  name: "Professional Portfolio",
  description: "Premium split-layout portfolio with a sticky profile sidebar, experience timeline, and case-study modals.",
  thumbnail: "/images/professional-template.jpg",
  isPro: true,
  fields: [
    { name: "fullName", label: "Full Name", type: "text", required: true, section: "hero" },
    { name: "headline", label: "Professional Headline", type: "text", required: true, section: "hero" },
    { name: "bio", label: "About You", type: "textarea", required: true, section: "hero" },
    { name: "profileImage", label: "Profile Image", type: "file", section: "hero" },
    { name: "resumeUrl", label: "Resume / CV link", type: "url", section: "hero" },
    { name: "primaryColor", label: "Primary Color", type: "color", default: "#4f46e5", section: "theme" },
    { name: "accentColor", label: "Accent Color", type: "color", default: "#9333ea", section: "theme" },
    { name: "email", label: "Email Address", type: "email", required: true, section: "contact" },
    { name: "linkedin", label: "LinkedIn URL", type: "text", section: "contact" },
    { name: "twitter", label: "Twitter/X URL", type: "text", section: "contact" },
    { name: "instagram", label: "Instagram URL", type: "text", section: "contact" },
    { name: "website", label: "Website", type: "text", section: "contact" },
  ],
  generateHTML,
};

export default professionalWriterTemplate;
