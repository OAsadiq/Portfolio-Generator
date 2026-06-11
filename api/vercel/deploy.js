import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Portfolios are served directly from Supabase Storage.
// This endpoint resolves the public URL and records it — no Vercel deployment needed.
export default async function handler(req, res) {
  enableCORS(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { portfolioId } = req.body;

    if (!portfolioId) {
      return res.status(400).json({ error: "Missing portfolioId" });
    }

    const filePath = `portfolios/${portfolioId}.html`;

    const publicUrl = `https://porfilr.com/p/${portfolioId}`;

    const { error: updateError } = await supabase
      .from('portfolios')
      .update({
        deployed_url: publicUrl,
        deployed_at: new Date().toISOString()
      })
      .eq('slug', portfolioId);

    if (updateError) {
      console.error(updateError);
    }

    return res.status(200).json({
      url: publicUrl,
      message: "Portfolio published successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}