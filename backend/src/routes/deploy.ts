import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/deploy", async (req: Request, res: Response) => {
  const { portfolioId } = req.body;
  console.log(`🟡 Incoming deploy request for: ${portfolioId}`);

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

  console.log("🔑 VERCEL_TOKEN present?", !!VERCEL_TOKEN);

  if (!VERCEL_TOKEN) {
    return res.status(400).json({ error: "Missing VERCEL_TOKEN in environment" });
  }

  const filePath = path.join(__dirname, "../portfolios", `${portfolioId}.html`);

  if (!fs.existsSync(filePath)) {
    console.log("❌ Portfolio not found at:", filePath);
    return res.status(404).json({ error: "Portfolio file not found" });
  }

  try {
    const htmlContent = fs.readFileSync(filePath, "utf8");

    // Deploy to Vercel
    const vercelResponse = await axios.post(
      "https://api.vercel.com/v13/deployments",
      {
        name: portfolioId,
        files: [
          {
            file: "index.html",
            data: htmlContent,
          },
        ],
        projectSettings: {
          framework: null,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        params: {
          teamId: VERCEL_TEAM_ID,
        },
      }
    );

    console.log("✅ Deployed:", vercelResponse.data.url);
    res.json({ message: "Deployment successful", url: `https://${vercelResponse.data.url}` });
  } catch (error: any) {
    console.error("❌ Deployment failed:", error.response?.data || error.message);
    res.status(400).json({ error: "Failed to deploy portfolio" });
  }
});

export default router;
