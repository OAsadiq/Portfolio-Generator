import { collectSocials, socialIconSvg } from '../_social.js';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const traderTemplate = {
  id: 'trader-template',
  name: 'Trader',
  description: 'A premium, credible track-record page for traders — get funded, get clients, get taken seriously.',
  thumbnail: '/images/minimal-template.jpg',
  isPro: false,
  fields: [
    // Hero
    { name: 'fullName',   label: 'Full Name',            type: 'text',  required: true },
    { name: 'headline',   label: 'Headline',             type: 'text',  placeholder: 'e.g. Forex Trader • 3-Year Track Record' },
    { name: 'propFirm',   label: 'Prop Firm / Funded Badge (optional)', type: 'text', placeholder: 'e.g. FTMO Funded • $200K' },
    { name: 'bio',        label: 'Short Bio',            type: 'textarea', placeholder: 'One or two lines on who you are and what you trade.' },
    { name: 'profileImage', label: 'Profile Photo',      type: 'file' },
    { name: 'location',   label: 'Location (optional)',  type: 'text',  placeholder: 'e.g. Lagos, Nigeria' },

    // Track record — the metrics investors scan first
    { name: 'returnPct',     label: 'Total Return',      type: 'text',  placeholder: 'e.g. +142%' },
    { name: 'winRate',       label: 'Win Rate',          type: 'text',  placeholder: 'e.g. 68%' },
    { name: 'profitFactor',  label: 'Profit Factor',     type: 'text',  placeholder: 'e.g. 2.4' },
    { name: 'maxDrawdown',   label: 'Max Drawdown',      type: 'text',  placeholder: 'e.g. 8.2%' },
    { name: 'tradingSince',  label: 'Track Record Length', type: 'text', placeholder: 'e.g. 3 years' },
    { name: 'markets',       label: 'Markets Traded',    type: 'text',  placeholder: 'e.g. Forex, Indices, Crypto' },

    // Proof (flexible — link, uploaded statement, or prop firm)
    { name: 'verificationUrl', label: 'Track-record / proof link — MyFXBook, broker, prop-firm dashboard (optional)', type: 'text', placeholder: 'https://myfxbook.com/...' },
    { name: 'equityCurveImage', label: 'Equity Curve / Performance Chart (image)', type: 'file' },
    { name: 'proofImage', label: 'Proof screenshot — broker statement / verified results (optional)', type: 'file' },

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
    const propFirm = esc(data.propFirm || '');
    const bio = esc(data.bio || '');
    const profile = data.profileImage || '';
    const location = esc(data.location || '');
    const email = esc(data.email || '');
    const accent = /^#[0-9a-fA-F]{3,8}$/.test(data.primaryColor || '') ? data.primaryColor : '#ea580c';
    const verifyUrl = String(data.verificationUrl || '').trim();
    const verifyHref = verifyUrl && !/^https?:\/\//i.test(verifyUrl) ? 'https://' + verifyUrl : verifyUrl;
    const equity = data.equityCurveImage || '';
    const proofImg = data.proofImage || '';
    const strategy = esc(data.strategy || '');
    const risk = esc(data.riskProfile || '');
    const markets = String(data.markets || '').split(',').map(m => m.trim()).filter(Boolean);
    const disclaimer = esc(data.disclaimerText || 'Trading involves substantial risk of loss and is not suitable for every investor. Results shown are self-reported by the account holder. Past performance is not indicative of future results.');

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

    const trackLink = verifyHref
      ? `<a href="${verifyHref}" target="_blank" rel="noopener" class="btn btn-ghost">View my track record ↗</a>`
      : '';
    const fundedBadge = propFirm
      ? `<div class="funded">⚡ ${propFirm}</div>`
      : '';

    // Track-record section: metrics + proof image (framed as evidence) when present.
    const trackRecordSection = (metricCards || equity || proofImg) ? `
    <section class="section" id="track">
      <div class="kicker">Track record</div>
      ${metricCards ? `<div class="metrics">${metricCards}</div>` : ''}
      ${equity ? `<div class="chart-card"><div class="chart-head">Equity curve</div><img src="${equity}" alt="Equity curve" /></div>` : ''}
      ${proofImg ? `<div class="chart-card proof"><div class="chart-head">Proof of results</div><img src="${proofImg}" alt="Statement / verified results" /></div>` : ''}
      ${verifyHref ? `<p class="proof-note">Full results: <a href="${verifyHref}" target="_blank" rel="noopener">${esc(verifyUrl.replace(/^https?:\/\//, ''))}</a></p>` : ''}
    </section>` : '';

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
    :root{--accent:${accent};--bg:#08080a;--bg2:#141418;--bg3:#1b1b21;--line:#282830;--text:#f5f5f7;--muted:#9a9aa5;--pos:#22c55e;--neg:#f87171;--gold:#eab308}
    html{scroll-behavior:smooth}
    body{font-family:'Inter',system-ui,sans-serif;color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased;
      background:
        radial-gradient(90% 55% at 50% -8%, rgba(234,88,12,.14), transparent 60%),
        radial-gradient(70% 50% at 85% 8%, rgba(34,197,94,.08), transparent 55%),
        #08080a;
      background-attachment:fixed}
    .wrap{max-width:960px;margin:0 auto;padding:0 24px}
    .section{padding:60px 0;border-top:1px solid var(--line)}
    .section:first-of-type{border-top:0}
    .kicker{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:var(--accent);margin-bottom:16px}
    h1{font-size:clamp(38px,7vw,64px);font-weight:900;letter-spacing:-.03em;line-height:1.02}
    h2{font-size:28px;font-weight:800;letter-spacing:-.02em;margin-bottom:18px}
    h3{font-size:17px;font-weight:700}
    p{color:var(--muted)}
    /* hero */
    .hero{padding:72px 0 44px;text-align:center;position:relative}
    .avatar{width:104px;height:104px;border-radius:26px;object-fit:cover;margin:0 auto 24px;border:2px solid var(--line);box-shadow:0 20px 50px rgba(0,0,0,.5);display:block}
    .avatar-initials{display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,var(--accent),#b8430a);color:#fff;font-size:2.6rem;font-weight:800}
    .funded{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--gold);background:rgba(234,179,8,.1);border:1px solid rgba(234,179,8,.35);padding:7px 15px;border-radius:100px;margin-bottom:18px;letter-spacing:.02em}
    .role{color:var(--muted);font-weight:600;font-size:17px;margin-top:12px}
    .loc{color:var(--muted);font-size:14px;margin-top:8px;opacity:.8}
    .bio{color:#c9c9d1;max-width:640px;margin:20px auto 0;font-size:18px}
    .hero-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:30px}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;transition:opacity .15s,transform .15s,border-color .15s}
    .btn-primary{background:linear-gradient(145deg,var(--accent),#c9490a);color:#fff;box-shadow:0 10px 30px rgba(234,88,12,.28)}
    .btn-primary:hover{transform:translateY(-2px)}
    .btn-ghost{border:1px solid var(--line);color:var(--text);background:rgba(255,255,255,.02)}
    .btn-ghost:hover{border-color:var(--pos);color:var(--pos)}
    /* metrics — the star */
    .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px}
    .metric{position:relative;background:linear-gradient(180deg,var(--bg3),var(--bg2));border:1px solid var(--line);border-radius:16px;padding:26px 18px;text-align:center;overflow:hidden}
    .metric::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.5}
    .metric-val{font-size:clamp(30px,4vw,38px);font-weight:900;letter-spacing:-.03em}
    .metric-val.pos{color:var(--pos);text-shadow:0 0 30px rgba(34,197,94,.35)}
    .metric-val.neg{color:var(--neg)}
    .metric-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-top:8px}
    /* chart / proof cards */
    .chart-card{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--bg2);margin-top:18px;box-shadow:0 20px 50px rgba(0,0,0,.35)}
    .chart-head{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);padding:16px 20px;border-bottom:1px solid var(--line)}
    .chart-card img{width:100%;display:block}
    .proof-note{font-size:13px;color:var(--muted);margin-top:16px}
    .proof-note a{color:var(--accent);text-decoration:none}
    /* chips */
    .chips{display:flex;gap:10px;flex-wrap:wrap}
    .chip{background:var(--bg2);border:1px solid var(--line);border-radius:100px;padding:9px 18px;font-size:14px;font-weight:600}
    /* prose */
    .prose{color:#c2c2ca;font-size:18px;white-space:pre-wrap;max-width:720px}
    /* services */
    .svcs{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
    .svc{background:linear-gradient(180deg,var(--bg3),var(--bg2));border:1px solid var(--line);border-radius:16px;padding:26px;transition:border-color .15s,transform .15s}
    .svc:hover{border-color:var(--accent);transform:translateY(-2px)}
    .svc h3{margin-bottom:9px}
    .svc p{font-size:14px}
    /* contact */
    .cform{display:flex;flex-direction:column;gap:12px;max-width:540px}
    .cform .row{display:flex;gap:12px}
    .cform .row>*{flex:1}
    .cform input,.cform textarea{width:100%;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:var(--bg2);color:var(--text);font-size:15px;font-family:inherit}
    .cform input:focus,.cform textarea:focus{outline:none;border-color:var(--accent)}
    .cform textarea{resize:vertical;min-height:130px}
    .cf-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
    .cform button{align-self:flex-start;padding:14px 30px;border-radius:12px;border:none;background:linear-gradient(145deg,var(--accent),#c9490a);color:#fff;font-weight:700;font-size:15px;cursor:pointer}
    .cform button:disabled{opacity:.5;cursor:not-allowed}
    .cf-msg{font-size:14px;min-height:1.2em}
    .cf-msg.success{color:var(--pos)}.cf-msg.error{color:var(--neg)}
    .socials{display:flex;gap:10px;margin-top:22px}
    .social{width:42px;height:42px;border-radius:11px;border:1px solid var(--line);background:var(--bg2);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all .15s}
    .social:hover{color:#fff;border-color:var(--accent)}
    .disclaimer{font-size:12px;color:#6b6b76;border-top:1px solid var(--line);padding:26px 0;line-height:1.6}
    footer{text-align:center;padding:30px 0;color:#6b6b76;font-size:13px}
    footer a{color:var(--accent);text-decoration:none}
    @media(max-width:560px){.cform .row{flex-direction:column}}
  </style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      ${avatar}
      ${fundedBadge}
      <h1>${name}</h1>
      <div class="role">${headline}</div>
      ${location ? `<div class="loc">${location}</div>` : ''}
      ${bio ? `<p class="bio">${bio}</p>` : ''}
      <div class="hero-cta">
        <a href="#contact" class="btn btn-primary">Work with me</a>
        ${trackLink}
      </div>
    </header>

    ${trackRecordSection}

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
