import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  enableCORS(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).send("Portfolio slug is required");
  }

  const filePath = `portfolios/${slug}.html`;

  try {
    // ✅ Download file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('portfolios')
      .download(filePath);

    if (error) {
      console.error("Supabase download error:", error);
      return res.status(404).send("Portfolio not found");
    }

    // ✅ Convert blob to text
    const html = await data.text();

    // ✅ Optional: Increment view count in database
    try {
      await supabase.rpc('increment_portfolio_views', { portfolio_slug: slug });
    } catch (viewErr) {
      console.log("View count update failed (not critical):", viewErr);
      // Continue even if view count fails
    }

    // ✅ Return HTML
    res.setHeader("Content-Type", "text/html");
    res.send(html);

  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).send("Failed to load portfolio");
  }
}