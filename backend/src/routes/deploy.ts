import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const router = express.Router();

interface VercelDeploymentResponse {
  url?: string;
  name?: string;
  created?: number;
  state?: string;
  [key: string]: any;
}

router.post("/deploy", async (req, res) => {
  try {
    const { portfolioId } = req.body;
    console.log("🟡 Incoming deploy request for:", portfolioId);

    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    console.log("🔑 VERCEL_TOKEN present?", !!VERCEL_TOKEN);

    const filePath = path.join(__dirname, "../portfolios", `${portfolioId}.html`);
    console.log("📂 Looking for file:", filePath, fs.existsSync(filePath));

    if (!portfolioId) {
      return res.status(400).json({ error: "portfolioId is required" });
    }
    if (!VERCEL_TOKEN) {
      return res.status(500).json({ error: "Server missing Vercel token" });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Portfolio file not found" });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");

    const payload = {
      name: `portfolio-${portfolioId}`,
      public: true,
      files: [
        {
          file: "index.html",
          data: fileContent,
        },
      ],
      projectSettings: {
        framework: null,
      },
    };

    console.log("🚀 Deploying to Vercel...");

    const vercelRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const vercelData = (await vercelRes.json()) as VercelDeploymentResponse;
    console.log("📦 Vercel response:", vercelData);

    if (!vercelRes.ok) {
      return res.status(400).json({
        error: "Failed to deploy portfolio",
        details: vercelData,
      });
    }

    res.status(200).json({
      message: "Portfolio deployed successfully",
      deployment: vercelData,
      url: vercelData.url ? `https://${vercelData.url}` : null,
    });
  } catch (error: any) {
    console.error("🔥 Deployment error:", error);
    res.status(500).json({
      error: "Server error during deployment",
      details: String(error),
    });
  }
});

export default router;
