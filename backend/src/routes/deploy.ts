import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const router = express.Router();

/** Types from Vercel API */
interface VercelDeployment {
  id: string;
  url?: string;
  alias?: Array<{ domain?: string; url?: string }>;
  readyState?: string;
  createdAt?: number;
  [key: string]: any;
}

interface DeploymentDetailsResponse {
  aliases?: Array<{ domain?: string; url?: string }>;
  url?: string;
  readyState?: string;
  [key: string]: any;
}

router.post("/deploy", async (req, res) => {
  try {
    const { portfolioId } = req.body;
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

    if (!portfolioId)
      return res.status(400).json({ error: "portfolioId is required" });

    if (!VERCEL_TOKEN)
      return res
        .status(500)
        .json({ error: "Server missing Vercel token in environment variables" });

    const filePath = path.join(
      __dirname,
      "../portfolios",
      `${portfolioId}.html`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Portfolio HTML file not found" });
    }

    const fileContent = fs.readFileSync(filePath, "utf8");

    console.log("🚀 Deploying portfolio:", portfolioId);

    /** 1️⃣ Create the deployment */
    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `portfolio-${portfolioId}`,
        files: [{ file: "index.html", data: fileContent }],
        projectSettings: { framework: null },
      }),
    });

    const deployData = (await deployRes.json()) as VercelDeployment;

    if (!deployRes.ok) {
      console.error("❌ Deployment failed:", deployData);
      return res.status(400).json({
        error: "Failed to deploy to Vercel",
        details: deployData,
      });
    }

    console.log("🟢 Deployment created:", deployData.id);

    const deploymentId = deployData.id;

    /** 2️⃣ Fetch deployment details to get the PUBLIC domain */
    const detailsRes = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
        },
      }
    );

    const detailsData = (await detailsRes.json()) as DeploymentDetailsResponse;

    console.log("📦 Deployment details response:", detailsData);

    /** 3️⃣ Extract the REAL PUBLIC URL */

    let finalUrl: string | null = null;

    // 🔍 A) Check aliases safely
    if (detailsData.aliases && detailsData.aliases.length > 0) {
      const alias = detailsData.aliases[0]; // now safe because we checked length

      const candidate =
        alias?.domain ||
        alias?.url ||
        null;

      if (candidate) {
        finalUrl = `https://${candidate.replace(/^https?:\/\//, "")}`;
        console.log("🌍 Alias found:", finalUrl);
      }
    }

    // 🔍 B) If no alias, use the fallback domain in detailsData.url
    if (!finalUrl && detailsData.url) {
      finalUrl = `https://${detailsData.url}`;
    }

    // 🔍 C) Absolute fallback
    if (!finalUrl && deployData.url) {
      finalUrl = `https://${deployData.url}`;
    }

    console.log("🌍 Final PUBLIC URL:", finalUrl);

    /** 4️⃣ Return result */
    return res.status(200).json({
      message: "Portfolio deployed successfully",
      deploymentId,
      url: finalUrl,
    });
  } catch (err) {
    console.error("🔥 Deployment error:", err);
    return res.status(500).json({
      error: "Server-side deployment failure",
      details: String(err),
    });
  }
});

export default router;
