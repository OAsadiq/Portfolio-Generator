import type { VercelRequest, VercelResponse } from "@vercel/node";
import { deployPortfolio } from "../../routes/deployLogic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await deployPortfolio(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
