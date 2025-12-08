import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { portfolioId } = req.body;

  if (!portfolioId) {
    return res.status(400).json({ error: "Missing portfolioId" });
  }

  try {
    const portfolioPath = path.join(
      process.cwd(),
      "tmp",
      "portfolios",
      `${portfolioId}.html`
    );

    if (!fs.existsSync(portfolioPath)) {
      return res.status(404).json({ error: "Portfolio file not found" });
    }

    const htmlContent = fs.readFileSync(portfolioPath, "utf8");

    // Prepare files object for Vercel Deploy API
    const files = [
      {
        file: "index.html",
        data: htmlContent,
      },
    ];

    // Deploy to Vercel
    const vercelRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: portfolioId,
        files,
        projectSettings: {
          framework: null,
        },
      }),
    });

    const result = await vercelRes.json();
    console.log("VERCEL RESPONSE:", result);

    if (!vercelRes.ok) {
      return res.status(500).json({
        error: "Vercel deploy failed",
        details: result,
      });
    }

    return res.status(200).json({
      url: result.url ? `https://${result.url}` : null,
    });
  } catch (err) {
    console.error("Vercel deploy error:", err);
    return res.status(500).json({ error: "Server error during deploy" });
  }
}
