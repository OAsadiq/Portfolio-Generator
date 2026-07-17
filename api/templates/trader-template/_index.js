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

  // `meta` carries publish-time context the form data doesn't have:
  //   { slug, journalEnabled, metricsCache }
  // Other templates take (data, sections) and simply ignore a third argument.
  generateHTML: (data, sections = [], meta = {}) => {
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

    // ── Track record: typed figures, or live ones from the trade journal ──────
    // When the journal is on we publish the numbers Porfilr computed from logged
    // trades, baked in at publish time and refreshed at view time. The baked values
    // are the floor: if the fetch fails, the page still shows real numbers rather
    // than dashes. Each cell carries data-metric so the script can update in place.
    const journalOn = !!(meta && meta.journalEnabled && meta.slug);
    const cache = (meta && meta.metricsCache) || {};
    const signed = (v) => (v === null || v === undefined ? null : `${v > 0 ? '+' : ''}${v}%`);
    const plain  = (v, suffix = '') => (v === null || v === undefined ? null : `${v}${suffix}`);

    // [label, value, colourClass, metricKey]
    // Live value wins; the trader's typed figure is the fallback while the journal is
    // still empty. Never invent a value — an absent metric is dropped entirely.
    const metricRows = journalOn
      ? [
          ['Total return',  signed(cache.totalReturnPct)      ?? data.returnPct,    'pos', 'totalReturnPct'],
          ['Win rate',      plain(cache.winRate, '%')         ?? data.winRate,      '',    'winRate'],
          ['Profit factor', plain(cache.profitFactor)         ?? data.profitFactor, '',    'profitFactor'],
          ['Max drawdown',  plain(cache.maxDrawdownPct, '%')  ?? data.maxDrawdown,  'neg', 'maxDrawdownPct'],
          ['Trades',        plain(cache.totalTrades),                               '',    'totalTrades'],
          ['Track record',  cache.trackRecordLabel            ?? data.tradingSince, '',    'trackRecordLabel'],
        ]
      : [
          ['Total return', data.returnPct,    'pos', ''],
          ['Win rate',     data.winRate,      '',    ''],
          ['Profit factor', data.profitFactor,'',    ''],
          ['Max drawdown', data.maxDrawdown,  'neg', ''],
          ['Track record', data.tradingSince, '',    ''],
        ];
    const metrics = metricRows.filter(m => m[1] !== null && m[1] !== undefined && m[1] !== '');

    const attr = (key) => (key ? ` data-metric="${key}"` : '');

    // The one line a screenshot can never claim. Hidden when the journal has gone
    // stale — "updated 8 months ago" damages a trader more than saying nothing.
    const stamp = journalOn
      ? `<span class="tr-stamp" id="trStamp" hidden>Updated <span id="trStampVal"></span></span>`
      : '';

    // The first metric is featured large, the rest fill a grid. Works with 1 or 6.
    const [feat, ...rest] = metrics;
    const trackCard = metrics.length ? `
        <div class="tr-card">
          <div class="tr-head"><span class="tr-head-label">Track record</span>${stamp}</div>
          <div class="tr-feature">
            <div class="tr-feature-val ${feat[2]}"${attr(feat[3])}>${esc(feat[1])}</div>
            <div class="tr-feature-label">${esc(feat[0])}</div>
          </div>
          ${rest.length ? `<div class="tr-grid">${rest.map(([label, val, cls, key]) =>
            `<div class="tr-cell"><div class="tr-cell-val ${cls}"${attr(key)}>${esc(val)}</div><div class="tr-cell-label">${esc(label)}</div></div>`
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

    const initial = name.charAt(0).toUpperCase();
    const avatar = profile
      ? `<img src="${profile}" alt="${name}" class="avatar" />`
      : `<div class="avatar avatar-initials">${initial}</div>`;

    // Browser-tab icon. Their photo when they have one; otherwise a generated monogram
    // rather than the browser's blank page icon — this page gets sent to investors, and
    // a default icon in a tab of open tabs reads as unfinished. Inline SVG keeps the
    // page self-contained (no extra request, nothing to 404).
    const favicon = profile
      ? `<link rel="icon" href="${profile}" />`
      : `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${accent}"/><text x="32" y="45" font-family="Inter,Helvetica,Arial,sans-serif" font-size="36" font-weight="700" fill="#ffffff" text-anchor="middle">${initial}</text></svg>`
        )}" />`;

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
    // Bands alternate dark → light → dark. Consecutive bands of the same tone collapse
    // their inner padding (see CSS), so they read as one continuous region no matter
    // how the trader reorders sections in the builder.
    const dark  = (inner, id = '') => `<div class="band band-dark"${id ? ` id="${id}"` : ''}><div class="wrap">${inner}</div></div>`;
    const light = (inner, id = '') => `<div class="band band-light"${id ? ` id="${id}"` : ''}><div class="wrap">${inner}</div></div>`;

    const blocks = {
      // Dark: the numbers and the evidence belong to the terminal half of the page.
      proof: () => (equity || proofImg || verifyHref) ? dark(`
      <div class="kicker">Proof</div>
      <h2>The receipts<span class="ser"> — not screenshots in a DM.</span></h2>
      ${equity ? `<div class="chart-card"><div class="chart-head">Equity curve</div><div class="chart-body"><img src="${equity}" alt="Equity curve" /></div></div>` : ''}
      ${proofImg ? `<div class="chart-card"><div class="chart-head">Statement / results</div><div class="chart-body"><img src="${proofImg}" alt="Statement / verified results" /></div></div>` : ''}
      ${verifyHref ? `<p class="proof-note">Independently verifiable: <a href="${verifyHref}" target="_blank" rel="noopener">${esc(verifyUrl.replace(/^https?:\/\//, ''))}</a></p>` : ''}`, 'proof') : '',

      // Light: the human story — how they think, how they protect money, what they sell.
      markets: () => markets.length ? light(`
      <div class="kicker">Markets</div>
      <h2>What I trade</h2>
      <div class="chips">${markets.map(m => `<span class="chip">${esc(m)}</span>`).join('')}</div>`) : '',

      strategy: () => strategy ? light(`
      <div class="lcard">
        <div class="lcard-head">
          <div class="kicker">Strategy</div>
          <h2>How I trade<span class="ser"> — and where the edge is.</span></h2>
        </div>
        <p class="prose">${strategy}</p>
      </div>`) : '',

      risk: () => risk ? light(`
      <div class="lcard">
        <div class="lcard-head">
          <div class="kicker">Risk</div>
          <h2>How I protect capital<span class="ser"> — before I grow it.</span></h2>
        </div>
        <p class="prose">${risk}</p>
      </div>`) : '',

      services: () => serviceCards ? light(`
      <div class="kicker">Work with me</div>
      <h2>What I offer</h2>
      <div class="svcs">${serviceCards}</div>`) : '',

      // Dark again to close — the call to action lands against the hero's weight.
      contact: () => dark(`
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
      ${socialRow}`, 'contact'),
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
  ${favicon}
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
      /* light band */
      --l-bg:#f1f1f4;--l-card:#ffffff;--l-text:#0b0b0d;--l-muted:#5f5f6b;--l-dim:#8b8b96;--l-line:#e4e4ea;
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
    body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased;background:var(--bg)}
    .wrap{max-width:1080px;margin:0 auto;padding:0 28px}

    /* ---------- bands: dark → light → dark ---------- */
    .band{padding:104px 0}
    .band-dark{background:var(--bg);color:var(--text)}
    .band-light{background:var(--l-bg);color:var(--l-text)}
    /* The hero's glow belongs to the hero, not to every dark band below it. */
    .band-hero{background:
      radial-gradient(80% 55% at 12% -12%, var(--glow), transparent 62%),
      radial-gradient(58% 46% at 94% 2%, rgba(34,197,94,.07), transparent 58%),
      var(--bg)}
    /* Sections are reorderable, so two bands of the same tone can end up adjacent.
       Collapsing the seam keeps them reading as one region instead of a double gap. */
    .band-light + .band-light,
    .band-dark + .band-dark{padding-top:0}
    /* A hairline only where dark meets dark — light/dark meet on colour alone. */
    .band-dark + .band-dark > .wrap{border-top:1px solid var(--line);padding-top:104px}

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
    /* The band owns the vertical rhythm now. */
    .hero{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;padding:0}
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
    .tr-stamp{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;color:var(--pos);letter-spacing:.02em}
    .tr-stamp::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--pos);box-shadow:0 0 8px var(--pos)}
    .tr-stamp[hidden]{display:none}
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
    .prose{color:#b3b3be;font-size:17.5px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}

    /* ---------- services ---------- */
    .svcs{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
    .svc{position:relative;background:linear-gradient(170deg,var(--bg3),var(--bg2));border:1px solid var(--line);border-radius:var(--radius);padding:28px 26px;
      transition:border-color .18s ease,transform .18s ease}
    .svc:hover{border-color:var(--line2);transform:translateY(-3px)}
    .svc h3{margin-bottom:10px}
    .svc p{font-size:14.5px;line-height:1.6;overflow-wrap:anywhere}

    /* ---------- light band ---------- */
    .band-light h2{color:var(--l-text)}
    .band-light .ser{color:var(--l-dim)}
    .band-light .prose{color:var(--l-muted)}
    .band-light .chip{background:var(--l-card);border-color:var(--l-line);color:#3a3a44;box-shadow:0 1px 2px rgba(10,10,15,.04)}
    /* The big white editorial card: heading left, prose right. */
    .lcard{background:var(--l-card);border:1px solid var(--l-line);border-radius:28px;padding:52px;
      display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:start;
      box-shadow:0 1px 2px rgba(10,10,15,.04),0 12px 40px rgba(10,10,15,.05)}
    .lcard-head h2{margin-bottom:0}
    .lcard-head .ser{display:block}
    .band-light .svc{background:var(--l-card);border-color:var(--l-line);
      box-shadow:0 1px 2px rgba(10,10,15,.04),0 10px 30px rgba(10,10,15,.045)}
    .band-light .svc:hover{border-color:var(--accent-line);transform:translateY(-3px)}
    .band-light .svc h3{color:var(--l-text)}
    .band-light .svc p{color:var(--l-muted)}

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

    /* ---------- footer band ---------- */
    /* Exempt from the dark-on-dark seam rule: the disclaimer is a quiet coda, not a
       new section, and <footer> already draws its own rule below it. */
    .band-foot{padding:56px 0 40px}
    .band-dark + .band-dark.band-foot > .wrap{border-top:0;padding-top:0}
    .disclaimer{font-size:11.5px;color:#55555f;line-height:1.65;max-width:78ch}
    footer{padding-top:28px;margin-top:28px;border-top:1px solid var(--line);color:#55555f;font-size:12.5px}
    footer a{color:var(--muted);text-decoration:none;font-weight:600}
    footer a:hover{color:var(--accent)}

    /* ---------- responsive ---------- */
    @media(max-width:920px){
      .hero{grid-template-columns:1fr;gap:44px;padding:0}
      .band{padding:76px 0}
      .band-dark + .band-dark > .wrap{padding-top:76px}
      .lcard{grid-template-columns:1fr;gap:26px;padding:40px}
    }
    @media(max-width:560px){
      .wrap{padding:0 18px}
      .band{padding:60px 0}
      .band-dark + .band-dark > .wrap{padding-top:60px}
      .lcard{padding:30px 24px;border-radius:22px}
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
  <div class="band band-dark band-hero">
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
    </div>
  </div>
${body}
  <div class="band band-dark band-foot">
    <div class="wrap">
      <p class="disclaimer">${disclaimer}</p>
      <footer>Made with <a href="https://porfilr.com" target="_blank" rel="noopener">Porfilr</a></footer>
    </div>
  </div>

  ${journalOn ? `<script>
    // Live track record. The numbers already on the page were computed at publish
    // time; this refreshes them. Every failure path is silent and leaves the baked-in
    // values in place — a stale-but-real number beats a broken metrics card, which is
    // the single worst thing this page could show an investor.
    (function(){
      var SLUG = ${JSON.stringify(String(meta.slug || ''))};
      if (!SLUG) return;

      function ago(iso){
        var s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
        if (!isFinite(s) || s < 0) return null;
        if (s < 3600)  { var m = Math.floor(s/60);    return m <= 1 ? 'just now' : m + ' minutes ago'; }
        if (s < 86400) { var h = Math.floor(s/3600);  return h === 1 ? '1 hour ago'  : h + ' hours ago'; }
        var d = Math.floor(s/86400);
        if (d === 1)  return 'yesterday';
        if (d < 31)   return d + ' days ago';
        var mo = Math.floor(d/30);
        return mo === 1 ? '1 month ago' : mo + ' months ago';
      }

      function put(key, val, cls){
        var el = document.querySelector('[data-metric="' + key + '"]');
        if (!el) return;
        // Null means "we can't state this honestly" — leave whatever is there rather
        // than blanking a real number.
        if (val === null || val === undefined) return;
        el.textContent = val;
        if (cls) { el.classList.remove('pos','neg'); el.classList.add(cls); }
      }

      fetch('/api/track-record?slug=' + encodeURIComponent(SLUG))
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){
          if (!d || !d.metrics) return;
          var m = d.metrics;
          if (m.totalReturnPct !== null && m.totalReturnPct !== undefined) {
            put('totalReturnPct', (m.totalReturnPct > 0 ? '+' : '') + m.totalReturnPct + '%',
                m.totalReturnPct >= 0 ? 'pos' : 'neg');
          }
          if (m.winRate !== null && m.winRate !== undefined) put('winRate', m.winRate + '%');
          if (m.profitFactor !== null && m.profitFactor !== undefined) put('profitFactor', String(m.profitFactor));
          if (m.maxDrawdownPct !== null && m.maxDrawdownPct !== undefined) put('maxDrawdownPct', m.maxDrawdownPct + '%');
          if (m.totalTrades !== null && m.totalTrades !== undefined) put('totalTrades', String(m.totalTrades));
          if (m.trackRecordLabel) put('trackRecordLabel', m.trackRecordLabel);

          // Only claim freshness when it's true and recent.
          if (!d.stale && d.lastTradeAt) {
            var label = ago(d.lastTradeAt);
            var stamp = document.getElementById('trStamp');
            var val = document.getElementById('trStampVal');
            if (label && stamp && val) { val.textContent = label; stamp.hidden = false; }
          }
        })
        .catch(function(){ /* keep the published numbers */ });
    })();
  </script>` : ''}

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
