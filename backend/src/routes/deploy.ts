import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const router = express.Router();

type VercelDeploymentResponse = {
  id?: string;
  url?: string; 
  state?: string;
  aliases?: Array<{ domain?: string; url?: string }>;
  [key: string]: any;
};

const WAIT_INTERVAL_MS = 2000;
const MAX_POLLS = 12; 

router.post("/deploy", async (req, res) => {
  try {
    const { portfolioId } = req.body as { portfolioId?: string };
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

    if (!portfolioId) {
      return res.status(400).json({ error: "portfolioId is required" });
    }
    if (!VERCEL_TOKEN) {
      return res.status(500).json({ error: "Server missing Vercel token" });
    }

    const filePath = path.join(__dirname, "../portfolios", `${portfolioId}.html`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Portfolio file not found" });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");

    const payload = {
      name: `portfolio-${portfolioId}`,
      public: true,
      files: [{ file: "index.html", data: fileContent }],
      projectSettings: { framework: null },
    };

    console.log("🚀 Creating deployment for:", portfolioId);

    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const deployData = (await deployRes.json()) as VercelDeploymentResponse;

    if (!deployRes.ok) {
      console.error("❌ Vercel deploy error:", deployData);
      return res.status(400).json({
        error: "Failed to deploy portfolio",
        details: deployData,
      });
    }

    const deploymentId = deployData.id;
    console.log("📦 Deployment created:", deploymentId, "temp url:", deployData.url);

    let finalUrl: string | null = null;
    let pollCount = 0;

    while (pollCount < MAX_POLLS) {
      pollCount++;
      const detailsRes = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      const detailsData = (await detailsRes.json()) as VercelDeploymentResponse;
      console.log(`🔁 Poll #${pollCount} state=${detailsData.state} aliases=${JSON.stringify(detailsData.aliases)}`);

      const aliasCandidate = detailsData.aliases?.[0]?.domain || detailsData.aliases?.[0]?.url;
      if (aliasCandidate) {
        finalUrl = `https://${aliasCandidate.replace(/^https?:\/\//, "")}`;
        console.log("🌍 Alias found:", finalUrl);
        break;
      }

      if (detailsData.state === "READY" && deployData.url) {
        finalUrl = `https://${deployData.url}`;
        console.log("✅ Deployment READY, using deployment url:", finalUrl);
        break;
      }
      await new Promise((r) => setTimeout(r, WAIT_INTERVAL_MS));
    }

    if (!finalUrl) {
      if (deployData.url) {
        finalUrl = `https://${deployData.url}`;
        console.warn("⚠️ No alias found - falling back to deploy url:", finalUrl);
      } else {
        console.error("❌ No URL available for deployment", deployData);
        return res.status(500).json({ error: "Deployment succeeded but no URL available", details: deployData });
      }
    }

    return res.status(200).json({
      message: "Portfolio deployed successfully",
      deploymentId,
      url: finalUrl,
    });
  } catch (err: any) {
    console.error("🔥 Deployment Error:", err);
    return res.status(500).json({
      error: "Internal Server Error during deployment",
      details: String(err),
    });
  }
});

export default router;
