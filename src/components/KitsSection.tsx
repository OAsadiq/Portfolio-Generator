import { Link } from "react-router-dom";
import { FREE_TRADE_CAP, KIT_PRICE_USD } from "../lib/plan";

/**
 * Kits on the homepage, alongside Templates.
 *
 * A template is a page. A kit is a page plus the tool that fills it — Porfilr Journal
 * works out a trader's calendar, equity curve and real stats from their trades. That
 * distinction never appeared on the homepage, so the one product we actively sell was
 * invisible to anyone who didn't already know to look for /trading-journal.
 *
 * Deliberately not a copy of the template grid: one live kit and a "what's next" card is
 * honest about where we are. A row of three fake cards to fill the space would be the
 * kind of thing this product is positioned against.
 */

const KITS = [
  {
    id: "trader-template",
    name: "Porfilr Journal",
    for: "Forex & crypto traders",
    href: "/trading-journal",
    live: true,
    blurb:
      "Log your trades — or import your history from Bybit, MEXC, Binance, MT4, MT5 or cTrader — and see your equity curve, a calendar of every green and red day, your real win rate and drawdown.",
    points: [
      "Import instead of typing",
      "Calendar, equity curve, real stats",
      "A page to share, when you want one",
    ],
    accent: "#e0b252",
    bg: "bg-stone-900",
  },
];

const UPCOMING = [
  { name: "Photographers", note: "Client galleries" },
  { name: "Developers", note: "Project case studies" },
  { name: "Writers", note: "Clip library" },
];

export default function KitsSection() {
  return (
    <section className="py-24 px-6 bg-stone-50 border-t border-stone-100">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-14">
          <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-3">Kits</p>
          <h2
            className="text-4xl md:text-5xl font-bold text-stone-900 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Some work needs more<br />than a page.
          </h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            A kit is a template plus the tool that fills it — so your page keeps itself current
            instead of going stale the week after you build it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {KITS.map((k) => (
            <div key={k.id} className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm">
              <div className={`${k.bg} px-7 py-6`}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: k.accent, color: "#0b0e14" }}
                  >
                    Live now
                  </span>
                  <span className="text-stone-400 text-xs">{k.for}</span>
                </div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {k.name}
                </h3>
              </div>

              <div className="p-7 flex flex-col flex-1">
                <p className="text-stone-600 leading-relaxed mb-5">{k.blurb}</p>

                <ul className="space-y-2 mb-6">
                  {k.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-stone-700">
                      <svg className="w-4 h-4 text-emerald-500 flex-none mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <Link
                    to={k.href}
                    className="bg-stone-900 hover:bg-stone-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition"
                  >
                    {/* Names the product rather than reusing "See how it works", which
                        already appears three times on this page and scrolls to a section
                        instead of navigating. Same words, different behaviour, one page. */}
                    Explore {k.name}
                  </Link>
                  {/* The numbers, stated plainly. Vague pricing on a homepage reads as
                      something to be nervous about. */}
                  <p className="text-stone-500 text-sm">
                    Free for your first {FREE_TRADE_CAP} trades · ${KIT_PRICE_USD} once to unlock
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* What's coming. Named honestly as not-yet-built rather than dressed up as
              choices you could make today. */}
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-7 flex flex-col">
            <h3 className="font-bold text-stone-900 mb-1">More kits coming</h3>
            <p className="text-stone-500 text-sm mb-5">
              Same idea, different work. Tell us which one you'd use and it moves up the list.
            </p>

            <ul className="space-y-3 mb-6">
              {UPCOMING.map((u) => (
                <li key={u.name} className="flex items-baseline justify-between gap-3 border-b border-stone-100 pb-2.5 last:border-0">
                  <span className="text-stone-700 text-sm font-medium">{u.name}</span>
                  <span className="text-stone-400 text-xs">{u.note}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/templates"
              className="mt-auto text-orange-600 hover:text-orange-500 text-sm font-medium transition"
            >
              Browse everything →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
