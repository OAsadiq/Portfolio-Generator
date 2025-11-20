import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";
import fs from "fs";
import { templates } from "./templateConfig";
import { createPortfolio as createPortfolioLogic } from "../../src/routes/templatesRoutes"; // we'll include this helper below or inline

// --- Helper createPortfolio logic (lightweight) ---
// This duplicates logic from earlier - creates HTML using template.generateHTML and writes to src/portfolios
function createPortfolioLocal(body: any) {
  const { templateId, ...data } = body;
  const template = (templates as any)[templateId];
  if (!template) throw new Error("Template not found");

  // new slug by name or uuid
  const base = (data.fullName || "user").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g,"") || "user";
  let slug = base;
  let counter = 1;
  const portfoliosDir = path.join(process.cwd(), "src", "portfolios");
  if (!fs.existsSync(portfoliosDir)) fs.mkdirSync(portfoliosDir, { recursive: true });

  while (fs.existsSync(path.join(portfoliosDir, `${slug}.html`))) {
    slug = `${base}-${counter++}`;
  }

  const html = template.generateHTML(data);
  const outPath = path.join(portfoliosDir, `${slug}.html`);
  fs.writeFileSync(outPath, html, "utf8");

  return { portfolioSlug: slug, filePath: outPath };
}

// --- API handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      // Return templates list
      const list = Object.values(templates).map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        fields: t.fields
      }));
      return res.status(200).json(list);
    }

    if (req.method === "POST") {
      // Create portfolio. Expect JSON body: { templateId, fullName, bio, email, profilePicture }
      const body = req.body;
      if (!body || !body.templateId) return res.status(400).json({ error: "templateId required" });
      const result = createPortfolioLocal(body);
      return res.status(200).json(result);
    }

    // preview route: GET with ?preview=template-id
    if (req.method === "HEAD") {
      return res.status(200).send("");
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("templates api error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
