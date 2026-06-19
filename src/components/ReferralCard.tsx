import { useEffect, useState } from 'react';
import { Copy, Check, Gift, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { track } from '../lib/track';

const PRO_GOAL = 3; // referrals that unlock free Pro (then 1 more, while Pro, unlocks a kit)

export default function ReferralCard() {
  const { user, isPro } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [kitCredit, setKitCredit] = useState(0);
  const [proUnlocked, setProUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data: rpcCode } = await supabase.rpc('ensure_referral');
        if (rpcCode) setCode(rpcCode as string);
        const { data } = await supabase
          .from('referrals')
          .select('code, pro_referrals, kit_credit, pro_unlocked')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setCode(data.code);
          setCount(data.pro_referrals || 0);
          setKitCredit(data.kit_credit || 0);
          setProUnlocked(!!data.pro_unlocked);
        }
      } catch (err) {
        console.error('Referral card error:', err);
      }
    })();
  }, [user?.id]);

  if (!code) return null;

  const link = `${window.location.origin}/?ref=${code}`;
  // Non-Pro users work toward free Pro (at PRO_GOAL referrals).
  const proPct = proUnlocked ? 100 : Math.min(100, Math.round((Math.min(count, PRO_GOAL) / PRO_GOAL) * 100));
  const proRemaining = Math.max(0, PRO_GOAL - count);
  const kitEarned = kitCredit > 0;

  return (
    <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-2xl p-6 mb-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-400" /> Refer & earn
          </h2>
          <p className="text-stone-300 text-sm mt-0.5">
            {isPro
              ? <>Refer a friend who buys Pro and you'll earn a <span className="font-semibold text-white">free kit.</span></>
              : <>Friends who buy Pro through your link earn rewards — <span className="font-semibold text-white">{PRO_GOAL} = free Pro, then 1 more = a free kit.</span></>}
          </p>
        </div>
        {!isPro && proUnlocked && (
          <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" /> Pro unlocked
          </span>
        )}
        {isPro && kitEarned && (
          <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" /> Kit earned
          </span>
        )}
      </div>

      {/* Share link */}
      <div className="flex items-center gap-1.5 bg-white/10 rounded-xl pl-3 pr-1.5 py-1.5 mb-4">
        <span className="flex-1 text-sm text-stone-200 font-medium truncate">{link.replace(/^https?:\/\//, '')}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(link); setCopied(true); track('referral_copied', { isPro }); setTimeout(() => setCopied(false), 1800); }}
          className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>

      {/* Non-Pro: progress toward free Pro */}
      {!isPro && (
        <>
          <div className="flex items-center justify-between text-xs text-stone-300 mb-1.5">
            <span>{count} referral{count === 1 ? '' : 's'}</span>
            <span>{proUnlocked ? 'Pro unlocked 🎉' : `${proRemaining} more for free Pro`}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${proPct}%` }} />
          </div>
        </>
      )}

      {/* Pro: kit status (no bar — the kit triggers on your next qualifying referral) */}
      {isPro && (
        <p className="text-stone-300 text-sm flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-orange-400" />
          {kitEarned
            ? <span className="text-emerald-300">You've earned a free kit — redeemable when kits launch.</span>
            : <>Your next referral who buys Pro unlocks a free kit.</>}
        </p>
      )}
    </div>
  );
}
