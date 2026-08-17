/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { track } from '../lib/track';
import { useSeo } from '../lib/useSeo';

const KIT = 'trader-template';

// YouTube ID of the Trader Kit demo (the unlisted video used in the PearX application).
// Swap this when a better demo lands — it's the only place the video is referenced.
const DEMO_VIDEO_ID = 'biMVNP4qMRw';

// Founding-offer landing page for the Trader Kit. Live spot counter + buy CTA (routes
// into the real kit purchase flow) + email capture for the not-ready. One URL the growth
// hire can drive all trader traffic to, with clear metrics: spots filled, emails captured.
const TraderKit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useSeo({
    title: 'The Trader Kit — see your trading clearly | Porfilr',
    description: 'A trading journal that turns your trades into an equity curve, a P&L calendar and real stats — so you can spot your patterns and improve. Founding price for the first 20 traders, then it goes monthly.',
    canonical: 'https://porfilr.com/trader-kit',
  });

  const [stats, setStats] = useState<{ claimed: number; limit: number; spotsLeft: number; open: boolean } | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/kit-stats?kit=${KIT}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);

  const claimSpot = () => {
    track('founding_claim_clicked', { kit: KIT, spotsLeft: stats?.spotsLeft });
    // Reuse the real purchase flow: /create handles login → kit paywall → checkout.
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/create/${KIT}` } } });
    } else {
      navigate(`/create/${KIT}`);
    }
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving'); setErrMsg('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/kit-waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, kit: KIT, company }),
      });
      const d = await res.json();
      if (res.ok && d.success) { setStatus('done'); track('founding_email_captured', { kit: KIT }); }
      else { setStatus('error'); setErrMsg(d.error || 'Something went wrong.'); }
    } catch {
      setStatus('error'); setErrMsg('Something went wrong. Please try again.');
    }
  };

  const open = !stats || stats.open; // default to open until stats load
  const spotsLeft = stats?.spotsLeft ?? null;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <header className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/"><Logo size={32} /></Link>
        <Link to="/templates" className="text-stone-500 hover:text-stone-800 text-sm font-medium transition">Browse templates</Link>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-10 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          {open
            ? spotsLeft !== null ? `Founding offer · ${spotsLeft} of ${stats!.limit} spots left` : 'Founding offer'
            : 'Founding offer closed'}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          See your trading clearly.
        </h1>
        <p className="text-stone-600 text-lg max-w-xl mx-auto mb-8">
          Log your trades — or import your whole history — and Porfilr shows you what's actually
          happening: your equity curve, a calendar of every green and red day, your real win rate
          and drawdown. Spot the patterns costing you money, and share a page that proves your
          consistency when you need to.
        </p>

        {/* Live counter */}
        {stats && (
          <div className="max-w-sm mx-auto mb-8">
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (stats.claimed / stats.limit) * 100)}%` }}
              />
            </div>
            <p className="text-stone-500 text-sm mt-2">
              <span className="font-bold text-stone-900">{stats.claimed}</span> of {stats.limit} founding spots claimed
            </p>
          </div>
        )}

        {open ? (
          <>
            <button
              onClick={claimSpot}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-4 rounded-xl text-base transition shadow-sm"
            >
              Claim your founding spot
            </button>
            <p className="text-stone-500 text-sm mt-3">
              One-time founding price · lifetime access · then it moves to a monthly plan. No Pro subscription needed.
            </p>
          </>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-stone-900 font-semibold mb-1">Founding spots are gone.</p>
            <p className="text-stone-500 text-sm mb-4">The kit is now on a monthly plan — join the list and we'll send you the link.</p>
          </div>
        )}
      </section>

      {/* What you get */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['P&L calendar', 'Every trading day coloured green or red. See instantly whether you\'re steadily profitable or one big day is carrying weeks of losses.'],
            ['Your equity curve', 'Watch your account actually progress. Where the drawdowns hit, how long recovery took, whether you\'re trending up.'],
            ['The numbers that matter', 'Win rate, profit factor, max drawdown and total return — worked out for you from your own trades, always current.'],
            ['A page worth sharing', 'The same data becomes a clean page you can send to a prop firm or a client. Everything included — custom domain, no branding, analytics.'],
          ].map(([t, b]) => (
            <div key={t} className="bg-white border border-stone-200 rounded-2xl p-6">
              <h3 className="font-bold text-stone-900 mb-1.5">{t}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo video — seeing it work beats reading about it */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-stone-900 text-center mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          See it in action.
        </h2>
        <p className="text-stone-600 text-center mb-6">Log a trade, watch everything update.</p>
        <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}`}
            title="Porfilr Trader Kit demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* Live example — the strongest proof is a real page they can click into */}
      <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          A real trader page.
        </h2>
        <p className="text-stone-600 mb-6">
          This is what yours looks like — the equity curve, the calendar, the numbers. All generated from logged trades.
        </p>
        <a
          href="/templates/trader-template/preview.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          View the live example →
        </a>
      </section>

      {/* How it works — removes the "is this a lot of work?" objection */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-stone-900 text-center mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          Set up in one sitting.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ['1', 'Import your history', 'Export a CSV from MT4, MT5, cTrader or your broker and drop it in. Hundreds of trades in seconds — no manual typing.'],
            ['2', 'See your patterns', 'Your calendar, equity curve and stats appear immediately. This is usually the moment traders find something they did not know about their own trading.'],
            ['3', 'Keep it current', 'Log new trades as you go. Everything recalculates itself — including the page you share.'],
          ].map(([n, t, b]) => (
            <div key={n} className="bg-white border border-stone-200 rounded-2xl p-6">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center mb-3">{n}</div>
              <h3 className="font-bold text-stone-900 mb-1.5">{t}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — answers the objections that quietly stop people buying */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-stone-900 text-center mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          Questions traders ask.
        </h2>
        <div className="space-y-3">
          {[
            ['Do I have to log every trade by hand?',
             'No. Import your whole history from a broker CSV in one go, then add new trades as you close them — that part takes seconds.'],
            ['Is my trading data private?',
             'Yes. Your individual trades and notes are always private to you. Only your summary numbers appear on your page, and only if you turn that on. The calendar is off by default.'],
            ['Does Porfilr verify my results?',
             'No, and we say so plainly on your page. You enter your own numbers. We compute them honestly and show when you last traded — we do not claim to audit them. Anyone telling you otherwise is not being straight with you.'],
            ['What if I stop trading for a while?',
             'Nothing breaks. Your page stays up, and we hide the "last updated" stamp rather than making a quiet period look bad.'],
            ['Do I need the Pro plan too?',
             'No. The kit includes everything — custom domain, analytics, no Porfilr branding. One purchase, nothing else to buy.'],
            ['What happens after the 20 founding spots?',
             'The kit moves to a monthly plan. If you claim a founding spot now, you keep it for life at the one-time price.'],
          ].map(([q, a]) => (
            <details key={q} className="bg-white border border-stone-200 rounded-2xl p-5 group">
              <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between gap-4">
                {q}
                <span className="text-stone-400 group-open:rotate-180 transition flex-none">▾</span>
              </summary>
              <p className="text-stone-600 text-sm leading-relaxed mt-3">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Email capture — the not-ready still become leads */}
      <section className="max-w-md mx-auto px-6 pb-24">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center">
          {status === 'done' ? (
            <>
              <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="font-semibold text-stone-900">You're on the list.</p>
              <p className="text-stone-500 text-sm mt-1">We'll email you before the founding price ends.</p>
            </>
          ) : (
            <>
              <h3 className="font-bold text-stone-900 mb-1">{open ? 'Not ready yet?' : 'Get the monthly link'}</h3>
              <p className="text-stone-500 text-sm mb-4">
                {open ? "We'll email you before the founding price ends." : "We'll send you the link to join."}
              </p>
              <form onSubmit={submitEmail} className="space-y-2.5">
                <input
                  type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name (optional)"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                />
                {/* honeypot */}
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] w-px h-px overflow-hidden" />
                <button
                  type="submit" disabled={status === 'saving'}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition"
                >
                  {status === 'saving' ? 'Adding you…' : 'Notify me'}
                </button>
                {status === 'error' && <p className="text-red-500 text-sm">{errMsg}</p>}
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default TraderKit;
