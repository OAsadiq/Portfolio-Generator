export interface NicheConfig {
  /** URL slug — keyword-rich, e.g. "portfolio-website-for-graphic-designers". */
  slug: string;
  /** Plural audience name, e.g. "Graphic Designers". */
  niche: string;
  /** SEO <title>. */
  seoTitle: string;
  /** Meta description (~150–160 chars). */
  seoDescription: string;
  /** On-page H1. */
  h1: string;
  /** Sub-headline under the H1. */
  subhead: string;
  /** Three reasons this audience should use Porfilr. */
  benefits: { title: string; body: string }[];
  /** SEO body: "what makes a great [niche] portfolio" checklist items. */
  essentials: { title: string; body: string }[];
  /** FAQ — also rendered as FAQPage JSON-LD for rich snippets. */
  faq: { q: string; a: string }[];
}

export const NICHES: NicheConfig[] = [
  {
    slug: 'portfolio-website-for-graphic-designers',
    niche: 'Graphic Designers',
    seoTitle: 'Free Portfolio Website for Graphic Designers — Build One in 10 Minutes | Porfilr',
    seoDescription:
      'Create a professional graphic design portfolio website — no code, no Behance fees. Showcase your work, get a shareable link, and land more clients. Free to start.',
    h1: 'A portfolio website built for graphic designers.',
    subhead:
      'Showcase your best work on a clean, professional site — no code, no design-tool wrestling. Get a link you can put on every pitch, DM, and résumé in under 10 minutes.',
    benefits: [
      {
        title: 'Your work, front and center',
        body: 'Galleries, case studies, and project samples that let the work speak — not a generic template that buries it.',
      },
      {
        title: 'No code, no monthly bloat',
        body: 'Skip Webflow’s learning curve and Squarespace’s $200/yr. Fill in your details, hit publish, done. Pro is a one-time $19.',
      },
      {
        title: 'Clients can reach you instantly',
        body: 'A built-in contact form sends enquiries straight to your inbox and a dashboard — so leads never slip through.',
      },
    ],
    essentials: [
      {
        title: 'A focused selection of work',
        body: 'Show 6–10 of your strongest pieces, not everything. Lead with the projects closest to the work you want more of.',
      },
      {
        title: 'Context, not just images',
        body: 'A line or two on the brief, your role, and the outcome turns a pretty picture into proof you can solve problems.',
      },
      {
        title: 'A clear way to hire you',
        body: 'Services, availability, and a contact form remove friction between “I like this” and “let’s work together.”',
      },
      {
        title: 'A link that works everywhere',
        body: 'One clean URL for your Instagram bio, email signature, Dribbble profile, and job applications.',
      },
    ],
    faq: [
      {
        q: 'Do I need design or coding skills to use Porfilr?',
        a: 'No. You fill in your details and pick a template — Porfilr generates a polished, responsive portfolio site for you. No code, hosting, or design tools required.',
      },
      {
        q: 'How much does it cost?',
        a: 'You can build and publish a portfolio for free. Pro — which unlocks all premium templates, a custom domain, and analytics — is a one-time $19 payment, not a subscription.',
      },
      {
        q: 'Can I use my own domain?',
        a: 'Yes. Pro users can connect a custom domain like yourname.com. Free portfolios get a clean porfilr.com link you can share anywhere.',
      },
      {
        q: 'How is this different from Behance or Dribbble?',
        a: 'Behance and Dribbble are shared networks where your work sits next to everyone else’s. Porfilr gives you your own standalone website with your name on it — and a contact form that sends leads straight to you.',
      },
    ],
  },
];

export const getNiche = (slug: string) => NICHES.find(n => n.slug === slug);
