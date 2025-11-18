import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  listTemplates,
  getTemplatePreview,
  selectTemplate,
  createPortfolio,
} from "../../routes/templatesRoutesLogic";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.status(200).json({ message: "Backend running" });
  try {
    if (req.method === "GET") {
      if (req.query.id) {
        const file = getTemplatePreview(req.query.id as string);
        if (!file) return res.status(404).send("Preview not found");
      }

      return res.status(200).json(listTemplates());
    }

    if (req.method === "POST") {
      const result = createPortfolio(req.body, (req as any).files || []);
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}