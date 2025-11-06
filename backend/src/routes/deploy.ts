import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/deploy", async (req, res) => {
  try {
    const { username } = req.body; // Example: 'ayomide'
    const folderPath = path.join(process.cwd(), "portfolios", username);

    // Ensure portfolio folder exists
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    // Create files object for deployment
    const files = fs.readdirSync(folderPath).map((file) => {
      const content = fs.readFileSync(path.join(folderPath, file));
      return {
        file,
        data: content.toString("base64"),
      };
    });

    const payload = {
      name: `${username}-portfolio`,
      files: files.map((f) => ({
        file: f.file,
        data: f.data,
        encoding: "base64",
      })),
      target: "production",
      projectSettings: {
        framework: null,
      },
    };

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      res.json({
        message: "Deployment successful",
        url: data.url, // Example: ayomide-portfolio.vercel.app
      });
    } else {
      res.status(400).json({
        error: "Failed to deploy",
        details: data,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
