/**
 * How form fields are grouped into sections, for both the create form and the edit form.
 *
 * The rule is: THE TEMPLATE DECIDES. Each field may declare `section`, and that wins.
 * The name-based guesses below are only a fallback for templates that haven't said.
 *
 * Previously both forms ignored `section` entirely and guessed from the field name using
 * a list shaped around the minimal template — `email`/`linkedin`/`twitter` were "contact"
 * and everything else fell into "Additional info". So `website`, `instagram`, `github` and
 * `resumeUrl` landed in a different group from the other contact fields, which reads as
 * the same section appearing twice. On the trader template even the profile photo ended up
 * under "Additional info", because the check looked for `profilePicture` and the field is
 * called `profileImage`.
 */

export type FormField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  section?: string;
  options?: { value: string; label: string }[];
};

export const SECTION_META: Record<string, { label: string; icon: string; optional?: boolean }> = {
  hero:         { label: 'About you',           icon: '👤' },
  personal:     { label: 'About you',           icon: '👤' },
  theme:        { label: 'Look & layout',       icon: '🎨', optional: true },
  track:        { label: 'Track record',        icon: '📈' },
  proof:        { label: 'Highlights',          icon: '✨', optional: true },
  services:     { label: 'What you offer',      icon: '🧰', optional: true },
  samples:      { label: 'Your work',           icon: '📎' },
  experience:   { label: 'Experience',          icon: '🏢' },
  education:    { label: 'Education',           icon: '🎓', optional: true },
  testimonials: { label: 'Testimonials',        icon: '💬', optional: true },
  contact:      { label: 'Contact details',     icon: '📧' },
  other:        { label: 'Additional info',     icon: '📋', optional: true },
};

/**
 * Which sections start expanded.
 *
 * Full parity with the builder means ~95 fields on the bigger templates. As one flat
 * scroll that's unusable on a phone — so optional sections collapse, and the heading
 * shows how many of their fields are filled. Nothing is hidden; it's just folded.
 */
export function startsOpen(section: string, fieldCount = 0): boolean {
  if (SECTION_META[section]?.optional) return false;
  // Size matters as much as category. "Your work" is core content, but at 6 samples ×
  // 6 fields it's 36 inputs — opening that by default buries Contact below a wall of
  // empty boxes and undoes the point of folding.
  return fieldCount <= 12;
}

/** How many fields in a group have a value — shown on collapsed headings. */
export function filledCount(fields: FormField[], data: Record<string, unknown>): number {
  return fields.filter((f) => {
    const v = data?.[f.name];
    return v !== undefined && v !== null && String(v).trim() !== '';
  }).length;
}

/** Render order. Anything unlisted lands before "other" so nothing hides at the bottom. */
export const SECTION_ORDER = [
  'hero', 'personal', 'track', 'proof', 'experience', 'education',
  'services', 'samples', 'testimonials', 'theme', 'contact', 'other',
];

/** Fallback grouping for templates whose fields don't declare a section. */
function guessSection(name: string): string {
  const n = name.toLowerCase();
  if (/^(fullname|role|writertype|bio|headline|tagline|statement|location|propfirm)/.test(n)) return 'hero';
  if (n.startsWith('profile')) return 'hero';                 // profileImage AND profilePicture
  if (n.startsWith('avail')) return 'hero';
  if (n.includes('color') || n.includes('colour')) return 'theme';
  if (n.startsWith('exp')) return 'experience';
  if (n.startsWith('edu')) return 'education';
  if (n.startsWith('service') || n.startsWith('offer')) return 'services';
  if (n.startsWith('sample') || n.startsWith('case') || n.startsWith('gallery')) return 'samples';
  if (n.startsWith('testimonial')) return 'testimonials';
  // Contact covers every social the templates read via _social.js, not just three of them.
  if (/^(email|linkedin|twitter|instagram|github|website|resumeurl|social\d)/.test(n)) return 'contact';
  return 'other';
}

export function sectionOf(field: FormField): string {
  return field.section && SECTION_META[field.section] ? field.section : guessSection(field.name);
}

/** Group fields into sections, in a stable, sensible order. */
export function groupFields(fields: FormField[]): [string, FormField[]][] {
  const groups: Record<string, FormField[]> = {};
  for (const f of fields || []) {
    const s = sectionOf(f);
    (groups[s] ||= []).push(f);
  }
  return Object.entries(groups).sort(
    ([a], [b]) => {
      const ia = SECTION_ORDER.indexOf(a);
      const ib = SECTION_ORDER.indexOf(b);
      return (ia === -1 ? SECTION_ORDER.length - 1 : ia) - (ib === -1 ? SECTION_ORDER.length - 1 : ib);
    }
  );
}
