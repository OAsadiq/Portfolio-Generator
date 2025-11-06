import express, { Request, Response } from "express";
const router = express.Router();

// POST /api/vercel/deploy
router.post("/deploy", async (req: Request, res: Response) => {
  try {
    const { projectName, gitRepo } = req.body;

    if (!projectName || !gitRepo) {
      return res.status(400).json({ error: "Missing projectName or gitRepo" });
    }

    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    if (!VERCEL_TOKEN) return res.status(500).json({ error: "Vercel token not set" });

    // Trigger deployment via Vercel API
    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        gitSource: {
          type: "github",
          repoId: gitRepo,
          ref: "main",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "Vercel deployment failed" });
    }

    // Return deployment URL to frontend
    res.json({ success: true, deploymentUrl: data.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error triggering Vercel deploy" });
  }
});

export default router;
