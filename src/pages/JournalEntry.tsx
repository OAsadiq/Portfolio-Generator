/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { track } from '../lib/track';

const KIT_TEMPLATE = 'trader-template';

/**
 * /journal — the journal's front door, with no page required.
 *
 * The journal lives at /journal/:slug and hangs off a portfolios row, which used to mean
 * you had to build and publish a page before you could log a single trade. That order is
 * why six of eight kit owners never logged anything: we asked for the work before we gave
 * them the reason.
 *
 * So this route finds the user's trader page, or creates a DRAFT one — a row that exists
 * only to give the journal a home. A draft is never publicly reachable (api/p/index.js
 * filters on status='active') and never counts against their portfolio slot allowance.
 * Publishing later adopts the same row, so trades stay attached to it.
 */
export default function JournalEntry() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      localStorage.setItem('porfilr_after_login', '/journal');
      navigate('/login', { state: { from: { pathname: '/journal' } }, replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // Prefer a published page; fall back to an existing draft. Newest first so a
        // rebuilt page wins over an abandoned one.
        const { data: existing, error: e1 } = await supabase
          .from('portfolios')
          .select('slug, status')
          .eq('user_id', user.id)
          .eq('template_id', KIT_TEMPLATE)
          .order('created_at', { ascending: false });
        if (e1) throw e1;

        const active = (existing || []).find((p) => p.status === 'active');
        const draft = (existing || []).find((p) => p.status === 'draft');
        const found = active || draft;
        if (found) {
          if (!cancelled) navigate(`/journal/${found.slug}`, { replace: true });
          return;
        }

        // Nothing yet — make the draft. The slug is provisional: we don't know their
        // trading name at this point, and publishing rewrites it. Nothing links here in
        // the meantime, so a throwaway slug costs nothing.
        const base = (user.email || 'trader').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'trader';
        const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;

        const { data: created, error: e2 } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            slug,
            user_name: user.user_metadata?.full_name || '',
            user_email: user.email,
            template_id: KIT_TEMPLATE,
            form_data: {},
            sections: [],
            status: 'draft',
          })
          .select('slug')
          .single();
        if (e2) throw e2;

        track('journal_draft_created', { slug: created.slug });
        if (!cancelled) navigate(`/journal/${created.slug}`, { replace: true });
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not open your journal.');
      }
    })();

    return () => { cancelled = true; };
  }, [user, loading, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <p className="font-bold text-stone-900 mb-1">Couldn't open your journal</p>
          <p className="text-stone-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-stone-900 hover:bg-stone-700 text-white py-3 rounded-xl text-sm font-semibold transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
        <p className="text-stone-400 text-sm">Opening your journal…</p>
      </div>
    </div>
  );
}
