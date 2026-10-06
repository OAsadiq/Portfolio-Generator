/**
 * Which ways someone can pay us, and what each product costs in each currency.
 *
 * Stripe is the only automated rail we have: Paystack and Flutterwave both require a
 * Nigerian business entity we don't have, so naira and USDT are collected by hand.
 *
 * THIS IS FOR EVERY PRODUCT, not just the trader kit. A "product" here is a kit's template
 * id ('trader-template', and whatever kits come next) or 'pro'. Prices live in a JSON map
 * rather than one variable per product, so launching a new kit is a config change and not
 * a code change.
 *
 * Every manual method is HIDDEN when its details are missing. Showing "pay by transfer"
 * above a blank account number takes someone's intent and wastes it, which is worse than
 * not offering it.
 *
 * .env — bank transfer:
 *   VITE_NGN_BANK_NAME       = "Kuda Bank"
 *   VITE_NGN_ACCOUNT_NAME    = "Porfilr"
 *   VITE_NGN_ACCOUNT_NUMBER  = "1234567890"
 *   VITE_NGN_PRICES          = {"trader-template":"25000","pro":"15000"}
 *
 * .env — USDT:
 *   VITE_USDT_ADDRESS        = "T..."
 *   VITE_USDT_NETWORK        = "TRC20"
 *   VITE_USDT_PRICES         = {"trader-template":"20","pro":"12"}
 *
 * A product missing from a price map simply can't be bought that way, and its tab won't
 * render. That's the safe failure: better to show one payment option than to invite a
 * transfer for an amount nobody has decided on.
 */

const val = (k: string): string => {
  const v = (import.meta.env as Record<string, string | undefined>)[k];
  return typeof v === 'string' ? v.trim() : '';
};

/** Parse a {"product":"price"} env map. A malformed map disables that method, loudly. */
function priceMap(key: string): Record<string, string> {
  const raw = val(key);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string' || typeof v === 'number') out[k] = String(v).trim();
    }
    return out;
  } catch (e) {
    // Don't fail silently: a typo here would quietly remove a payment option in production
    // and look like "nobody uses bank transfer".
    console.error(`[payMethods] ${key} is not valid JSON — that payment method is disabled.`, e);
    return {};
  }
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  /** Price for the requested product, in naira, as a display string. */
  price: string;
}

export interface CryptoDetails {
  address: string;
  network: string;
  price: string;
}

/** Naira bank transfer for `product`, or null when unconfigured or unpriced. */
export function bankDetails(product: string): BankDetails | null {
  const bankName = val('VITE_NGN_BANK_NAME');
  const accountName = val('VITE_NGN_ACCOUNT_NAME');
  const accountNumber = val('VITE_NGN_ACCOUNT_NUMBER');
  const price = priceMap('VITE_NGN_PRICES')[product];
  if (!bankName || !accountName || !accountNumber || !price) return null;
  return { bankName, accountName, accountNumber, price };
}

/**
 * USDT for `product`. `address` is a plain wallet for now — when a processor is connected
 * this is where its generated address or hosted checkout URL goes.
 */
export function cryptoDetails(product: string): CryptoDetails | null {
  const address = val('VITE_USDT_ADDRESS');
  const network = val('VITE_USDT_NETWORK');
  const price = priceMap('VITE_USDT_PRICES')[product];
  if (!address || !network || !price) return null;
  return { address, network, price };
}

/** Anything beyond card for this product? Drives whether the picker renders at all. */
export function hasManualMethods(product: string): boolean {
  return !!bankDetails(product) || !!cryptoDetails(product);
}
