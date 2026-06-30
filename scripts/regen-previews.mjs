// Regenerates ALL static template previews (public/templates/<id>/preview.html)
// from the live templates, so the marketing previews always match the real
// templates (sections, contact form, etc.).
//   Run: node scripts/regen-previews.mjs
import { writeFileSync } from 'fs';
import minimal from '../api/templates/minimal-template/_index.js';
import modern from '../api/templates/modern-writer-template/_index.js';
import professional from '../api/templates/professional-writer-template/_index.js';

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
};

const templates = [
  ['minimal-template', minimal],
  ['modern-writer-template', modern],
  ['professional-writer-template', professional],
];

for (const [id, tpl] of templates) {
  const html = tpl.generateHTML(data, []);
  const dest = new URL(`../public/templates/${id}/preview.html`, import.meta.url);
  writeFileSync(dest, html, 'utf8');
  console.log(`${id}: ${html.length} chars · contact form: ${html.includes('id="contactForm"')}`);
}
console.log('Done — all previews regenerated.');
