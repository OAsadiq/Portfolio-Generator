import { collectSocials, socialIconSvg } from '../_social.js';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const traderTemplate = {
  id: 'trader-template',
  name: 'Trader',
  description: 'A credible, verified track-record page for traders — get funded, get clients, get taken seriously.',
  thumbnail: '/images/minimal-template.jpg',
  isPro: false,
  fields: [
    // Hero
    { name: 'fullName',   label: 'Full Name',            type: 'text',  required: true },
    { name: 'headline',   label: 'Headline',             type: 'text',  placeholder: 'e.g. Forex Trader • FTMO Funded' },
    { name: 'bio',        label: 'Short Bio',            type: 'textarea', placeholder: 'One or two lines on who you are and what you trade.' },
    { name: 'profileImage', label: 'Profile Photo',      type: 'file' },
    { name: 'location',   label: 'Location (optional)',  type: 'text',  placeholder: 'e.g. Lagos, Nigeria' },

    // Track record — the metrics investors scan first
    { name: 'returnPct',     label: 'Total Return',      type: 'text',  placeholder: 'e.g. +142%' },
    { name: 'winRate',       label: 'Win Rate',          type: 'text',  placeholder: 'e.g. 68%' },
    { name: 'profitFactor',  label: 'Profit Factor',     type: 'text',  placeholder: 'e.g. 2.4' },
    { name: 'maxDrawdown',   label: 'Max Drawdown',      type: 'text',  placeholder: 'e.g. 8.2%' },
    { name: 'tradingSince',  label: 'Track Record Length', type: 'text', placeholder: 'e.g. 3 years' },
    { name: 'verificationUrl', label: 'Verification Link (MyFXBook, broker statement, etc.)', type: 'text', placeholder: 'https://myfxbook.com/...' },
    { name: 'equityCurveImage', label: 'Equity Curve / Performance Chart (image)', type: 'file' },
    { name: 'markets',       label: 'Markets Traded',    type: 'text',  placeholder: 'e.g. Forex, Indices, Crypto' },

    // Strategy & risk
    { name: 'strategy',      label: 'Strategy Summary',  type: 'textarea', placeholder: 'How you trade — style, timeframe, edge — in plain language.' },
    { name: 'riskProfile',   label: 'Risk Management',   type: 'textarea', placeholder: 'Max drawdown, risk per trade, your rules for protecting capital.' },

    // Services / offer
    { name: 'service1Title', label: 'Offer 1 – Title',       type: 'text',  placeholder: 'e.g. Managed Accounts' },
    { name: 'service1Desc',  label: 'Offer 1 – Description',  type: 'textarea' },
    { name: 'service2Title', label: 'Offer 2 – Title',       type: 'text',  placeholder: 'e.g. Signals' },
    { name: 'service2Desc',  label: 'Offer 2 – Description',  type: 'textarea' },
    { name: 'service3Title', label: 'Offer 3 – Title',       type: 'text',  placeholder: 'e.g. Mentorship' },
    { name: 'service3Desc',  label: 'Offer 3 – Description',  type: 'textarea' },

    // Contact
    { name: 'email',    label: 'Email Address',   type: 'email', required: true },
    { name: 'linkedin', label: 'LinkedIn URL',    type: 'text' },
    { name: 'twitter',  label: 'Twitter / X URL', type: 'text' },
    { name: 'website',  label: 'Website URL',     type: 'text' },

    // Optional custom disclaimer
    { name: 'disclaimerText', label: 'Risk Disclaimer (leave blank for the default)', type: 'textarea' },
  ],

  generateHTML: (data) => {
    const name = esc(data.fullName || 'Your Name');
    const headline = esc(data.headline || 'Trader');
    const bio = esc(data.bio || '');
    const profile = data.profileImage || '';
    const location = esc(data.location || '');
    const email = esc(data.email || '');
    const accent = /^#[0-9a-fA-F]{3,8}$/.test(data.primaryColor || '') ? data.primaryColor : '#ea580c';
    const verifyUrl = String(data.verificationUrl || '').trim();
    const verifyHref = verifyUrl && !/^https?:\/\//i.test(verifyUrl) ? 'https://' + verifyUrl : verifyUrl;
    const equity = data.equityCurveImage || '';
    const strategy = esc(data.strategy || '');
    const risk = esc(data.riskProfile || '');
    const markets = String(data.markets || '').split(',').map(m => m.trim()).filter(Boolean);
    const disclaimer = esc(data.disclaimerText || 'Trading involves substantial risk of loss and is not suitable for every investor. Past performance is not indicative of future results.');

    const metrics = [
      ['Total return', data.returnPct, 'pos'],
      ['Win rate', data.winRate, ''],
      ['Profit factor', data.profitFactor, ''],
      ['Max drawdown', data.maxDrawdown, 'neg'],
      ['Track record', data.tradingSince, ''],
    ].filter(m => m[1]);
    const metricCards = metrics
      .map(([label, val, cls]) => `<div class="metric"><div class="metric-val ${cls}">${esc(val)}</div><div class="metric-label">${esc(label)}</div></div>`)
      .join('');

    const services = [1, 2, 3]
      .map(i => ({ t: data[`service${i}Title`], d: data[`service${i}Desc`] }))
      .filter(s => s.t);
    const serviceCards = services
      .map(s => `<div class="svc"><h3>${esc(s.t)}</h3>${s.d ? `<p>${esc(s.d)}</p>` : ''}</div>`)
      .join('');

    const socials = collectSocials(data);
    const socialRow = socials.length
      ? `<div class="socials">${socials.map(u => `<a href="${u}" target="_blank" rel="noopener" class="social" aria-label="social link">${socialIconSvg(u, 18)}</a>`).join('')}</div>`
      : '';

    const avatar = profile
      ? `<img src="${profile}" alt="${name}" class="avatar" />`
      : `<div class="avatar avatar-initials">${name.charAt(0).toUpperCase()}</div>`;

    const verifiedBadge = verifyHref
      ? `<a href="${verifyHref}" target="_blank" rel="noopener" class="verified">✔ Verified track record</a>`
      : '';

    return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} — ${headline}</title>
  <meta name="description" content="${bio.slice(0, 160)}" />
  <meta property="og:title" content="${name} — ${headline}" />
  <meta property="og:description" content="${bio.slice(0, 160)}" />
  <meta property="og:type" content="profile" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--accent:${accent};--bg:#0a0a0b;--bg2:#141416;--line:#26262b;--text:#f4f4f5;--muted:#a1a1aa;--pos:#22c55e;--neg:#f87171}
    html{scroll-behavior:smooth}
    body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased}
    .wrap{max-width:920px;margin:0 auto;padding:0 24px}
    .section{padding:56px 0;border-top:1px solid var(--line)}
    .section:first-of-type{border-top:0}
    .kicker{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--accent);margin-bottom:14px}
    h1{font-size:clamp(32px,6vw,52px);font-weight:900;letter-spacing:-.02em;line-height:1.05}
    h2{font-size:26px;font-weight:800;letter-spacing:-.01em;margin-bottom:16px}
    h3{font-size:17px;font-weight:700}
    p{color:var(--muted)}
    /* hero */
    .hero{padding:64px 0 40px;text-align:center}
    .avatar{width:96px;height:96px;border-radius:22px;object-fit:cover;margin:0 auto 22px;border:2px solid var(--line);display:block}
    .avatar-initials{display:flex;align-items:center;justify-content:center;background:var(--accent);color:#fff;font-size:2.4rem;font-weight:800}
    .role{color:var(--accent);font-weight:700;font-size:16px;margin-top:10px}
    .loc{color:var(--muted);font-size:14px;margin-top:6px}
    .bio{color:var(--muted);max-width:620px;margin:18px auto 0;font-size:17px}
    .hero-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:11px;font-weight:700;font-size:15px;text-decoration:none;transition:opacity .15s,transform .15s}
    .btn-primary{background:var(--accent);color:#fff}
    .btn-primary:hover{opacity:.9;transform:translateY(-1px)}
    .verified{display:inline-flex;align-items:center;gap:7px;padding:11px 20px;border-radius:11px;border:1px solid rgba(34,197,94,.4);background:rgba(34,197,94,.08);color:var(--pos);font-weight:600;font-size:14px;text-decoration:none}
    /* metrics */
    .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px}
    .metric{background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:22px 18px;text-align:center}
    .metric-val{font-size:30px;font-weight:800;letter-spacing:-.02em}
    .metric-val.pos{color:var(--pos)}
    .metric-val.neg{color:var(--neg)}
    .metric-label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:6px}
    /* equity */
    .equity{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--bg2)}
    .equity img{width:100%;display:block}
    /* chips */
    .chips{display:flex;gap:10px;flex-wrap:wrap}
    .chip{background:var(--bg2);border:1px solid var(--line);border-radius:100px;padding:8px 16px;font-size:14px;font-weight:600}
    /* prose */
    .prose{color:var(--muted);font-size:17px;white-space:pre-wrap}
    /* services */
    .svcs{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
    .svc{background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:22px}
    .svc h3{margin-bottom:8px}
    .svc p{font-size:14px}
    /* contact */
    .cform{display:flex;flex-direction:column;gap:12px;max-width:520px}
    .cform .row{display:flex;gap:12px}
    .cform .row>*{flex:1}
    .cform input,.cform textarea{width:100%;padding:13px 15px;border-radius:11px;border:1px solid var(--line);background:var(--bg2);color:var(--text);font-size:15px;font-family:inherit}
    .cform input:focus,.cform textarea:focus{outline:none;border-color:var(--accent)}
    .cform textarea{resize:vertical;min-height:120px}
    .cf-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
    .cform button{align-self:flex-start;padding:13px 28px;border-radius:11px;border:none;background:var(--accent);color:#fff;font-weight:700;font-size:15px;cursor:pointer}
    .cform button:disabled{opacity:.5;cursor:not-allowed}
    .cf-msg{font-size:14px;min-height:1.2em}
    .cf-msg.success{color:var(--pos)}.cf-msg.error{color:var(--neg)}
    .socials{display:flex;gap:10px;margin-top:20px}
    .social{width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all .15s}
    .social:hover{color:#fff;border-color:var(--accent)}
    .disclaimer{font-size:12px;color:#71717a;border-top:1px solid var(--line);padding:24px 0;line-height:1.6}
    footer{text-align:center;padding:28px 0;color:#71717a;font-size:13px}
    footer a{color:var(--accent);text-decoration:none}
    @media(max-width:560px){.cform .row{flex-direction:column}}
  </style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      ${avatar}
      <h1>${name}</h1>
      <div class="role">${headline}</div>
      ${location ? `<div class="loc">${location}</div>` : ''}
      ${bio ? `<p class="bio">${bio}</p>` : ''}
      <div class="hero-cta">
        <a href="#contact" class="btn btn-primary">Work with me</a>
        ${verifiedBadge}
      </div>
    </header>

    ${metricCards ? `<section class="section"><div class="kicker">Track record</div><div class="metrics">${metricCards}</div></section>` : ''}

    ${equity ? `<section class="section"><div class="kicker">Performance</div><h2>Equity curve</h2><div class="equity"><img src="${equity}" alt="Equity curve" /></div></section>` : ''}

    ${markets.length ? `<section class="section"><div class="kicker">Markets</div><div class="chips">${markets.map(m => `<span class="chip">${esc(m)}</span>`).join('')}</div></section>` : ''}

    ${strategy ? `<section class="section"><div class="kicker">Strategy</div><h2>How I trade</h2><p class="prose">${strategy}</p></section>` : ''}

    ${risk ? `<section class="section"><div class="kicker">Risk management</div><h2>How I protect capital</h2><p class="prose">${risk}</p></section>` : ''}

    ${serviceCards ? `<section class="section"><div class="kicker">Work with me</div><h2>What I offer</h2><div class="svcs">${serviceCards}</div></section>` : ''}

    <section class="section" id="contact">
      <div class="kicker">Get in touch</div>
      <h2>Invest with me / work together</h2>
      ${email ? `
      <form class="cform" id="contactForm">
        <div class="row">
          <input type="text" name="senderName" placeholder="Your name" required />
          <input type="email" name="senderEmail" placeholder="Your email" required />
        </div>
        <textarea name="message" placeholder="Tell me what you're looking for…" required></textarea>
        <input type="text" name="company" class="cf-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <button type="submit" id="cfSubmit">Send message</button>
        <div class="cf-msg" id="cfMsg"></div>
      </form>` : ''}
      ${socialRow}
    </section>

    <p class="disclaimer">${disclaimer}</p>
  </div>

  <footer>Made with <a href="https://porfilr.com" target="_blank" rel="noopener">Porfilr</a></footer>

  <script>
    (function(){
      var form = document.getElementById('contactForm'); if (!form) return;
      form.addEventListener('submit', async function(e){
        e.preventDefault();
        var btn = document.getElementById('cfSubmit'), msg = document.getElementById('cfMsg'), fd = new FormData(this);
        btn.disabled = true; btn.textContent = 'Sending…'; msg.className = 'cf-msg'; msg.textContent = '';
        try {
          var res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
            ownerEmail: ${JSON.stringify(email)}, portfolioName: ${JSON.stringify(name)},
            senderName: fd.get('senderName'), senderEmail: fd.get('senderEmail'), message: fd.get('message'), company: fd.get('company')
          }) });
          var d = await res.json();
          if (d.success) { msg.textContent = 'Message sent — I\\'ll be in touch soon.'; msg.className = 'cf-msg success'; this.reset(); }
          else { msg.textContent = d.error || 'Something went wrong. Please try again.'; msg.className = 'cf-msg error'; }
        } catch { msg.textContent = 'Something went wrong. Please try again.'; msg.className = 'cf-msg error'; }
        finally { btn.disabled = false; btn.textContent = 'Send message'; }
      });
    })();
  </script>
</body>
</html>`;
  },
};

export default traderTemplate;
