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
  isPro: true,
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

  generateHTML: (data, sections = []) => {
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

    // The track-record card is the centrepiece: the first metric is featured large,
    // the rest fill a grid beneath it. Works with 1 metric or 5.
    const [feat, ...rest] = metrics;
    const trackCard = metrics.length ? `
        <div class="tr-card">
          <div class="tr-head"><span class="tr-head-label">Track record</span></div>
          <div class="tr-feature">
            <div class="tr-feature-val ${feat[2]}">${esc(feat[1])}</div>
            <div class="tr-feature-label">${esc(feat[0])}</div>
          </div>
          ${rest.length ? `<div class="tr-grid">${rest.map(([label, val, cls]) =>
            `<div class="tr-cell"><div class="tr-cell-val ${cls}">${esc(val)}</div><div class="tr-cell-label">${esc(label)}</div></div>`
          ).join('')}</div>` : ''}
        </div>` : '';

    // 1–6 to match the builder's Services block, which offers six slots. Mapping only
    // 1–3 here would let a trader fill slots 4–6 and watch them vanish on publish.
    const services = [1, 2, 3, 4, 5, 6]
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
      ? `<div class="funded"><span class="funded-dot"></span>${propFirm}</div>`
      : '';

    // ── Section blocks ────────────────────────────────────────────────────────
    // Each returns '' when it has nothing to show, so an empty section never renders
    // as a bare heading. The builder's Layout tab controls order and visibility via
    // `sections`; the hero is deliberately not toggleable (it's the page's identity,
    // and the track-record card lives inside it).
    const blocks = {
      proof: () => (equity || proofImg || verifyHref) ? `
    <section class="section" id="proof">
      <div class="kicker">Proof</div>
      <h2>The receipts<span class="ser"> — not screenshots in a DM.</span></h2>
      ${equity ? `<div class="chart-card"><div class="chart-head">Equity curve</div><div class="chart-body"><img src="${equity}" alt="Equity curve" /></div></div>` : ''}
      ${proofImg ? `<div class="chart-card"><div class="chart-head">Statement / results</div><div class="chart-body"><img src="${proofImg}" alt="Statement / verified results" /></div></div>` : ''}
      ${verifyHref ? `<p class="proof-note">Independently verifiable: <a href="${verifyHref}" target="_blank" rel="noopener">${esc(verifyUrl.replace(/^https?:\/\//, ''))}</a></p>` : ''}
    </section>` : '',

      markets: () => markets.length ? `<section class="section"><div class="kicker">Markets</div><h2>What I trade</h2><div class="chips">${markets.map(m => `<span class="chip">${esc(m)}</span>`).join('')}</div></section>` : '',

      strategy: () => strategy ? `<section class="section"><div class="kicker">Strategy</div><h2>How I trade<span class="ser"> — and where the edge is.</span></h2><p class="prose">${strategy}</p></section>` : '',

      risk: () => risk ? `<section class="section"><div class="kicker">Risk management</div><h2>How I protect capital<span class="ser"> — before I grow it.</span></h2><p class="prose">${risk}</p></section>` : '',

      services: () => serviceCards ? `<section class="section"><div class="kicker">Work with me</div><h2>What I offer</h2><div class="svcs">${serviceCards}</div></section>` : '',

      contact: () => `
    <section class="section" id="contact">
      <div class="kicker">Get in touch</div>
      <h2>Let's talk<span class="ser"> — investors and clients welcome.</span></h2>
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
    </section>`,
    };

    const DEFAULT_ORDER = ['proof', 'markets', 'strategy', 'risk', 'services', 'contact'];
    // Honour the builder's order/visibility when given; fall back to the natural order
    // for the form flow and for pages published before sections existed.
    const chosen = (Array.isArray(sections) && sections.length)
      ? sections
          .filter(s => s && s.visible !== false && blocks[s.id])
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map(s => s.id)
      : DEFAULT_ORDER;
    // A trader who hides everything still gets a contactable page — losing the contact
    // form silently would cost them the leads this page exists to capture.
    const body = chosen.map(id => blocks[id]()).join('\n');

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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{
      --accent:${accent};
      --bg:#08080a;--bg2:#131317;--bg3:#1a1a20;--line:#26262e;--line2:#33333d;
      --text:#f7f7f9;--muted:#93939f;--dim:#63636e;
      --pos:#22c55e;--neg:#f87171;--gold:#eab308;
      --radius:20px;
      /* accent-derived tints — plain rgba first so unsupported color-mix falls back */
      --glow:rgba(234,88,12,.13);
      --glow:color-mix(in srgb, var(--accent) 13%, transparent);
      --accent-soft:rgba(234,88,12,.10);
      --accent-soft:color-mix(in srgb, var(--accent) 10%, transparent);
      --accent-line:rgba(234,88,12,.32);
      --accent-line:color-mix(in srgb, var(--accent) 32%, transparent);
      --accent-deep:#c9490a;
      --accent-deep:color-mix(in srgb, var(--accent) 82%, #000);
    }
    html{scroll-behavior:smooth}
    body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased;
      background:
        radial-gradient(80% 50% at 15% -10%, var(--glow), transparent 62%),
        radial-gradient(60% 45% at 92% 4%, rgba(34,197,94,.07), transparent 58%),
        var(--bg);
      background-attachment:fixed}
    .wrap{max-width:1080px;margin:0 auto;padding:0 28px}
    .section{padding:96px 0;border-top:1px solid var(--line)}
    .kicker{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.2em;color:var(--accent);
      background:var(--accent-soft);border:1px solid var(--accent-line);border-radius:100px;padding:6px 14px;margin-bottom:22px}
    h1{font-size:clamp(40px,5.6vw,68px);font-weight:800;letter-spacing:-.035em;line-height:1}
    h2{font-size:clamp(26px,3.2vw,36px);font-weight:800;letter-spacing:-.025em;line-height:1.15;margin-bottom:18px}
    h3{font-size:17px;font-weight:700;letter-spacing:-.01em}
    p{color:var(--muted)}
    /* the serif italic accent — the premium tell */
    .ser{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.01em;color:var(--muted)}
    h1 .ser{display:block;color:var(--text);opacity:.92;margin-top:.12em}

    /* ---------- hero ---------- */
    .hero{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;padding:104px 0 96px}
    .hero.solo{grid-template-columns:1fr;max-width:720px;text-align:center;justify-items:center}
    .avatar{width:76px;height:76px;border-radius:20px;object-fit:cover;margin-bottom:26px;border:1px solid var(--line2);box-shadow:0 16px 40px rgba(0,0,0,.55);display:block}
    .avatar-initials{display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,var(--accent),var(--accent-deep));color:#fff;font-size:2rem;font-weight:800;letter-spacing:-.02em}
    .funded{display:inline-flex;align-items:center;gap:9px;font-size:12.5px;font-weight:700;color:var(--gold);
      background:rgba(234,179,8,.09);border:1px solid rgba(234,179,8,.3);padding:7px 15px;border-radius:100px;margin-bottom:22px;letter-spacing:.01em}
    .funded-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px var(--gold);flex:none}
    .role{font-size:clamp(20px,2.3vw,26px);margin-top:18px;line-height:1.3}
    .loc{display:flex;align-items:center;gap:7px;color:var(--dim);font-size:13.5px;margin-top:14px;font-weight:500}
    .hero.solo .avatar{margin-left:auto;margin-right:auto}
    .hero.solo .loc{justify-content:center}
    .loc svg{flex:none;opacity:.7}
    .bio{color:#b9b9c4;max-width:46ch;margin-top:22px;font-size:16.5px;line-height:1.65}
    .hero.solo .bio{margin-left:auto;margin-right:auto}
    .hero-cta{display:flex;gap:11px;flex-wrap:wrap;margin-top:34px}
    .hero.solo .hero-cta{justify-content:center}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:100px;font-weight:650;font-size:14.5px;text-decoration:none;
      transition:transform .16s ease,border-color .16s ease,color .16s ease,box-shadow .16s ease;white-space:nowrap}
    .btn-primary{background:linear-gradient(150deg,var(--accent),var(--accent-deep));color:#fff;box-shadow:0 10px 32px var(--glow),inset 0 1px 0 rgba(255,255,255,.18)}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 16px 40px var(--glow),inset 0 1px 0 rgba(255,255,255,.18)}
    .btn-ghost{border:1px solid var(--line2);color:var(--text);background:rgba(255,255,255,.025)}
    .btn-ghost:hover{transform:translateY(-2px);border-color:var(--muted)}

    /* ---------- track-record card (the centrepiece) ---------- */
    .tr-card{position:relative;border:1px solid var(--line2);border-radius:26px;padding:8px;
      background:linear-gradient(165deg,#1e1e26,var(--bg2) 55%,#101014);
      box-shadow:0 34px 90px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.05)}
    .tr-card::before{content:'';position:absolute;inset:-1px;border-radius:26px;padding:1px;pointer-events:none;
      background:linear-gradient(160deg,var(--accent-line),transparent 42%,transparent 62%,rgba(34,197,94,.22));
      -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
    .hero.solo .tr-card{margin-top:44px;width:100%;text-align:left}
    .tr-head{display:flex;align-items:center;justify-content:space-between;padding:15px 18px 13px}
    .tr-head-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.19em;color:var(--dim)}
    .tr-feature{background:rgba(255,255,255,.022);border:1px solid var(--line);border-radius:18px;padding:30px 24px 26px;text-align:center}
    .tr-feature-val{font-size:clamp(46px,6vw,62px);font-weight:800;letter-spacing:-.045em;line-height:1;font-variant-numeric:tabular-nums}
    .tr-feature-val.pos{color:var(--pos);text-shadow:0 0 44px rgba(34,197,94,.34)}
    .tr-feature-val.neg{color:var(--neg);text-shadow:0 0 44px rgba(248,113,113,.28)}
    .tr-feature-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.17em;color:var(--muted);margin-top:13px}
    .tr-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px}
    .tr-cell{background:rgba(255,255,255,.022);border:1px solid var(--line);border-radius:14px;padding:17px 16px}
    .tr-cell-val{font-size:23px;font-weight:750;letter-spacing:-.03em;line-height:1.15;font-variant-numeric:tabular-nums}
    .tr-cell-val.pos{color:var(--pos)}
    .tr-cell-val.neg{color:var(--neg)}
    .tr-cell-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.13em;color:var(--dim);margin-top:6px}
    /* an odd number of secondary metrics: let the last one span so nothing is orphaned */
    .tr-grid > .tr-cell:last-child:nth-child(odd){grid-column:1 / -1}

    /* ---------- proof cards ---------- */
    .chart-card{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:var(--bg2);margin-top:20px;
      box-shadow:0 26px 64px rgba(0,0,0,.42)}
    .chart-head{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.17em;color:var(--dim);padding:15px 20px;border-bottom:1px solid var(--line)}
    /* uploaded images are arbitrary size/quality — contain them so nothing dominates or stretches */
    .chart-body{background:#0d0d10;display:flex;justify-content:center;align-items:center;padding:14px}
    .chart-card img{max-width:100%;max-height:520px;width:auto;height:auto;display:block;border-radius:10px}
    .proof-note{font-size:13px;color:var(--dim);margin-top:18px}
    .proof-note a{color:var(--accent);text-decoration:none;font-weight:600}
    .proof-note a:hover{text-decoration:underline}

    /* ---------- chips ---------- */
    .chips{display:flex;gap:9px;flex-wrap:wrap}
    .chip{background:var(--bg2);border:1px solid var(--line2);border-radius:100px;padding:9px 18px;font-size:13.5px;font-weight:600;color:#d5d5dd}

    /* ---------- prose ---------- */
    .prose{color:#b3b3be;font-size:17.5px;line-height:1.7;white-space:pre-wrap;max-width:62ch;overflow-wrap:anywhere}

    /* ---------- services ---------- */
    .svcs{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
    .svc{position:relative;background:linear-gradient(170deg,var(--bg3),var(--bg2));border:1px solid var(--line);border-radius:var(--radius);padding:28px 26px;
      transition:border-color .18s ease,transform .18s ease}
    .svc:hover{border-color:var(--line2);transform:translateY(-3px)}
    .svc h3{margin-bottom:10px}
    .svc p{font-size:14.5px;line-height:1.6;overflow-wrap:anywhere}

    /* ---------- contact ---------- */
    .cform{display:flex;flex-direction:column;gap:11px;max-width:560px}
    .cform .row{display:flex;gap:11px}
    .cform .row>*{flex:1;min-width:0}
    .cform input,.cform textarea{width:100%;padding:14px 16px;border-radius:13px;border:1px solid var(--line2);background:rgba(255,255,255,.025);color:var(--text);font-size:15px;font-family:inherit;transition:border-color .15s}
    .cform input::placeholder,.cform textarea::placeholder{color:var(--dim)}
    .cform input:focus,.cform textarea:focus{outline:none;border-color:var(--accent)}
    .cform textarea{resize:vertical;min-height:132px}
    .cf-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
    .cform button{align-self:flex-start;margin-top:4px;padding:13px 30px;border-radius:100px;border:none;
      background:linear-gradient(150deg,var(--accent),var(--accent-deep));color:#fff;font-weight:650;font-size:14.5px;cursor:pointer;
      box-shadow:0 10px 32px var(--glow),inset 0 1px 0 rgba(255,255,255,.18);transition:transform .16s}
    .cform button:hover:not(:disabled){transform:translateY(-2px)}
    .cform button:disabled{opacity:.5;cursor:not-allowed;transform:none}
    .cf-msg{font-size:14px;min-height:1.2em}
    .cf-msg.success{color:var(--pos)}.cf-msg.error{color:var(--neg)}
    .socials{display:flex;gap:9px;margin-top:26px}
    .social{width:42px;height:42px;border-radius:12px;border:1px solid var(--line2);background:rgba(255,255,255,.025);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all .16s}
    .social:hover{color:#fff;border-color:var(--accent);transform:translateY(-2px)}

    .disclaimer{font-size:11.5px;color:#55555f;border-top:1px solid var(--line);padding:30px 0;line-height:1.65;max-width:78ch}
    footer{text-align:center;padding:34px 0 44px;color:#55555f;font-size:12.5px}
    footer a{color:var(--muted);text-decoration:none;font-weight:600}
    footer a:hover{color:var(--accent)}

    /* ---------- responsive ---------- */
    @media(max-width:920px){
      .hero{grid-template-columns:1fr;gap:44px;padding:72px 0 64px}
      .section{padding:72px 0}
    }
    @media(max-width:560px){
      .wrap{padding:0 18px}
      .hero{padding:56px 0 52px}
      .section{padding:60px 0}
      .cform .row{flex-direction:column}
      .tr-feature{padding:26px 18px 22px}
      .tr-cell{padding:15px 13px}
      .tr-cell-val{font-size:20px}
      .btn{flex:1;justify-content:center}
    }
    @media(prefers-reduced-motion:reduce){
      *{transition:none!important;scroll-behavior:auto!important}
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="hero${trackCard ? '' : ' solo'}">
      <div class="hero-id">
        ${avatar}
        ${fundedBadge}
        <h1>${name}</h1>
        <div class="role ser">${headline}</div>
        ${location ? `<div class="loc"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>${location}</div>` : ''}
        ${bio ? `<p class="bio">${bio}</p>` : ''}
        <div class="hero-cta">
          <a href="#contact" class="btn btn-primary">Work with me</a>
          ${trackLink}
        </div>
      </div>
      ${trackCard}
    </header>
${body}
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
