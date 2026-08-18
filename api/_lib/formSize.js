// Porfilr — publish-time validation of user-submitted portfolio content.
//
// WHY: one portfolio was published in Jan 2026 with a 683 KB JPEG pasted into a field as a
// base64 data: URI. The template emits the profile image three times (two <img> tags plus
// og:image), so the stored page came out at 2.8 MB against ~25 KB for everyone else — and
// og:image as a data: URI is ignored by every social platform, so that user's link
// previews were silently blank for seven months.
//
// Nothing stopped it: neither publish endpoint capped field sizes, and vercel.json sets no
// body limit either. These rules are the prevention.
//
// Limits are set against real data, not guessed. Across the live portfolios at the time of
// writing: largest total 4.6 KB, median 1.3 KB, largest single field 930 bytes. The caps
// below sit ~55x above the largest real page, so a genuinely long case study still
// publishes while an inlined image cannot.

/** Total serialised size of form_data. */
export const MAX_TOTAL_BYTES = 256 * 1024;
/** Any single field. ~32k chars is far longer than any prose field on any template. */
export const MAX_FIELD_BYTES = 32 * 1024;
/** The sections array (visibility/order only — tiny in practice, ~258 bytes at most). */
export const MAX_SECTIONS_BYTES = 64 * 1024;

function bytes(value) {
  // Byte length, not character count: a page of emoji or non-Latin script is heavier than
  // .length suggests, and the limit that matters is what gets stored and served.
  return Buffer.byteLength(JSON.stringify(value === undefined ? '' : value), 'utf8');
}

function kb(n) {
  return `${Math.round(n / 1024)} KB`;
}

/**
 * Validate a publish payload.
 * @returns { ok: true } or { ok: false, status, code, error } — `error` is shown to the
 *          user, so it says what to do, not just what was refused.
 */
export function validateFormData(formData, sections) {
  if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
    return { ok: false, status: 400, code: 'INVALID_FORM_DATA', error: 'Invalid form data.' };
  }

  for (const [field, value] of Object.entries(formData)) {
    // Inlined images are rejected at ANY size. This is the actual failure mode, and it
    // deserves its own message: a small data: URI would slip under the size caps and still
    // break og:image, which is the expensive half of the bug.
    if (typeof value === 'string' && /^\s*data:/i.test(value)) {
      return {
        ok: false,
        status: 400,
        code: 'INLINE_IMAGE_REJECTED',
        error: `The "${field}" field contains an embedded image. Please upload the image instead of pasting its data — embedded images make your page very slow and stop link previews working.`,
      };
    }

    const size = bytes(value);
    if (size > MAX_FIELD_BYTES) {
      return {
        ok: false,
        status: 413,
        code: 'FIELD_TOO_LARGE',
        error: `The "${field}" field is too long (${kb(size)}). The limit is ${kb(MAX_FIELD_BYTES)} — try shortening it.`,
      };
    }
  }

  const total = bytes(formData);
  if (total > MAX_TOTAL_BYTES) {
    return {
      ok: false,
      status: 413,
      code: 'FORM_DATA_TOO_LARGE',
      error: `Your portfolio content is too large (${kb(total)}). The limit is ${kb(MAX_TOTAL_BYTES)}.`,
    };
  }

  if (sections !== undefined && sections !== null) {
    const s = bytes(sections);
    if (s > MAX_SECTIONS_BYTES) {
      return {
        ok: false,
        status: 413,
        code: 'SECTIONS_TOO_LARGE',
        error: 'Your section layout is too large to save.',
      };
    }
  }

  return { ok: true };
}

export default validateFormData;
