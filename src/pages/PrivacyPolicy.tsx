"use client";

import { useState, useEffect, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

interface PolicySection {
  id: string;
  title: string;
  icon: string;
  content: {
    type: "paragraph" | "list" | "highlight";
    text?: string;
    items?: string[];
  }[];
}

const SECTIONS: PolicySection[] = [
  {
    id: "collect",
    title: "Information We Collect",
    icon: "📥",
    content: [
      {
        type: "paragraph",
        text: "We collect only the information necessary to provide you with our portfolio-building service. We believe in data minimalism — if we don't need it, we don't collect it.",
      },
      {
        type: "highlight",
        text: "We only collect what we need. No hidden tracking, no unnecessary data points.",
      },
      {
        type: "list",
        items: [
          "Name and email address — provided via Google Sign-In during account creation.",
          "Google profile picture — displayed on your portfolio if you choose to use it.",
          "Portfolio content you create — text, images, and layout preferences you configure inside the builder.",
          "Basic usage data — anonymised signals to help us improve the product (e.g. which templates are popular).",
        ],
      },
    ],
  },
  {
    id: "use",
    title: "How We Use Your Data",
    icon: "⚙️",
    content: [
      {
        type: "paragraph",
        text: "Every piece of data we hold has a clear, defined purpose. We never sell your information, and we never use it for anything beyond what is described here.",
      },
      {
        type: "list",
        items: [
          "Authenticate your identity and maintain your session securely.",
          "Store and retrieve your portfolio projects so they persist across devices.",
          "Personalise the builder experience based on your saved preferences.",
          "Send you transactional emails only — password resets, signup confirmations, and critical account notices.",
          "Analyse anonymised, aggregated usage patterns to improve Foliobase.",
        ],
      },
      {
        type: "paragraph",
        text: "We do not use your data for advertising, profiling, or any form of automated decision-making.",
      },
    ],
  },
  {
    id: "google",
    title: "Sign In with Google",
    icon: "🔐",
    content: [
      {
        type: "paragraph",
        text: "Foliobase uses Google OAuth to let you sign in quickly and securely. When you click \"Sign in with Google\", you are redirected to Google's own authentication flow.",
      },
      {
        type: "highlight",
        text: "We request only the minimum scopes: your email address, name, and profile picture. Nothing else.",
      },
      {
        type: "list",
        items: [
          "Google shares your name, email, and profile picture with us after you grant consent.",
          "We store a secure token — never your Google password or sensitive credentials.",
          "You can revoke Foliobase's access at any time via your Google Account → Third-party apps & services.",
          "Refer to Google's Privacy Policy for details on how Google handles your data during this flow.",
        ],
      },
    ],
  },
  {
    id: "storage",
    title: "Data Storage & Security",
    icon: "🛡️",
    content: [
      {
        type: "paragraph",
        text: "We take the security of your data seriously. Our infrastructure is built on industry-trusted, SOC 2-compliant services.",
      },
      {
        type: "list",
        items: [
          "All data is stored via Supabase, which encrypts data at rest (AES-256) and in transit (TLS 1.3).",
          "Authentication tokens are short-lived and rotated automatically.",
          "Portfolio images are stored in object storage with strict access controls — only you can see your unpublished work.",
          "We do not store data in any jurisdiction outside the EU / US without your knowledge.",
        ],
      },
      {
        type: "paragraph",
        text: "No method of transmission over the internet is 100 % secure. We minimise risk, but we cannot guarantee absolute security. If you become aware of any breach, please contact us immediately.",
      },
    ],
  },
  {
    id: "sharing",
    title: "Data Sharing",
    icon: "🤝",
    content: [
      {
        type: "paragraph",
        text: "We do not sell, trade, or rent your personal information to third parties. The only situations in which data leaves Foliobase are outlined below.",
      },
      {
        type: "list",
        items: [
          "Service providers — We use Google (auth), Supabase (database & storage), and Vercel (hosting). Each is bound by their own privacy policies.",
          "Legal obligation — We may disclose information if required by law, court order, or governmental regulation.",
          "Published portfolios — Content you choose to publish is publicly visible by design. You control what is shared.",
        ],
      },
      {
        type: "highlight",
        text: "We never sell your data. Period. Our business model does not depend on monetising your personal information.",
      },
    ],
  },
  {
    id: "rights",
    title: "Your Rights",
    icon: "⚖️",
    content: [
      {
        type: "paragraph",
        text: "Depending on your location, you may have additional rights under applicable data-protection laws (e.g. GDPR, CCPA). Regardless of where you are, we honour the following:",
      },
      {
        type: "list",
        items: [
          "Access — View all personal data we hold about you at any time.",
          "Correction — Request updates to any inaccurate information.",
          "Deletion — Ask us to permanently delete your account and all associated data.",
          "Portability — Export your portfolio content in a standard format.",
          "Opt-out — Unsubscribe from non-essential communications at any time.",
        ],
      },
      {
        type: "paragraph",
        text: "To exercise any of these rights, simply email us at privacy@foliobase.com. We will respond within 30 days.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies & Local Storage",
    icon: "🍪",
    content: [
      {
        type: "paragraph",
        text: "We keep things simple. Foliobase uses minimal cookies and browser storage — only what is technically necessary to run the product.",
      },
      {
        type: "list",
        items: [
          "Session cookie — Keeps you logged in during an active session. Deleted when you close the browser.",
          "Theme preference — Stored in local storage to remember your light/dark mode choice.",
          "No third-party tracking cookies are placed on your device by Foliobase.",
        ],
      },
      {
        type: "highlight",
        text: "We do not use cookies for advertising or cross-site tracking. What you see is what you get.",
      },
    ],
  },
  {
    id: "children",
    title: "Children's Privacy",
    icon: "👶",
    content: [
      {
        type: "paragraph",
        text: "Foliobase is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.",
      },
      {
        type: "paragraph",
        text: "If you believe a child under 13 has provided us with personal information, please contact us at privacy@foliobase.com so we can promptly delete that information.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    icon: "📝",
    content: [
      {
        type: "paragraph",
        text: "We may update this privacy policy from time to time. When we do, we will revise the \"Last updated\" date at the top of this page.",
      },
      {
        type: "paragraph",
        text: "If the change is material, we will notify you via email or an in-app banner before it takes effect. Continued use of Foliobase after the effective date constitutes acceptance of the updated policy.",
      },
      {
        type: "highlight",
        text: "We promise to notify you of any significant changes before they go into effect — no surprises.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: "✉️",
    content: [
      {
        type: "paragraph",
        text: "Questions, concerns, or feedback about this policy? We're happy to talk.",
      },
      {
        type: "list",
        items: [
          "Email: privacy@foliobase.com",
          "General support: support@foliobase.com",
          "Website: https://foliobase.vercel.app",
        ],
      },
      {
        type: "paragraph",
        text: "We typically respond within 24–48 hours on business days.",
      },
    ],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Highlight({ text }: { text: string }) {
  return (
    <div className="relative border border-indigo-500/20 bg-gradient-to-r from-indigo-500/[0.08] to-pink-500/[0.04] rounded-xl px-5 py-4 my-4">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-pink-500" />
      <p className="text-sm text-slate-200 font-medium leading-relaxed">{text}</p>
    </div>
  );
}

function SectionNum({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/[0.2] to-pink-500/[0.15] border border-slate-700 text-indigo-400 text-xs font-bold flex-shrink-0">
      {String(n).padStart(2, "0")}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const contentRef = useRef<HTMLDivElement>(null);

  // Intersection-observer based active-section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    contentRef.current
      ?.querySelectorAll<HTMLElement>("[data-section]")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/70 backdrop-blur-sm">
        <a href="https://foliobase.vercel.app" className="text-lg font-bold" >
          Folio<span className="text-yellow-400">base</span>
        </a>
        <a
          href="https://foliobase.vercel.app"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors duration-200 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back to Home
        </a>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center px-4 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900 text-slate-500 text-xs font-semibold uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          Up to date
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-3 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto">
          We're transparent about how we collect, use, and protect your information — no hidden surprises.
        </p>
        <p className="text-slate-600 text-xs mt-3">Last updated: January 31, 2026</p>
      </section>

      {/* ── Body layout ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-8 pb-24">

        {/* ── Sticky TOC ── */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="lg:sticky lg:top-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3 pb-3 border-b border-slate-800">
              Contents
            </p>
            <ol className="space-y-0.5">
              {SECTIONS.map((sec, i) => (
                <li key={sec.id}>
                  <button
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors duration-200 ${
                      activeSection === sec.id
                        ? "bg-slate-800 text-slate-100"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="text-slate-600 text-[0.65rem] w-4 text-right flex-shrink-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        {/* ── Sections ── */}
        <div ref={contentRef} className="flex-1 min-w-0 space-y-10">
          {SECTIONS.map((sec, i) => (
            <article
              key={sec.id}
              id={sec.id}
              data-section={sec.id}
              className="scroll-mt-6"
            >
              {/* Section heading */}
              <h2 className="flex items-center gap-3 mb-4">
                <SectionNum n={i + 1} />
                <span className="text-lg font-semibold text-slate-100 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {sec.icon} {sec.title}
                </span>
              </h2>

              {/* Section body */}
              <div className="pl-11">
                {sec.content.map((block, j) => {
                  if (block.type === "paragraph") {
                    return (
                      <p key={j} className="text-slate-400 text-sm leading-[1.85] mb-3">
                        {block.text}
                      </p>
                    );
                  }
                  if (block.type === "highlight") {
                    return <Highlight key={j} text={block.text!} />;
                  }
                  if (block.type === "list") {
                    return (
                      <ul key={j} className="mb-3 space-y-2">
                        {block.items!.map((item, k) => (
                          <li key={k} className="flex gap-2.5 text-sm text-slate-400 leading-[1.8]">
                            <span className="mt-[0.55rem] flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Divider (skip on last) */}
              {i < SECTIONS.length - 1 && (
                <div className="mt-8 border-b border-slate-800" />
              )}
            </article>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-20 text-center text-sm text-slate-500 bg-slate-900/50 border-t border-slate-800 p-8 backdrop-blur-sm">
        © 2025 <a href="https://foliobase.vercel.app" className="hover:text-yellow-400 hover:underline transition">Foliobase</a> | 
        <a href="/contact" className="ml-2 text-slate-500 hover:text-yellow-400 hover:underline transition">Contact Us</a> | 
        <a href="/privacy-policy" className="ml-2 text-slate-500 hover:text-yellow-400 hover:underline transition">Privacy Policy</a>
      </footer>
    </div>
  );
}