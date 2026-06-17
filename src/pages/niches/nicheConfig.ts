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

  {
    slug: 'portfolio-website-for-developers',
    niche: 'Developers',
    seoTitle: 'Portfolio Website for Developers — Ship One in 10 Minutes, No Build Step | Porfilr',
    seoDescription:
      'Create a clean developer portfolio website without spending a weekend on it. Showcase projects, link your GitHub, and share one URL on every application. Free to start.',
    h1: 'A developer portfolio without the weekend build.',
    subhead:
      'You could spend a weekend hand-rolling a Next.js site — or fill in your projects, link your GitHub, and ship a sharp portfolio in 10 minutes. One URL for every application and recruiter DM.',
    benefits: [
      {
        title: 'Projects that prove you ship',
        body: 'Highlight what you built, the stack, and the outcome — with links to live demos and repos, not just a résumé bullet.',
      },
      {
        title: 'Skip the yak-shaving',
        body: 'No build config, no hosting setup, no CSS rabbit holes. Spend the time on code that matters, not your own portfolio site.',
      },
      {
        title: 'Built for recruiters and DMs',
        body: 'One clean link for LinkedIn, job applications, and cold outreach — with a contact form that lands in your inbox.',
      },
    ],
    essentials: [
      {
        title: 'A few strong projects',
        body: 'Three to five projects you can talk about in depth beat a wall of half-finished repos. Lead with what’s closest to the role you want.',
      },
      {
        title: 'Stack and your actual role',
        body: 'Name the technologies and what you specifically built — solo project, team feature, or open-source contribution.',
      },
      {
        title: 'Live links and source',
        body: 'A working demo plus a repo lets people verify the work in seconds. That credibility is worth more than any tagline.',
      },
      {
        title: 'An obvious way to reach you',
        body: 'GitHub, LinkedIn, and a contact form so a recruiter who likes your work can act on it immediately.',
      },
    ],
    faq: [
      {
        q: 'Do I need to code my own portfolio to look credible?',
        a: 'Not anymore. Recruiters care about your projects and code, not whether you hand-built the portfolio shell. Porfilr lets you ship a clean, fast site so you can spend your time on work that actually demonstrates your skills.',
      },
      {
        q: 'Can I link my GitHub and live demos?',
        a: 'Yes. Each project can link out to a live demo and its source repo, and you can add your GitHub, LinkedIn, and other profiles to your header and contact section.',
      },
      {
        q: 'How much does it cost?',
        a: 'You can build and publish for free. Pro — all premium templates, a custom domain, and analytics — is a one-time $19 payment, not a subscription.',
      },
      {
        q: 'Can I use my own domain?',
        a: 'Yes. Pro users can connect a custom domain like yourname.dev. Free portfolios get a clean porfilr.com link.',
      },
    ],
  },

  {
    slug: 'portfolio-website-for-photographers',
    niche: 'Photographers',
    seoTitle: 'Free Portfolio Website for Photographers — Show Your Work in 10 Minutes | Porfilr',
    seoDescription:
      'Build a beautiful photography portfolio website with no code and no monthly fees. Full-bleed galleries, a booking-ready contact form, and one link to share. Free to start.',
    h1: 'A photography portfolio that lets the images breathe.',
    subhead:
      'Clean, full-width galleries that put your photos first — no busy templates, no monthly fees. Publish in 10 minutes and share one link that turns viewers into bookings.',
    benefits: [
      {
        title: 'Galleries that show, not shout',
        body: 'Large, uncluttered image layouts that let your photography carry the page instead of competing with it.',
      },
      {
        title: 'No monthly hosting bills',
        body: 'Skip Squarespace’s $200+/yr and Format’s subscription. Publish for free; Pro is a one-time $19, yours forever.',
      },
      {
        title: 'Turn views into bookings',
        body: 'A built-in contact form sends enquiries straight to your inbox and dashboard — so a shoot request never gets lost.',
      },
    ],
    essentials: [
      {
        title: 'A tight, themed selection',
        body: 'Curate by the work you want to book — weddings, portraits, product. A focused set sells better than your entire catalogue.',
      },
      {
        title: 'Big, fast-loading images',
        body: 'Your photos are the product, so they should fill the screen and load quickly on phones, where most people will see them.',
      },
      {
        title: 'Clear services and pricing cues',
        body: 'A short line on what you shoot and how to book removes the guesswork between “gorgeous” and “let’s hire them.”',
      },
      {
        title: 'One link for Instagram and email',
        body: 'A single clean URL for your bio, DMs, and enquiry replies — far more professional than a folder of links.',
      },
    ],
    faq: [
      {
        q: 'Will my photos look high-quality on Porfilr?',
        a: 'Yes. Templates use large, clean gallery layouts designed to showcase photography, and your portfolio is fully responsive so images look sharp on phones, tablets, and desktops.',
      },
      {
        q: 'Can clients book or contact me directly?',
        a: 'Yes. Every portfolio includes a contact form that sends enquiries straight to your email and a messages inbox in your dashboard, so booking requests never slip through.',
      },
      {
        q: 'How much does it cost?',
        a: 'You can build and publish a photography portfolio for free. Pro — all premium templates, a custom domain, and analytics — is a one-time $19 payment, not a recurring subscription.',
      },
      {
        q: 'How is this different from Instagram?',
        a: 'Instagram is a feed you don’t own, with no real way to present services or capture enquiries. Porfilr gives you a standalone website with your name on it, curated galleries, and a booking-ready contact form.',
      },
    ],
  },

  {
    slug: 'portfolio-website-for-writers',
    niche: 'Writers',
    seoTitle: 'Portfolio Website for Writers — Showcase Your Clips in 10 Minutes | Porfilr',
    seoDescription:
      'Create a writer portfolio website with no code. Organize your clips, link published work, and share one link with editors and clients. Free to start, no monthly fees.',
    h1: 'A writing portfolio editors and clients take seriously.',
    subhead:
      'Stop pasting Google Docs links into pitches. Organize your best clips on a clean, professional site and share one link that makes editors and clients trust you faster.',
    benefits: [
      {
        title: 'Clips that are easy to skim',
        body: 'Organize published work by type or topic so an editor can find a relevant sample in seconds — not scroll a messy list.',
      },
      {
        title: 'No code, no monthly fees',
        body: 'Skip the WordPress setup and the Contently lock-in. Fill in your work and publish. Pro is a one-time $19, yours forever.',
      },
      {
        title: 'Pitch with one confident link',
        body: 'A polished URL for cold pitches, your email signature, and LinkedIn — plus a contact form for inbound work.',
      },
    ],
    essentials: [
      {
        title: 'Your strongest clips, curated',
        body: 'Show six to ten pieces that match the work you want more of. Quality and relevance beat a long, unfocused archive.',
      },
      {
        title: 'Context for each piece',
        body: 'Publication, topic, and a one-line note on your role (reported, ghostwritten, edited) help editors place your range fast.',
      },
      {
        title: 'A clear niche or beat',
        body: 'Stating what you write — B2B SaaS, health, travel — helps the right clients self-select and reach out.',
      },
      {
        title: 'An easy way to commission you',
        body: 'Services, rates cues, and a contact form turn an impressed editor into an actual assignment.',
      },
    ],
    faq: [
      {
        q: 'Can I link to articles published elsewhere?',
        a: 'Yes. Each piece can link out to its live published URL, so you can showcase clips across any publication or client site in one place.',
      },
      {
        q: 'Do I need writing samples hosted somewhere first?',
        a: 'No. You can link to work that’s already published online, and add titles, publications, and short descriptions for each piece directly in Porfilr.',
      },
      {
        q: 'How much does it cost?',
        a: 'You can build and publish a writer portfolio for free. Pro — all premium templates, a custom domain, and analytics — is a one-time $19 payment, not a subscription.',
      },
      {
        q: 'Can I use my own domain?',
        a: 'Yes. Pro users can connect a custom domain like yourname.com. Free portfolios get a clean, shareable porfilr.com link.',
      },
    ],
  },
];

export const getNiche = (slug: string) => NICHES.find(n => n.slug === slug);
