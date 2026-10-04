/**
 * Where is this visitor, roughly?
 *
 * WHY NOT IP GEOLOCATION
 * Vercel exposes `x-vercel-ip-country`, but reading it needs a serverless function and we
 * are close to the Hobby cap of 12 (see the note at the top of api/notify/domain.js). It
 * would also mean handling IPs. The browser already knows its own timezone, which costs
 * no request, no function, and no personal data.
 *
 * WHAT THIS IS FOR
 * One question: are the people using Porfilr in Nigeria, the US, or somewhere else? The
 * product is priced for the US and distributed largely through Nigerian channels, and
 * nobody can currently tell which audience actually shows up. This is accurate enough to
 * answer that and is not meant for anything finer.
 *
 * WHAT IT IS NOT
 * Not reliable per person. A VPN, a traveller, or a device with the wrong clock will be
 * wrong. It is reliable in aggregate, which is the only way we read it.
 *
 * We store the RAW timezone as well as the derived country, so a bad guess here can be
 * re-derived later without having lost anything.
 */

/** Timezones that matter for the question being asked. Everything else falls back. */
const TZ_COUNTRY: Record<string, string> = {
  'Africa/Lagos': 'NG',
  'Africa/Accra': 'GH',
  'Africa/Nairobi': 'KE',
  'Africa/Johannesburg': 'ZA',
  'Africa/Cairo': 'EG',
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Dubai': 'AE',
  'Asia/Manila': 'PH',
  'Australia/Sydney': 'AU',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'America/Sao_Paulo': 'BR',
  'America/Mexico_City': 'MX',
};

/**
 * Derive a country code. US is inferred from the America/* zones that aren't mapped to
 * another country above — that covers America/New_York, Chicago, Denver, Los_Angeles and
 * the rest without listing all of them.
 */
function countryFromTimezone(tz: string): string | null {
  if (!tz) return null;
  if (TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
  if (tz.startsWith('US/') || tz === 'America/Anchorage' || tz === 'Pacific/Honolulu') return 'US';
  if (tz.startsWith('America/')) return 'US';   // after the CA/BR/MX entries above
  return null;
}

/** The region code in a locale like "en-NG" -> "NG". A weaker signal than timezone. */
function countryFromLocale(locale: string): string | null {
  const m = /^[a-z]{2,3}[-_]([A-Za-z]{2})\b/.exec(locale || '');
  return m ? m[1].toUpperCase() : null;
}

export interface Region {
  /** Raw IANA timezone, e.g. "Africa/Lagos". The source of truth — keep it. */
  timezone: string | null;
  /** navigator.language, e.g. "en-NG". */
  locale: string | null;
  /** Best-effort ISO country code, or null when we genuinely can't tell. */
  country: string | null;
}

/**
 * Read once and cache for the browser session. Cheap enough to call anywhere, but the
 * cache keeps every tracked event from re-running Intl.
 */
let cached: Region | null = null;

export function getRegion(): Region {
  if (cached) return cached;
  let timezone: string | null = null;
  let locale: string | null = null;
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch { /* older browser, or Intl unavailable */ }
  try {
    locale = (typeof navigator !== 'undefined' && navigator.language) || null;
  } catch { /* ignore */ }

  // Timezone first: it reflects where the device IS. A locale is often left at en-US or
  // en-GB regardless of country, so it only gets to answer when timezone can't.
  const country = countryFromTimezone(timezone || '') ?? countryFromLocale(locale || '');

  cached = { timezone, locale, country };
  return cached;
}

export default getRegion;
