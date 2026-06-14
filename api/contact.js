function enableCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  enableCORS(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ownerEmail, senderName, senderEmail, message, portfolioName } = req.body || {};

  if (!ownerEmail || !senderName || !senderEmail || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(senderEmail) || !emailRegex.test(ownerEmail)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const emailHtml = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:24px;">New message via your portfolio</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">Someone reached out through your Porfilr portfolio${portfolioName ? ` (${escapeHtml(portfolioName)})` : ''}.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;width:100px;">From</td><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${escapeHtml(senderName)}</td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Email</td><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;"><a href="mailto:${escapeHtml(senderEmail)}" style="color:#2563eb;">${escapeHtml(senderEmail)}</a></td></tr>
        </table>
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0;color:#0f172a;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
        </div>
        <a href="https://porfilr.com" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">View your Porfilr portfolio</a>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">Sent via <a href="https://porfilr.com" style="color:#2563eb;">Porfilr</a></p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Porfilr <sadiq@porfilr.com>',
        to: ownerEmail,
        reply_to: senderEmail,
        subject: `New message from ${senderName} via your Porfilr portfolio`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}
