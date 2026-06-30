// Regenerates the static Professional template preview (public/.../preview.html)
// from the live template, so the marketing preview matches the real template
// (including the contact form). Run: node scripts/regen-professional-preview.mjs
import { writeFileSync } from 'fs';
import professional from '../api/templates/professional-writer-template/_index.js';

const data = {
  fullName: 'Jordan Williams',
  headline: 'Product Designer & Strategist',
  bio: 'I help teams turn complex problems into clear, intuitive products. Ten years across fintech, healthtech, and SaaS — from first sketch to shipped feature.',
  primaryColor: '#475569',
  accentColor: '#1e293b',
  location: 'Lisbon, Portugal',
  statement: 'Design that earns its keep.',
  availability: 'true',
  availabilityText: 'Available for new projects',
  resumeUrl: 'https://example.com/cv.pdf',
  layout: 'stacked',
  email: 'hello@jordanwilliams.com',
  social1: 'https://linkedin.com/in/jordanwilliams',
  social2: 'https://twitter.com/jordanwilliams',
  social3: 'https://dribbble.com/jordanwilliams',
  service1Title: 'Product Design', service1Desc: 'End-to-end design from research to shipped UI.',
  service2Title: 'Design Systems', service2Desc: 'Scalable component libraries your team can build on.',
  service3Title: 'UX Strategy', service3Desc: 'Turning business goals into clear product direction.',
  experience1Role: 'Lead Product Designer', experience1Company: 'Finto', experience1Period: '2021 — Present', experience1Description: 'Led design for a payments platform used by 200k+ businesses.',
  experience2Role: 'Senior Designer', experience2Company: 'Healthly', experience2Period: '2018 — 2021', experience2Description: 'Shipped the patient onboarding flow that lifted activation 34%.',
  sample1Title: 'Checkout redesign', sample1Desc: 'Rebuilt the checkout flow and lifted conversion 18%.',
  sample2Title: 'Design system', sample2Desc: 'A 60-component library adopted across 4 product teams.',
  sample3Title: 'Mobile onboarding', sample3Desc: 'A guided first-run that cut drop-off in half.',
  testimonial1Quote: 'Jordan is the rare designer who thinks like a strategist. A joy to work with.', testimonial1Name: 'Sam Carter', testimonial1Role: 'VP Product, Finto',
  testimonial2Quote: 'Shipped faster and cleaner than any designer we’ve worked with.', testimonial2Name: 'Priya Shah', testimonial2Role: 'CEO, Healthly',
  edu1Title: 'BFA, Graphic Design', edu1School: 'Rhode Island School of Design', edu1Year: '2014',
  edu2Title: 'Interaction Design Certificate', edu2School: 'IDEO U', edu2Year: '2017',
};

const html = professional.generateHTML(data, []);
const dest = new URL('../public/templates/professional-writer-template/preview.html', import.meta.url);
writeFileSync(dest, html, 'utf8');
console.log('Regenerated professional preview.html —', html.length, 'chars · contact form:', html.includes('id="contactForm"'));
