import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useSeo } from '../../lib/useSeo';
import { NicheConfig } from './nicheConfig';

const ORIGIN = 'https://porfilr.com';

export default function NicheLanding({ config }: { config: NicheConfig }) {
  const canonical = `${ORIGIN}/${config.slug}`;

  const jsonLd = useMemo(() => [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Porfilr',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url: canonical,
    },
  ], [config.faq, canonical]);

  useSeo({ title: config.seoTitle, description: config.seoDescription, canonical, jsonLd });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full mb-5">
          For {config.niche}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-5 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          {config.h1}
        </h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-8 leading-relaxed">{config.subhead}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/templates" className="bg-stone-900 hover:bg-stone-700 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition inline-flex items-center justify-center gap-2">
            Build my portfolio <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/pricing" className="border border-stone-200 hover:bg-white text-stone-700 px-7 py-3.5 rounded-xl font-semibold text-sm transition">
            See pricing
          </Link>
        </div>
        <p className="text-stone-400 text-xs mt-4">Free to start · No code · Pro is a one-time $19</p>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {config.benefits.map(b => (
            <div key={b.title} className="bg-white border border-stone-200 rounded-2xl p-6">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                <Check className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="font-bold text-stone-900 mb-1.5">{b.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Essentials — SEO body content */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          What makes a great {config.niche.toLowerCase()} portfolio
        </h2>
        <p className="text-stone-500 text-center mb-10 max-w-xl mx-auto">The pieces that turn a page of work into booked clients — all built into Porfilr.</p>
        <div className="space-y-4">
          {config.essentials.map((e, i) => (
            <div key={e.title} className="flex gap-4 bg-white border border-stone-200 rounded-2xl p-5">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
              <div>
                <h3 className="font-bold text-stone-900 mb-1">{e.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{e.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-10 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Live in three steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { t: 'Pick a template', d: 'Choose a clean, professional layout — every one works for design work.' },
            { t: 'Add your details', d: 'Fill in your projects, services, and contact info. No code, no fuss.' },
            { t: 'Share your link', d: 'Publish instantly and drop your link anywhere clients can find you.' },
          ].map((s, i) => (
            <div key={s.t} className="text-center">
              <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{i + 1}</div>
              <h3 className="font-bold text-stone-900 mb-1">{s.t}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-8 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {config.faq.map(f => (
            <details key={f.q} className="bg-white border border-stone-200 rounded-xl overflow-hidden group">
              <summary className="px-5 py-4 font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                {f.q}
                <span className="text-stone-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="px-5 pb-4 text-stone-500 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-stone-900 rounded-3xl px-8 py-14">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to show your work?
          </h2>
          <p className="text-stone-300 mb-8 max-w-md mx-auto">Build a portfolio that gets you hired — free to start, live in 10 minutes.</p>
          <Link to="/templates" className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition">
            Build my portfolio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
