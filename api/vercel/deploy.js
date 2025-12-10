import { get } from "@vercel/blob";

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { portfolioId } = req.body;

  if (!portfolioId) {
    return res.status(400).json({ error: "Missing portfolioId" });
  }

  try {
    // 1️⃣ Load HTML file from Blob storage
    const blob = await get(`portfolios/${portfolioId}.html`);

    if (!blob?.url) {
      return res.status(404).json({ error: "Portfolio not found in blob" });
    }

    const htmlResponse = await fetch(blob.url);
    const html = await htmlResponse.text();

    // 2️⃣ Prepare file for Vercel deploy
    const files = [
      {
        file: "index.html",
        data: html,
      },
    ];

    // 3️⃣ Deploy to Vercel
    const vercelRes = await fetch(
      "https://api.vercel.com/v13/deployments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: portfolioId,
          files,
          projectSettings: { framework: null },
        }),
      }
    );

    const result = await vercelRes.json();
    console.log("VERCEL RESPONSE:", result);

    if (!vercelRes.ok) {
      return res.status(500).json({
        error: "Vercel deployment failed",
        details: result,
      });
    }

    // 4️⃣ Return final domain (NOT deploy URL)
    return res.status(200).json({
      url: `https://${portfolioId}.vercel.app`,
    });

  } catch (err) {
    console.error("Deploy error:", err);
    return res.status(500).json({ error: "Server error during deploy" });
  }
}
