// Porfilr — welcome email for a Porfilr Journal purchase.
//
// Sent from the Stripe webhook once payment completes. Purpose: thank them, and get them
// to the ONE action that makes the kit valuable — logging trades so their page goes live.
// A buyer who never opens the journal got a template; a buyer who logs trades got the kit.
//
// Never claim we verify their results — the numbers are self-reported and the page says so.

const FROM = 'Porfilr <hello@porfilr.com>';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function kitWelcomeHtml({ firstName } = {}) {
  const hi = firstName ? `Hi ${esc(firstName)},` : 'Hi,';
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f6f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e6e3da;border-radius:16px;overflow:hidden;">

        <tr><td style="background:#0b0e14;padding:28px 32px;">
          <p style="margin:0;color:#e0b252;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Porfilr Journal</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-.02em;">You're in. Thank you.</h1>
        </td></tr>

        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#181b22;font-size:15px;line-height:1.6;">${hi}</p>
          <p style="margin:0 0 16px;color:#4f5661;font-size:15px;line-height:1.6;">
            Thank you for backing the Porfilr Journal — genuinely. You're one of the first traders using
            this, and that means a lot to a small team.
          </p>
          <p style="margin:0 0 24px;color:#4f5661;font-size:15px;line-height:1.6;">
            Here's how to get the most out of it.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="padding:0 0 18px;">
              <p style="margin:0 0 4px;color:#181b22;font-size:15px;font-weight:700;">1. Build your page</p>
              <p style="margin:0;color:#4f5661;font-size:14px;line-height:1.6;">
                Add your bio, markets, strategy and how you handle risk. Takes about 10 minutes.
                Investors read your risk section before your returns — it's worth writing properly.
              </p>
            </td></tr>
            <tr><td style="padding:0 0 18px;">
              <p style="margin:0 0 4px;color:#181b22;font-size:15px;font-weight:700;">2. Set your starting balance</p>
              <p style="margin:0;color:#4f5661;font-size:14px;line-height:1.6;">
                In your Journal. Your return % is measured against it, so nothing calculates until
                this is set.
              </p>
            </td></tr>
            <tr><td style="padding:0 0 18px;">
              <p style="margin:0 0 4px;color:#181b22;font-size:15px;font-weight:700;">3. Log your trades — or import them</p>
              <p style="margin:0;color:#4f5661;font-size:14px;line-height:1.6;">
                Log them as you go, or import your whole history at once with a CSV export from
                MT4/MT5 or your broker. Only closed trades count toward your numbers.
              </p>
            </td></tr>
            <tr><td>
              <p style="margin:0 0 4px;color:#181b22;font-size:15px;font-weight:700;">4. Turn on your live track record</p>
              <p style="margin:0;color:#4f5661;font-size:14px;line-height:1.6;">
                Flip the switch in your Journal and your page starts showing your real return, win
                rate, drawdown and equity curve — updating itself as you trade. This is the part a
                screenshot can never do.
              </p>
            </td></tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#e0b252;border-radius:10px;">
              <a href="https://porfilr.com/dashboard" style="display:inline-block;padding:13px 28px;color:#0b0e14;font-size:15px;font-weight:700;text-decoration:none;">Open your dashboard</a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;color:#181b22;font-size:14px;font-weight:700;">One thing worth knowing</p>
          <p style="margin:0 0 24px;color:#4f5661;font-size:14px;line-height:1.6;">
            Your numbers are yours — you enter them, and your page states plainly that they're
            self-reported. We don't dress that up as "verified", because traders and investors can
            tell the difference. Being straight about it is exactly what makes your page credible.
            If you have a MyFXBook or broker link, add it — that's your independent proof.
          </p>

          <p style="margin:0;color:#4f5661;font-size:15px;line-height:1.6;">
            If anything's confusing or broken, just reply to this email — it comes straight to me
            and I'll sort it personally.
          </p>
          <p style="margin:16px 0 0;color:#4f5661;font-size:15px;line-height:1.6;">
            Thanks again,<br/><strong style="color:#181b22;">Sadiq</strong><br/>
            <span style="color:#8a909c;font-size:13px;">Founder, Porfilr</span>
          </p>
        </td></tr>

        <tr><td style="padding:20px 32px;border-top:1px solid #eeece4;">
          <p style="margin:0;color:#8a909c;font-size:12px;line-height:1.6;">
            You're receiving this because you purchased the Porfilr Journal on
            <a href="https://porfilr.com" style="color:#9c7620;text-decoration:none;">porfilr.com</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function kitWelcomeText({ firstName } = {}) {
  const hi = firstName ? `Hi ${firstName},` : 'Hi,';
  return `${hi}

Thank you for backing the Porfilr Journal — genuinely. You're one of the first traders using this,
and that means a lot to a small team.

Here's how to get the most out of it:

1. BUILD YOUR PAGE
   Add your bio, markets, strategy and how you handle risk. About 10 minutes. Investors read
   your risk section before your returns — write it properly.

2. SET YOUR STARTING BALANCE
   In your Journal. Your return % is measured against it, so nothing calculates until it's set.

3. LOG YOUR TRADES - OR IMPORT THEM
   Log as you go, or import your whole history at once with a CSV from MT4/MT5 or your broker.
   Only closed trades count toward your numbers.

4. TURN ON YOUR LIVE TRACK RECORD
   Flip the switch in your Journal and your page shows your real return, win rate, drawdown and
   equity curve — updating itself as you trade. A screenshot can never do that.

Open your dashboard: https://porfilr.com/dashboard

ONE THING WORTH KNOWING
Your numbers are yours — you enter them, and your page states plainly that they're
self-reported. We don't dress that up as "verified", because traders and investors can tell the
difference. Being straight about it is what makes your page credible. If you have a MyFXBook or
broker link, add it — that's your independent proof.

If anything's confusing or broken, just reply to this email — it comes straight to me and I'll
sort it personally.

Thanks again,
Sadiq
Founder, Porfilr

You're receiving this because you purchased the Porfilr Journal on porfilr.com`;
}

/**
 * Tell the founder a kit just sold. Small, instant, and includes who bought — so you can
 * personally reach out to founding buyers while the purchase is fresh.
 * Never throws.
 */
export async function sendFounderSaleAlert({ buyerEmail, buyerName, amount, templateId, spotsSold }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL || 'sadiq@porfilr.com';
  if (!apiKey) return false;
  const money = typeof amount === 'number' ? `$${(amount / 100).toFixed(2).replace(/\.00$/, '')}` : '—';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: `💰 Kit sold — ${money}${spotsSold ? ` (founding spot ${spotsSold}/20)` : ''}`,
        html: `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#0f172a;">
          <h2 style="margin:0 0 12px;">Someone bought the ${esc(templateId === 'trader-template' ? 'Porfilr Journal' : templateId)}</h2>
          <table cellpadding="0" cellspacing="0" style="font-size:14px;">
            <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Buyer</td><td><strong>${esc(buyerName || '—')}</strong></td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Email</td><td><a href="mailto:${esc(buyerEmail)}">${esc(buyerEmail)}</a></td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Amount</td><td><strong>${money}</strong></td></tr>
            ${spotsSold ? `<tr><td style="padding:6px 16px 6px 0;color:#64748b;">Founding</td><td><strong>${spotsSold} of 20 claimed</strong></td></tr>` : ''}
          </table>
          <p style="margin:18px 0 0;color:#64748b;font-size:13px;">They've been sent the welcome email. Worth a personal note from you — founding buyers are your first testimonials.</p>
        </div>`,
        text: `Kit sold — ${money}\nBuyer: ${buyerName || '—'} (${buyerEmail})\n${spotsSold ? `Founding spot ${spotsSold}/20\n` : ''}\nThey've been sent the welcome email.`,
      }),
    });
    if (!res.ok) { console.error('founder sale alert failed:', await res.text()); return false; }
    return true;
  } catch (err) {
    console.error('founder sale alert error:', err.message);
    return false;
  }
}

/**
 * Send the welcome email. Never throws — a failed email must not break the webhook or
 * cost someone the kit they paid for.
 */
export async function sendKitWelcomeEmail({ to, firstName }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) {
    console.error('kit welcome email skipped:', !apiKey ? 'no RESEND_API_KEY' : 'no recipient');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: "You're in — here's how to get the most out of your Porfilr Journal",
        html: kitWelcomeHtml({ firstName }),
        text: kitWelcomeText({ firstName }),
        reply_to: 'hello@porfilr.com',
      }),
    });
    if (!res.ok) {
      console.error('kit welcome email failed:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('kit welcome email error:', err.message);
    return false;
  }
}
