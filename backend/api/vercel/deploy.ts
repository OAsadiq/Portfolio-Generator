import type { VercelRequest, VercelResponse } from "@vercel/node";
import { deployPortfolio } from "../utils/deployLogic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { portfolioId } = req.body;
    if (!portfolioId) return res.status(400).json({ error: "portfolioId required" });

    const result = await deployPortfolio({ portfolioId });
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("deploy api error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
