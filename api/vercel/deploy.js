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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { portfolioId } = req.body;

    if (!portfolioId) {
      return res.status(400).json({ error: "Missing portfolioId" });
    }

    // ✅ Construct file path
    const filePath = `portfolios/${portfolioId}.html`;

    // ✅ Download portfolio HTML from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('portfolios')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Supabase download error:", downloadError);
      return res.status(404).json({ 
        error: "Portfolio file not found",
        details: downloadError?.message 
      });
    }

    // ✅ Convert blob to text
    const html = await fileData.text();

    // ✅ Deploy to Vercel
    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: portfolioId,
        projectSettings: { framework: null },
        files: [
          { file: "index.html", data: html }
        ]
      }),
    });

    const deployJson = await deployRes.json();

    if (!deployRes.ok) {
      console.error("Vercel deployment failed:", deployJson);
      return res.status(500).json({
        error: "Vercel deployment failed",
        details: deployJson,
      });
    }

    // ✅ Get the actual Vercel URL from response
    const vercelUrl = `${portfolioId}.vercel.app`;

    // ✅ Optional: Update database with deployment info
    try {
      await supabase
        .from('portfolios')
        .update({ 
          deployed_url: `https://${vercelUrl}`,
          deployed_at: new Date().toISOString()
        })
        .eq('slug', portfolioId);
    } catch (dbErr) {
      console.error("Database update error:", dbErr);
      // Don't fail the request if DB update fails
    }

    return res.status(200).json({
      url: `https://${vercelUrl}`,
      message: "Portfolio deployed successfully"
    });

  } catch (err) {
    console.error("Deploy error:", err);
    return res.status(500).json({ 
      error: "Server error during deploy",
      details: err.message 
    });
  }
}