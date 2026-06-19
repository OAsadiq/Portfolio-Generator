import { useEffect } from 'react';
import { X, Check, Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SharePortfolio from '../../SharePortfolio';
import { track } from '../../../lib/track';

interface Props {
  isOpen: boolean;
  portfolioSlug: string;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, portfolioSlug, onClose }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && portfolioSlug) track('portfolio_saved', { tier: 'pro' });
  }, [isOpen, portfolioSlug]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-slideUp shadow-2xl">
        {/* Header */}
        <div className="relative mb-8 text-center">
          <button onClick={onClose} className="absolute top-0 right-0 p-2 hover:bg-stone-100 rounded-lg transition">
            <X className="w-5 h-5 text-stone-400" />
          </button>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Portfolio saved!</h2>
          <p className="text-stone-500">Your changes are live on your portfolio.</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {portfolioSlug && (
            <a
              href={`${import.meta.env.VITE_APP_URL ?? ''}/p/${portfolioSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition"
            >
              <Eye className="w-4 h-4" />
              View live portfolio
            </a>
          )}

          <button
            onClick={() => { onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-stone-900 hover:bg-stone-700 text-white rounded-xl font-semibold transition"
          >
            Keep editing
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-stone-200 hover:border-stone-300 text-stone-700 rounded-xl font-medium transition"
          >
            <ExternalLink className="w-4 h-4" />
            Go to dashboard
          </button>
        </div>

        {/* Share nudge */}
        {portfolioSlug && (
          <div className="mt-6">
            <SharePortfolio url={`${import.meta.env.VITE_APP_URL ?? 'https://porfilr.com'}/p/${portfolioSlug}`} />
          </div>
        )}
      </div>
    </div>
  );
}
