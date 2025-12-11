// api/vercel/deploy.js
import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { portfolioId } = req.body;

    if (!portfolioId)
      return res.status(400).json({ error: "Missing portfolioId" });

    const key = `portfolios/${portfolioId}.html`;

    const files = await list({ prefix: "portfolios/" });
    const file = files.blobs.find(b => b.pathname === key);

    if (!file) {
      return res.status(404).json({ error: "Portfolio file not found" });
    }

    const htmlResponse = await fetch(file.url);
    const html = await htmlResponse.text();

    // Deploy to Vercel
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
      return res.status(500).json({
        error: "Vercel deployment failed",
        details: deployJson,
      });
    }

    // Vercel gives `url` like bright-sunbeam-123.vercel.app
    // But user wants: https://portfolioId.vercel.app
    const customDomain = `${portfolioId}.vercel.app`;

    return res.status(200).json({
      url: `https://${customDomain}`
    });

  } catch (err) {
    console.error("Deploy error:", err);
    return res.status(500).json({ error: "Server error during deploy" });
  }
}
