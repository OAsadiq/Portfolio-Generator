import type { VercelRequest, VercelResponse } from "@vercel/node";
import { templates } from "../templates/templateConfig";

// ❗ For Vercel, we return the HTML as a string, not write to disk
function createPortfolioLocal(body: any) {
  const { templateId, ...data } = body;

  const template = (templates as any)[templateId];
  if (!template) throw new Error("Template not found");

  const html = template.generateHTML(data);

  return {
    portfolioSlug: Date.now().toString(), // temporary slug
    html,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const list = Object.values(templates).map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        fields: t.fields,
      }));

      return res.status(200).json(list);
    }

    if (req.method === "POST") {
      const body = req.body;

      if (!body?.templateId) {
        return res.status(400).json({ error: "templateId required" });
      }

      const result = createPortfolioLocal(body);
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("templates API error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
