import { useState } from 'react';
import { bankDetails, cryptoDetails, hasManualMethods } from '../lib/payMethods';
import { submitPaymentClaim, type PaymentMethod } from '../lib/paymentClaim';

/**
 * How to pay for a kit.
 *
 * Card is the only automated rail — Paystack and Flutterwave both need a Nigerian entity
 * we don't have. So naira and USDT are collected by hand: we show where to send it, they
 * tell us they've sent it, and access is granted after the money is actually checked.
 *
 * The honesty here is deliberate. A manual method that pretends to be instant produces a
 * buyer sitting on a spinner wondering if they've been robbed. We say plainly that it
 * takes a few hours, because a known wait is tolerable and an unexplained one isn't.
 */

interface Props {
  /** Starts the Stripe checkout. Owned by the parent, which knows the cancel path. */
  onCardCheckout: () => void;
  cardBusy?: boolean;
  defaultEmail?: string | null;
  userId?: string | null;
  /**
   * What's being bought: a kit's template id ('trader-template', and future kits) or
   * 'pro'. Required on purpose — this component serves every product we sell, and a
   * default would misfile the first sale of whatever launches next.
   */
  product: string;
  /** Price in USD for the card option, so each product states its own. */
  priceUsd: number;
  /**
   * Wording for the card button. Each surface has its own voice — "Upgrade to Pro" on the
   * pricing page, "Unlock everything" at the trade cap — and inheriting one product's copy
   * on another's page reads as a bug.
   */
  cardLabel?: string;
}

type Tab = 'card' | 'bank_transfer' | 'usdt';

export default function PaymentOptions({
  onCardCheckout, cardBusy = false, defaultEmail, userId, product, priceUsd,
  cardLabel,
}: Props) {
  const payLabel = cardLabel || `Pay $${priceUsd} by card`;
  const bank = bankDetails(product);
  const crypto = cryptoDetails(product);
  const [tab, setTab] = useState<Tab>('card');

  // Claim form
  const [email, setEmail] = useState(defaultEmail || '');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  // If nothing manual is configured there's no choice to present — render the card button
  // on its own rather than a picker with one option in it.
  if (!hasManualMethods(product)) {
    return (
      <button
        type="button" onClick={onCardCheckout} disabled={cardBusy}
        className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
      >
        {cardBusy ? 'Opening checkout…' : payLabel}
      </button>
    );
  }

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(''), 1800);
    } catch { /* clipboard blocked — the value is on screen to read */ }
  };

  const fileClaim = async (method: PaymentMethod, currency: string, amountMajor: number | null) => {
    setStatus('saving'); setError('');
    try {
      await submitPaymentClaim({ email, method, currency, amountMajor, reference, product, userId });
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send that. Try again.');
      setStatus('error');
    }
  };

  const tabBtn = (id: Tab, label: string, sub: string) => (
    <button
      key={id} type="button" onClick={() => { setTab(id); setStatus('idle'); setError(''); }}
      className={`flex-1 min-w-[104px] text-left px-3 py-2.5 rounded-xl border transition ${
        tab === id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 hover:bg-stone-50 text-stone-700'
      }`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className={`block text-xs ${tab === id ? 'text-stone-300' : 'text-stone-400'}`}>{sub}</span>
    </button>
  );

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 last:border-0">
      <span className="text-stone-500 text-xs">{label}</span>
      <span className="flex items-center gap-2 min-w-0">
        <span className="text-stone-900 text-sm font-semibold truncate">{value}</span>
        <button
          type="button" onClick={() => copy(value, label)}
          className="text-xs text-stone-400 hover:text-stone-700 flex-shrink-0"
        >
          {copied === label ? 'copied' : 'copy'}
        </button>
      </span>
    </div>
  );

  const claimForm = (method: PaymentMethod, currency: string, amountMajor: number | null) => {
    if (status === 'done') {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-3">
          <p className="text-emerald-900 text-sm font-semibold mb-1">Got it — we're checking now.</p>
          <p className="text-emerald-800 text-xs leading-relaxed">
            Once the payment lands we'll switch your account over and email you. Usually a few
            hours. Nothing you've already logged is affected in the meantime.
          </p>
        </div>
      );
    }
    return (
      <div className="mt-3">
        <p className="text-stone-500 text-xs mb-2">Sent it? Tell us, so we can match it up.</p>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="The email on your Porfilr account"
          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        <input
          type="text" value={reference} onChange={(e) => setReference(e.target.value)}
          placeholder={method === 'usdt' ? 'Transaction hash' : 'Transfer reference / session ID'}
          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button
          type="button" disabled={status === 'saving'}
          onClick={() => fileClaim(method, currency, amountMajor)}
          className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          {status === 'saving' ? 'Sending…' : "I've paid"}
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tabBtn('card', 'Card', 'Instant')}
        {bank && tabBtn('bank_transfer', 'Bank transfer', 'Naira')}
        {crypto && tabBtn('usdt', 'USDT', crypto.network)}
      </div>

      {tab === 'card' && (
        <>
          <button
            type="button" onClick={onCardCheckout} disabled={cardBusy}
            className="w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
          >
            {cardBusy ? 'Opening checkout…' : payLabel}
          </button>
          <p className="text-stone-400 text-xs mt-2 leading-relaxed">
            Unlocks straight away. Note that many Nigerian cards can't be charged in dollars —
            if yours is declined, use bank transfer or USDT instead.
          </p>
        </>
      )}

      {tab === 'bank_transfer' && bank && (
        <div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2">
            <Row label="Bank" value={bank.bankName} />
            <Row label="Account name" value={bank.accountName} />
            <Row label="Account number" value={bank.accountNumber} />
            <Row label="Amount" value={`₦${bank.price}`} />
          </div>
          <p className="text-stone-400 text-xs mt-2">
            Checked by hand, so it isn't instant — usually a few hours.
          </p>
          {claimForm('bank_transfer', 'NGN', Number(bank.price.replace(/[^\d.]/g, '')) || null)}
        </div>
      )}

      {tab === 'usdt' && crypto && (
        <div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2">
            <Row label="Network" value={crypto.network} />
            <Row label="Address" value={crypto.address} />
            <Row label="Amount" value={`${crypto.price} USDT`} />
          </div>
          <p className="text-amber-700 text-xs mt-2 leading-relaxed">
            Send on <strong>{crypto.network}</strong> only. USDT sent on another network can't
            be recovered.
          </p>
          {claimForm('usdt', 'USDT', Number(crypto.price) || null)}
        </div>
      )}
    </div>
  );
}
