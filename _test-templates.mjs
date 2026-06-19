import modern from './api/templates/modern-writer-template/_index.js';
import professional from './api/templates/professional-writer-template/_index.js';
import minimal from './api/templates/minimal-template/_index.js';

const data = {
  fullName: 'Jordan Rivera',
  email: 'jordan@example.com',
  headline: 'Product Designer & Strategist',
  role: 'Product Designer & Strategist',
  bio: 'I help teams turn messy problems into clear, shippable products. Ten years across fintech and SaaS.',
  location: 'Lisbon, Portugal',
  profileImage: 'https://example.com/me.jpg',
  primaryColor: '#475569',
  accentColor: '#1e293b',
  availability: 'true',
  availabilityText: 'Available for work',
  statement: 'Design that earns its keep.',
  resumeUrl: 'https://example.com/cv.pdf',
  skill1: 'UX Strategy', skill2: 'Prototyping', skill3: 'Design Systems',
  service1Title: 'Product Design', service1Desc: 'End-to-end product work.',
  stat1Value: '10+', stat1Label: 'Years',
  social1: 'https://linkedin.com/in/jordan', social2: 'https://github.com/jordan',
  linkedin: 'https://linkedin.com/in/jordan',
  edu1Title: 'BFA Design', edu1School: 'RISD', edu1Year: '2014',
  experience1Role: 'Lead Designer', experience1Company: 'Acme', experience1Period: '2020–2024',
  sample1Title: 'Checkout redesign', sample1Desc: 'Lifted conversion 18%.',
  testimonial1Quote: 'A joy to work with.', testimonial1Name: 'Sam', testimonial1Role: 'PM',
};

const checks = [];
function test(name, fn) {
  try { const r = fn(); checks.push([r ? 'PASS' : 'FAIL', name]); }
  catch (e) { checks.push(['ERR ', name + ' → ' + e.message]); }
}

for (const [id, tpl, contactFormId] of [
  ['modern', modern, 'contactForm'],
  ['professional', professional, 'contactForm'],
  ['minimal', minimal, 'contactForm'],
]) {
  const html = tpl.generateHTML(data, []);
  test(`${id}: returns non-empty string`, () => typeof html === 'string' && html.length > 1500);
  test(`${id}: has <!DOCTYPE`, () => html.includes('<!DOCTYPE html'));
  test(`${id}: contact form present`, () => html.includes(`id="${contactFormId}"`));
  test(`${id}: form posts to /api/contact`, () => html.includes("/api/contact"));
  test(`${id}: owner email baked into form`, () => html.includes('jordan@example.com'));
  test(`${id}: honeypot field present`, () => html.includes('name="company"'));
  test(`${id}: no literal "undefined"`, () => !html.includes('undefined'));
  test(`${id}: no "[object Object]"`, () => !html.includes('[object Object]'));
  test(`${id}: balanced <section> tags`, () => (html.match(/<section/g)||[]).length === (html.match(/<\/section>/g)||[]).length);
  test(`${id}: balanced <form> tags`, () => (html.match(/<form/g)||[]).length === (html.match(/<\/form>/g)||[]).length);
  test(`${id}: <script> balanced`, () => (html.match(/<script/g)||[]).length === (html.match(/<\/script>/g)||[]).length);
}

// Contact section must NOT render when no email is set.
for (const [id, tpl] of [['modern', modern], ['professional', professional], ['minimal', minimal]]) {
  const noEmail = tpl.generateHTML({ ...data, email: '' }, []);
  test(`${id}: form hidden when email empty`, () => !noEmail.includes('id="contactForm"'));
}

let fails = 0;
for (const [status, name] of checks) {
  if (status !== 'PASS') fails++;
  console.log(`${status}  ${name}`);
}
console.log(`\n${checks.length - fails}/${checks.length} passed`);
process.exit(fails ? 1 : 0);
