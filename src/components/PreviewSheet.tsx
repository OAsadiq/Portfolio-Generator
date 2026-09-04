import { useEffect } from 'react';

/**
 * Full-screen preview of a generated page.
 *
 * Exists because the mobile form had no preview at all: you filled in thirty fields and
 * found out what you'd made after publishing. On desktop the builder shows a live canvas,
 * so a paying customer on a phone was getting a materially worse product for the same
 * money.
 *
 * Renders the HTML with `srcdoc` rather than opening a tab. Two earlier attempts at this
 * pattern don't work on phones: `window.open` after an `await` has lost its user-gesture
 * context and gets blocked, and iOS Safari refuses `blob:` URLs in a new tab outright.
 * srcdoc has neither problem and keeps the user inside the form.
 */
export default function PreviewSheet({
  open,
  onClose,
  html,
  loading,
  error,
  onRetry,
}: {
  open: boolean;
  onClose: () => void;
  html: string | null;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-stone-900" role="dialog" aria-modal="true" aria-label="Page preview">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-stone-900 flex-none">
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">Preview</p>
          <p className="text-stone-400 text-xs truncate">This is your page as it stands</p>
        </div>
        <button
          onClick={onClose}
          className="flex-none bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          Back to editing
        </button>
      </div>

      <div className="flex-1 bg-white relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-700 rounded-full animate-spin" />
            <p className="text-stone-400 text-sm">Building your preview…</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10 px-8 text-center">
            <p className="text-stone-800 font-semibold">Couldn't build the preview</p>
            <p className="text-stone-500 text-sm">{error}</p>
            {onRetry && (
              <button onClick={onRetry} className="mt-2 bg-stone-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
                Try again
              </button>
            )}
          </div>
        )}

        {html && !error && (
          <iframe
            title="Page preview"
            srcDoc={html}
            className="w-full h-full border-0"
            // Fully sandboxed — no scripts, no same-origin. The page's only script is the
            // live-metrics fetch, which can't work on an unpublished page anyway, so
            // nothing is lost visually and there's no way for generated markup to reach
            // our origin. Never add allow-same-origin alongside allow-scripts: together
            // they let framed content escape the sandbox entirely.
            sandbox=""
          />
        )}
      </div>

      <p className="flex-none text-center text-stone-500 text-xs py-2.5 bg-stone-900">
        Nothing here is published yet — close this and keep editing.
      </p>
    </div>
  );
}
