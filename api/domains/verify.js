import dns from 'dns/promises';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { domain, portfolioSlug, portfolioId } = req.body || {};

  if (!domain || !portfolioSlug) {
    return res.status(400).json({ error: 'Missing domain or portfolioSlug' });
  }

  let verified = false;

  // Check A record points to Vercel
  try {
    const addresses = await dns.resolve4(domain);
    if (addresses.includes('76.76.21.21')) verified = true;
  } catch {}

  // Check CNAME for www subdomain
  if (!verified) {
    try {
      const cnames = await dns.resolveCname('www.' + domain);
      if (cnames.some(c => c.includes('vercel'))) verified = true;
    } catch {}
  }

  if (verified && portfolioId) {
    await supabase
      .from('portfolios')
      .update({ domain_verified: true })
      .eq('id', portfolioId);
  }

  return res.status(200).json({ verified });
}
