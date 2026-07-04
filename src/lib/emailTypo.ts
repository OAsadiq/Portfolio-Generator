// Catches common email typos (e.g. "gmail.con") and suggests a correction.
// Returns the suggested email, or null if it looks fine.

const DOMAIN_FIXES: Record<string, string> = {
  'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com',
  'gmail.cpm': 'gmail.com', 'gmail.comm': 'gmail.com', 'gmail.ocm': 'gmail.com',
  'gmail.cmo': 'gmail.com', 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com',
  'gmal.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmailcom': 'gmail.com',
  'yahoo.con': 'yahoo.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com',
  'hotmail.con': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com',
  'outlook.con': 'outlook.com', 'outlok.com': 'outlook.com', 'outook.com': 'outlook.com',
  'icloud.con': 'icloud.com', 'iclould.com': 'icloud.com',
};

export function suggestEmailFix(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf('@');
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1).toLowerCase();
  if (!local || !domain) return null;

  if (DOMAIN_FIXES[domain]) return `${local}@${DOMAIN_FIXES[domain]}`;

  // Generic bad TLD → .com (catches .con, .cmo, .cpm, .comm, .ocm, .xom, .vom, .cim)
  const fixedTld = domain.replace(/\.(con|cmo|cpm|comm|ocm|xom|vom|cim)$/, '.com');
  if (fixedTld !== domain) return `${local}@${fixedTld}`;

  return null;
}
