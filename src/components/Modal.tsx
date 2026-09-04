import { useEffect, useRef } from 'react';

/**
 * A centred dialog over a dimmed page.
 *
 * Built because two things needed it: the free-limit prompt was rendering inline halfway
 * down the journal, so you had to scroll to discover you'd hit a limit, and deleting a
 * trade used window.confirm — a browser chrome box that looks nothing like the product and
 * can't say anything useful about what's being deleted.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  tone = 'default',
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: 'default' | 'danger';
  /** Off for destructive dialogs, where a stray click shouldn't be a decision. */
  closeOnBackdrop?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);

    // Stop the page behind from scrolling under the dialog — on a phone the background
    // otherwise moves while you drag on the overlay, which feels broken.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus in, so the keyboard and screen readers follow the dialog rather than
    // staying wherever the page happened to be.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Bottom sheet on a phone, centred card on desktop — a centred box on mobile puts
          the buttons under the thumb's reach. */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-6 outline-none animate-fade-up max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className={`font-bold text-lg ${tone === 'danger' ? 'text-red-600' : 'text-stone-900'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex-none -mr-1 -mt-1 p-1 text-stone-400 hover:text-stone-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-stone-600 text-sm leading-relaxed">{children}</div>

        {footer && <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
