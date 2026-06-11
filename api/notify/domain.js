export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Email service not configured' });

  try {
    const payload = req.body;

    // Supabase webhook sends { type, table, record, old_record }
    const record = payload?.record || {};
    const domain = record.custom_domain;
    const slug = record.slug;
    const userName = record.user_name;
    const userEmail = record.user_email;

    // Only notify when custom_domain is newly set (not cleared)
    if (!domain) return res.status(200).json({ skipped: true });

    const html = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
          <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">🌐 New custom domain request</h2>
          <p style="margin:0 0 24px;color:#64748b;font-size:14px;">A Pro user just added a custom domain. Add it to Vercel to activate it.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;width:130px;">Domain</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;">${domain}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Portfolio</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;">${userName} (porfilr.com/p/${slug})</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;font-size:14px;">User email</td><td style="padding:10px 0;color:#0f172a;">${userEmail || 'N/A'}</td></tr>
          </table>
          <div style="background:#fef9ec;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">Action required</p>
            <p style="margin:8px 0 0;color:#92400e;font-size:13px;">Go to Vercel → your project → Settings → Domains → Add <strong>${domain}</strong></p>
          </div>
          <a href="https://vercel.com/dashboard" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open Vercel Dashboard</a>
        </div>
        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">Porfilr admin notification</p>
      </div>
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Porfilr <sadiq@porfilr.com>',
        to: 'sadiq@porfilr.com',
        subject: `New custom domain request: ${domain}`,
        html,
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
