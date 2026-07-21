/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// "Seen once per USER, everywhere" — not just per browser. localStorage is the fast
// local cache; the user_tutorials table is the cross-device source of truth. A DB error
// only falls back to the old per-browser behaviour, so it can never make a tour repeat
// more than before.
async function hasSeen(userId: string | undefined, key: string): Promise<boolean> {
  if (localStorage.getItem(key)) return true;
  if (!userId) return false;
  const { data } = await supabase
    .from('user_tutorials').select('tutorial_key')
    .eq('user_id', userId).eq('tutorial_key', key).maybeSingle();
  if (data) { localStorage.setItem(key, '1'); return true; } // seen on another device
  return false;
}

function markSeen(userId: string | undefined, key: string) {
  localStorage.setItem(key, '1');
  if (userId) {
    // Ignore duplicate-key/other errors — the local flag already prevents repeats.
    supabase.from('user_tutorials').insert({ user_id: userId, tutorial_key: key }).then(() => {}, () => {});
  }
}

export interface TourStep {
  /** CSS selector for the element to spotlight. Omit for a centered, element-less step. */
  selector?: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface Props {
  steps: TourStep[];
  /** Unique localStorage key — the tour auto-runs once per key, then only on demand. */
  storageKey: string;
  /** Accent color for buttons/highlight. */
  accent?: string;
  /** Show the floating "?" relaunch button. Default true. */
  showLauncher?: boolean;
}

const CARD_W = 330;
const GAP = 14;

export default function TutorialTour({ steps, storageKey, accent = '#ea580c', showLauncher = true }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const step = steps[index];

  // Auto-run exactly once per USER, on desktop only.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 768) return; // skip on mobile — the spotlight is janky on small screens
    let cancelled = false;
    (async () => {
      if (await hasSeen(user?.id, storageKey)) return;   // seen on any device → don't show
      if (cancelled) return;
      markSeen(user?.id, storageKey);                    // record immediately, even if not finished
      setTimeout(() => { if (!cancelled) { setIndex(0); setOpen(true); } }, 600);
    })();
    return () => { cancelled = true; };
  }, [storageKey, user?.id]);

  const finish = useCallback(() => {
    markSeen(user?.id, storageKey);
    setOpen(false);
  }, [storageKey, user?.id]);

  const start = () => { setIndex(0); setOpen(true); };

  // Locate the target element and position the spotlight + card.
  const reposition = useCallback(() => {
    if (!open || !step) return;
    const el = step.selector ? document.querySelector(step.selector) : null;
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    const r = el.getBoundingClientRect();
    setRect(r);
  }, [open, index, step]);

  useLayoutEffect(() => { reposition(); }, [reposition]);

  useEffect(() => {
    if (!open) return;
    const onChange = () => reposition();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [open, reposition]);

  // Place the card relative to the spotlight (or center it).
  useLayoutEffect(() => {
    if (!open) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const ch = cardRef.current?.offsetHeight ?? 180;
    const placement = step?.placement || (rect ? 'bottom' : 'center');

    if (!rect || placement === 'center') {
      setCardPos({ top: Math.max(GAP, (vh - ch) / 2), left: (vw - CARD_W) / 2 });
      return;
    }
    let top = 0, left = 0;
    switch (placement) {
      case 'top':    top = rect.top - ch - GAP;  left = rect.left + rect.width / 2 - CARD_W / 2; break;
      case 'left':   top = rect.top + rect.height / 2 - ch / 2; left = rect.left - CARD_W - GAP; break;
      case 'right':  top = rect.top + rect.height / 2 - ch / 2; left = rect.right + GAP; break;
      default:       top = rect.bottom + GAP; left = rect.left + rect.width / 2 - CARD_W / 2; break;
    }
    // Clamp into the viewport.
    left = Math.min(Math.max(GAP, left), vw - CARD_W - GAP);
    top = Math.min(Math.max(GAP, top), vh - ch - GAP);
    setCardPos({ top, left });
  }, [rect, index, open, step]);

  const next = () => { if (index < steps.length - 1) setIndex(i => i + 1); else finish(); };
  const back = () => setIndex(i => Math.max(0, i - 1));

  return (
    <>
      {showLauncher && (
        <button
          onClick={start}
          className="fixed bottom-5 right-5 z-[9998] w-11 h-11 rounded-full bg-white border border-stone-200 shadow-lg hidden md:flex items-center justify-center text-stone-500 hover:text-stone-900 hover:border-stone-300 transition"
          title="Show tutorial"
          aria-label="Show tutorial"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      )}

      {open && step && (
        <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
          {/* Click-blocker (dims via the spotlight's box-shadow, or fully when centered) */}
          <div
            className="absolute inset-0"
            style={{ background: rect ? 'transparent' : 'rgba(15,23,42,0.55)' }}
            onClick={finish}
          />

          {/* Spotlight */}
          {rect && (
            <div
              className="absolute rounded-xl transition-all duration-300 pointer-events-none"
              style={{
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                boxShadow: '0 0 0 9999px rgba(15,23,42,0.55)',
                outline: `2px solid ${accent}`,
                outlineOffset: 2,
              }}
            />
          )}

          {/* Card */}
          <div
            ref={cardRef}
            className="absolute bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 animate-tour-in"
            style={{ top: cardPos.top, left: cardPos.left, width: CARD_W }}
          >
            <button onClick={finish} className="absolute top-3.5 right-3.5 text-stone-300 hover:text-stone-600 transition" aria-label="Close tutorial">
              <X className="w-4 h-4" />
            </button>

            <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>
              Step {index + 1} of {steps.length}
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1.5 pr-5">{step.title}</h3>
            <p className="text-sm text-stone-500 leading-relaxed mb-4">{step.body}</p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-4">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: i === index ? 18 : 6, background: i === index ? accent : '#e7e5e4' }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button onClick={finish} className="text-xs font-semibold text-stone-400 hover:text-stone-600 transition">
                Skip
              </button>
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <button onClick={back} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 text-stone-600 hover:bg-stone-50 transition">
                    Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition"
                  style={{ background: accent }}
                >
                  {index === steps.length - 1 ? 'Got it' : 'Next'}
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes tourIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            .animate-tour-in { animation: tourIn 0.22s cubic-bezier(0.4,0,0.2,1); }
          `}</style>
        </div>
      )}
    </>
  );
}
