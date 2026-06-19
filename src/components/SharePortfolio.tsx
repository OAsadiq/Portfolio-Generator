import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { track } from '../lib/track';

/**
 * Frictionless share prompt shown at the "your portfolio is live" moment.
 * Pre-fills a message that mentions Porfilr, so every share doubles as
 * a soft referral (Phase A of the referral hook — no tracking/rewards yet).
 */
export default function SharePortfolio({ url, compact = false }: { url: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const message = 'I just launched my portfolio with Porfilr 🚀';
  const encUrl = encodeURIComponent(url);
  const encMsg = encodeURIComponent(message);

  const targets = [
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${encMsg}&url=${encUrl}`,
      icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg> },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
      icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg> },
    { name: 'WhatsApp', href: `https://wa.me/?text=${encMsg}%20${encUrl}`,
      icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.115zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg> },
  ];

  return (
    <div className={compact ? '' : 'bg-stone-50 border border-stone-200 rounded-xl p-4'}>
      <p className="text-sm font-semibold text-stone-700 mb-3 text-center">Share your launch 🎉</p>
      <div className="flex items-center justify-center gap-2">
        {targets.map(t => (
          <a
            key={t.name}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('share_clicked', { target: t.name })}
            title={`Share on ${t.name}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 transition text-sm font-medium"
          >
            {t.icon}
            <span className="hidden sm:inline">{t.name}</span>
          </a>
        ))}
        <button
          onClick={() => { navigator.clipboard.writeText(url); setCopied(true); track('share_clicked', { target: 'copy' }); setTimeout(() => setCopied(false), 1800); }}
          title="Copy link"
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 transition text-sm font-medium"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
}
