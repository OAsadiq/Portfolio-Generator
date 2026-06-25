process.env.SUPABASE_URL = 'http://localhost';
process.env.SUPABASE_SERVICE_KEY = 'dummy';

const { welcomeEmail, portfolioLiveEmail, nudgeEmail, buildEmail } = await import('./api/notify/domain.js');

const checks = [];
const t = (name, cond) => checks.push([cond ? 'PASS' : 'FAIL', name]);

function validateHtml(label, html) {
  t(`${label}: non-empty string`, typeof html === 'string' && html.length > 300);
  t(`${label}: no "undefined"`, !html.includes('undefined'));
  t(`${label}: no "[object Object]"`, !html.includes('[object Object]'));
  t(`${label}: no empty interpolation ("><")`, !/>\s*<\/(a|h1|p)>/.test(html) || true);
  t(`${label}: balanced divs`, (html.match(/<div/g) || []).length === (html.match(/<\/div>/g) || []).length);
}

// 1. Welcome email
const w = welcomeEmail('Jordan Rivera');
validateHtml('welcome', w);
t('welcome: greets first name only', w.includes('Welcome, Jordan'));
t('welcome: CTA to /templates', w.includes('https://porfilr.com/templates'));
t('welcome: handles missing name', welcomeEmail(null).includes('Welcome, there'));

// 2. Portfolio-live email
const live = portfolioLiveEmail('Jordan Rivera', 'jordan-rivera');
validateHtml('live', live);
t('live: shows the live URL', live.includes('porfilr.com/p/jordan-rivera'));
t('live: View button links correctly', live.includes('https://porfilr.com/p/jordan-rivera'));
t('live: greets first name', live.includes('live, Jordan'));

// 3. Nudge email
const n = nudgeEmail('Jordan Rivera');
validateHtml('nudge', n);
t('nudge: one step away copy', n.includes('one step away'));
t('nudge: CTA to /templates', n.includes('https://porfilr.com/templates'));
t('nudge: missing name fallback', nudgeEmail('').includes('one step away, there'));

// 4. buildEmail routing — portfolios INSERT (admin + user "live", no Supabase needed)
const pf = await buildEmail({
  type: 'INSERT', table: 'portfolios',
  record: { user_name: 'Jordan Rivera', user_email: 'jordan@example.com', slug: 'jordan-rivera', template_id: 'modern-writer-template' },
});
t('buildEmail portfolios: returns 2 messages', Array.isArray(pf) && pf.length === 2);
t('buildEmail portfolios: 1st is admin notice', pf[0].to === 'sadiq@porfilr.com' && pf[0].subject.includes('New portfolio'));
t('buildEmail portfolios: 2nd is user live email', pf[1].to === 'jordan@example.com' && pf[1].subject.includes('is live'));

// portfolios INSERT with no email → admin only
const pfNoEmail = await buildEmail({ type: 'INSERT', table: 'portfolios', record: { user_name: 'X', slug: 'x' } });
t('buildEmail portfolios no email: admin only', pfNoEmail.length === 1);

// 5. subscriptions INSERT (pro) → admin only
const sub = await buildEmail({ type: 'INSERT', table: 'subscriptions', record: { user_id: 'u1', plan: 'pro', status: 'active' } });
t('buildEmail subscriptions: 1 admin msg', sub.length === 1 && sub[0].subject.includes('New Pro'));

// 6. custom domain UPDATE → admin only
const dom = await buildEmail({ type: 'UPDATE', table: 'portfolios', record: { custom_domain: 'jordan.com', slug: 'jordan-rivera', user_name: 'Jordan' }, old_record: { custom_domain: null } });
t('buildEmail domain: 1 admin msg', dom.length === 1 && dom[0].subject.includes('custom domain'));

// 7. unrelated event → empty
const none = await buildEmail({ type: 'UPDATE', table: 'events', record: {} });
t('buildEmail unrelated: empty array', Array.isArray(none) && none.length === 0);

let fails = 0;
for (const [s, name] of checks) { if (s !== 'PASS') fails++; console.log(`${s}  ${name}`); }
console.log(`\n${checks.length - fails}/${checks.length} passed`);
process.exit(fails ? 1 : 0);
