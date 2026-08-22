import { supabase } from './supabase';
import { track } from './track';

/**
 * "Email me a link to finish on desktop."
 *
 * Shared by the builder's small-screen screen and the mobile create form, so the two can't
 * drift — a DB webhook on `desktop_reminders` is what actually sends the mail.
 *
 * Worth knowing before leaning on this: of the first seven people who used it, three never
 * published anything. It works as an OPTION for someone who wants the visual designer; it
 * does not work as a gate in front of people who just want their page up. That's why the
 * mobile form offers it at the bottom rather than in the way.
 */
export async function requestDesktopLink(email: string, templateId: string, resumeUrl?: string) {
  const clean = (email || '').toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error('invalid-email');

  const { error } = await supabase.from('desktop_reminders').insert({
    email: clean,
    resume_url: resumeUrl ?? (typeof window !== 'undefined' ? window.location.href : null),
    template_id: templateId,
  });
  if (error) throw error;

  // They handed over an email, so add them to the list too. Duplicates are ignored.
  await supabase
    .from('newsletter_subscribers')
    .insert({ email: clean, source: 'desktop_reminder', is_active: true });

  track('desktop_link_requested', { template: templateId });
}

export default requestDesktopLink;
