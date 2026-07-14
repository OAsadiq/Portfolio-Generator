// Regenerates ALL static template previews (public/templates/<id>/preview.html)
// from the live templates, so the marketing previews always match the real
// templates (sections, contact form, etc.).
//   Run: node scripts/regen-previews.mjs
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import minimal from '../api/templates/minimal-template/_index.js';
import modern from '../api/templates/modern-writer-template/_index.js';
import professional from '../api/templates/professional-writer-template/_index.js';
import trader from '../api/templates/trader-template/_index.js';

// Superset of fields — each template reads the ones it uses and ignores the rest.
const data = {
  fullName: 'Jordan Williams',
  role: 'Product Designer & Strategist',
  headline: 'Product Designer & Strategist',
  bio: 'I help teams turn complex problems into clear, intuitive products. Ten years across fintech, healthtech, and SaaS — from first sketch to shipped feature.',
  profileImage: '',
  email: 'hello@jordanwilliams.com',
  location: 'Lisbon, Portugal',
  primaryColor: '#475569',
  accentColor: '#1e293b',
  statement: 'Design that earns its keep.',
  availability: 'true',
  availabilityText: 'Available for new projects',
  resumeUrl: 'https://example.com/cv.pdf',
  layout: 'stacked',

  // socials
  social1: 'https://linkedin.com/in/jordanwilliams',
  social2: 'https://twitter.com/jordanwilliams',
  social3: 'https://dribbble.com/jordanwilliams',
  linkedin: 'https://linkedin.com/in/jordanwilliams',
  twitter: 'https://twitter.com/jordanwilliams',

  // skills (modern)
  skill1: 'UX Strategy', skill2: 'Prototyping', skill3: 'Design Systems',
  skill4: 'User Research', skill5: 'Figma', skill6: 'Design Ops',

  // stats (modern)
  stat1Value: '10+', stat1Label: 'Years experience',
  stat2Value: '40+', stat2Label: 'Products shipped',
  stat3Value: '200k', stat3Label: 'Users reached',

  // trusted-by (modern)
  clients: 'Finto, Healthly, Acme, Northwind, Globex',

  // services
  service1Title: 'Product Design', service1Desc: 'End-to-end design from research to shipped UI.',
  service2Title: 'Design Systems', service2Desc: 'Scalable component libraries your team can build on.',
  service3Title: 'UX Strategy', service3Desc: 'Turning business goals into clear product direction.',

  // experience (professional)
  experience1Role: 'Lead Product Designer', experience1Company: 'Finto', experience1Period: '2021 — Present', experience1Description: 'Led design for a payments platform used by 200k+ businesses.',
  experience2Role: 'Senior Designer', experience2Company: 'Healthly', experience2Period: '2018 — 2021', experience2Description: 'Shipped the patient onboarding flow that lifted activation 34%.',

  // work samples / case studies
  sample1Title: 'Checkout redesign', sample1Desc: 'Rebuilt the checkout flow and lifted conversion 18%.',
  sample2Title: 'Design system', sample2Desc: 'A 60-component library adopted across 4 product teams.',
  sample3Title: 'Mobile onboarding', sample3Desc: 'A guided first-run that cut drop-off in half.',
  case1Title: 'Checkout redesign', case1Desc: 'Rebuilt the checkout flow and lifted conversion 18%.', case1Client: 'Finto',
  case2Title: 'Design system', case2Desc: 'A 60-component library adopted across 4 product teams.', case2Client: 'Healthly',

  // testimonials
  testimonial1Quote: 'Jordan is the rare designer who thinks like a strategist. A joy to work with.', testimonial1Name: 'Sam Carter', testimonial1Role: 'VP Product, Finto',
  testimonial2Quote: 'Shipped faster and cleaner than any designer we’ve worked with.', testimonial2Name: 'Priya Shah', testimonial2Role: 'CEO, Healthly',

  // education (professional)
  edu1Title: 'BFA, Graphic Design', edu1School: 'Rhode Island School of Design', edu1Year: '2014',
  edu2Title: 'Interaction Design Certificate', edu2School: 'IDEO U', edu2Year: '2017',

  // trader
  headline: 'Forex Trader • FTMO Funded',
  propFirm: 'FTMO Funded • $200K',
  returnPct: '+142%', winRate: '68%', profitFactor: '2.4', maxDrawdown: '8.2%', tradingSince: '3 years',
  verificationUrl: 'https://www.myfxbook.com/members/jordan',
  proofImage: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 260"><rect width="900" height="260" fill="#141418"/><text x="30" y="50" fill="#9a9aa5" font-family="monospace" font-size="15">Account #482910 — Verified Statement</text><text x="30" y="95" fill="#f5f5f7" font-family="monospace" font-size="15">Closed P/L ............ +$28,420.00</text><text x="30" y="130" fill="#22c55e" font-family="monospace" font-size="15">Return ............... +142.0%</text><text x="30" y="165" fill="#f5f5f7" font-family="monospace" font-size="15">Win rate ............. 68%</text><text x="30" y="200" fill="#f87171" font-family="monospace" font-size="15">Max drawdown ......... 8.2%</text></svg>'),
  markets: 'Forex, Indices, Crypto',
  strategy: 'Swing trading major forex pairs and indices on the 4H timeframe. My edge is disciplined trend continuation setups with strict risk-defined entries — no averaging down, no revenge trading.',
  riskProfile: 'Max 1% risk per trade, hard stop on every position, and a 5% daily loss limit. Capital preservation comes before returns — that consistency is what keeps me funded.',
};

const templates = [
  ['minimal-template', minimal],
  ['modern-writer-template', modern],
  ['professional-writer-template', professional],
  ['trader-template', trader],
];

for (const [id, tpl] of templates) {
  const html = tpl.generateHTML(data, []);
  const dest = fileURLToPath(new URL(`../public/templates/${id}/preview.html`, import.meta.url));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html, 'utf8');
  console.log(`${id}: ${html.length} chars · contact form: ${html.includes('id="contactForm"')}`);
}
console.log('Done — all previews regenerated.');
