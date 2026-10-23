import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { listFinishers, wallEnabled, type Finisher } from '../lib/finishersWall';
import { useSeo } from '../lib/useSeo';

/**
 * The 15-Trade Challenge finishers' wall.
 *
 * Shows who journaled a full month and what share of it went to plan. Consistency, not
 * returns: there is no money on this page and no ranking by performance, deliberately.
 * A leaderboard of profits would be a different product, and one that invites a kind of
 * scrutiny we have no reason to attract.
 *
 * Hidden entirely unless VITE_FINISHERS_WALL=true. An empty wall says "nobody does this",
 * which is worse than no wall at all.
 */
export default function FinishersWall() {
  const [rows, setRows] = useState<Finisher[] | null>(null);
  const [error, setError] = useState('');

  useSeo({
    title: 'Finishers — the 15-Trade Challenge · Porfilr',
    description: 'Traders who journaled a full month and tagged how it went. Consistency, not returns.',
    canonical: 'https://porfilr.com/finishers',
  });

  useEffect(() => {
    if (!wallEnabled()) return;
    listFinishers()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the wall.'));
  }, []);

  if (!wallEnabled()) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Not open yet</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            The finishers' wall opens once the first traders have completed a month.
            Start journaling and you could be on it.
          </p>
          <Link to="/trading-journal">
            <button className="mt-6 bg-stone-900 hover:bg-stone-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
              Start your journal
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const byMonth = (rows || []).reduce<Record<string, Finisher[]>>((acc, r) => {
    (acc[r.year_month] = acc[r.year_month] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-3">
          15-Trade Challenge
        </p>
        <h1 className="text-4xl font-bold text-stone-900 mb-3">Finishers</h1>
        <p className="text-stone-500 text-sm leading-relaxed max-w-xl mb-10">
          Traders who journaled a full month and tagged how each trade went. The score is
          the share that went to plan — not how much they made. Porfilr doesn't audit any
          of it; these are each trader's own numbers, computed from what they logged.
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {!rows && !error && <div className="h-4 w-32 bg-stone-100 rounded animate-pulse" />}

        {rows && rows.length === 0 && (
          <p className="text-stone-400 text-sm">No finishers yet. The first one could be you.</p>
        )}

        {Object.entries(byMonth).map(([month, list]) => (
          <section key={month} className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
              {month}
            </h2>
            <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
              {list.map((f, i) => (
                <div key={`${f.year_month}-${i}`} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 text-sm truncate">{f.display_name}</p>
                    {f.handle && (
                      <a
                        href={`https://x.com/${f.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-400 hover:text-stone-600 text-xs"
                      >
                        @{f.handle}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0 text-right">
                    <div>
                      <p className="font-bold text-stone-900 text-sm tabular-nums">{f.trades}</p>
                      <p className="text-[10px] uppercase tracking-wide text-stone-400">Journaled</p>
                    </div>
                    <div>
                      <p className="font-bold text-emerald-700 text-sm tabular-nums">{f.score_pct}%</p>
                      <p className="text-[10px] uppercase tracking-wide text-stone-400">On plan</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <p className="text-stone-400 text-xs leading-relaxed mt-10">
          Ordered by trades journaled, never by profit. This is a record of consistency,
          not a performance ranking.
        </p>
      </div>
      <Footer />
    </div>
  );
}
