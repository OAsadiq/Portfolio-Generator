// Porfilr — welcome email for a Pro purchase.
//
// WHY THIS EXISTS
// Until now, buying Pro produced silence. The money left, the account quietly gained
// features, and the only email sent went to the founder. Someone who had just paid heard
// nothing about the three things they actually paid for.
//
// That mattered more once naira bank transfer went live: those buyers wait hours between
// paying and being granted access, so silence reads as a failed payment rather than a
// missing email.
//
// Sent from every rail that grants Pro — Stripe, crypto, and a manual transfer fulfilled
// with scripts/grant-kit.mjs.
//
// The feature list deliberately mirrors the pricing page word for word. An email that
// promises something the page didn't sell is how support tickets start.

const FROM = 'Porfilr <hello@porfilr.com>';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const PERKS = [
  ['All Pro templates', 'Every template on the site, including the ones that were locked. Kits are sold separately — those are their own thing.'],
  ['Your own domain', 'Point yourname.com at your page instead of using a porfilr.com link. Takes about ten minutes and we walk you through it.'],
  ['View analytics', 'See how many people actually opened your page, and when. Useful after you send it somewhere.'],
  ['No Porfilr badge', 'The "Made with Porfilr" mark is gone from your page.'],
];

export function proWelcomeHtml({ firstName } = {}) {
  const hi = firstName ? `Hi ${esc(firstName)},` : 'Hi,';
  const rows = PERKS.map(([title, body]) => `
    <tr><td style="padding:0 0 18px;">
      <p style="margin:0 0 4px;color:#181b22;font-size:15px;font-weight:700;">${title}</p>
      <p style="margin:0;color:#4f5661;font-size:14px;line-height:1.6;">${body}</p>
    </td></tr>`).join('');

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f6f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e6e3da;border-radius:16px;overflow:hidden;">

        <tr><td style="background:#0b0e14;padding:28px 32px;">
          <p style="margin:0;color:#e0b252;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Porfilr Pro</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-.02em;">You're on Pro.</h1>
        </td></tr>

        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#181b22;font-size:15px;line-height:1.6;">${hi}</p>
          <p style="margin:0 0 24px;color:#4f5661;font-size:15px;line-height:1.6;">
            Thank you — genuinely. Pro is a one-time payment, so that's the last you'll hear
            from us about money. Here's what's now switched on:
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${rows}</table>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#e0b252;border-radius:10px;">
              <a href="https://porfilr.com/dashboard" style="display:inline-block;padding:13px 28px;color:#0b0e14;font-size:15px;font-weight:700;text-decoration:none;">Open your dashboard</a>
            </td></tr>
          </table>

          <p style="margin:0;color:#4f5661;font-size:15px;line-height:1.6;">
            If anything isn't working, or you want a hand pointing your domain at your page,
            just reply to this email — it comes straight to me.
          </p>
          <p style="margin:16px 0 0;color:#4f5661;font-size:15px;line-height:1.6;">
            Thanks again,<br/><strong style="color:#181b22;">Sadiq</strong><br/>
            <span style="color:#8a909c;font-size:13px;">Founder, Porfilr</span>
          </p>
        </td></tr>

        <tr><td style="padding:20px 32px;border-top:1px solid #eeece4;">
          <p style="margin:0;color:#8a909c;font-size:12px;line-height:1.6;">
            You're receiving this because you upgraded to Pro on
            <a href="https://porfilr.com" style="color:#9c7620;text-decoration:none;">porfilr.com</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function proWelcomeText({ firstName } = {}) {
  const hi = firstName ? `Hi ${firstName},` : 'Hi,';
  const rows = PERKS.map(([t, b]) => `${t.toUpperCase()}\n   ${b}`).join('\n\n');
  return `${hi}

Thank you — genuinely. Pro is a one-time payment, so that's the last you'll hear from us
about money. Here's what's now switched on:

${rows}

Open your dashboard: https://porfilr.com/dashboard

If anything isn't working, or you want a hand pointing your domain at your page, just reply
to this email — it comes straight to me.

Thanks again,
Sadiq
Founder, Porfilr

You're receiving this because you upgraded to Pro on porfilr.com`;
}

/**
 * Send it. Never throws — Pro access is granted before this runs, and a mail failure must
 * not make a successful purchase look failed (or make Stripe/NOWPayments retry one we
 * have already honoured).
 */
export async function sendProWelcomeEmail({ to, firstName } = {}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) {
    console.error('pro welcome email skipped:', !apiKey ? 'no RESEND_API_KEY' : 'no recipient');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: "You're on Pro — here's what just unlocked",
        html: proWelcomeHtml({ firstName }),
        text: proWelcomeText({ firstName }),
        reply_to: 'hello@porfilr.com',
      }),
    });
    if (!res.ok) { console.error('pro welcome email failed:', await res.text()); return false; }
    return true;
  } catch (err) {
    console.error('pro welcome email error:', err.message);
    return false;
  }
}

export default sendProWelcomeEmail;
