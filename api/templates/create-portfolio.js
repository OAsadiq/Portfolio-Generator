import { put } from "@vercel/blob";
import { templates } from "./templateConfig.js";

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const COUNT_KEY = "stats/portfolio-count.json";

export default async function handler(req, res) {
  enableCORS(res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { templateId, formData } = req.body;
    if (!templateId || !formData) {
      return res.status(400).json({ error: "Missing template or form data" });
    }

    const template = templates[templateId];
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const slug = `portfolio-${Date.now()}`;
    const finalHTML = template.generateHTML(formData);

    // Save to Vercel Blob
    const { url } = await put(`portfolios/${slug}.html`, finalHTML, {
      access: "public",
      contentType: "text/html",
    });

    let count = 0;
    try {
      const existing = await list(COUNT_KEY);
      const data = JSON.parse(await existing.text());
      count = data.count || 0;
    } catch {
      count = 0;
    }

    await put(
      COUNT_KEY,
      JSON.stringify({ count: count + 1 }),
      { access: "public", contentType: "application/json" }
    );

    return res.status(200).json({
      portfolioSlug: slug,
      publicUrl: url,
    });
  } catch (err) {
    console.error("Portfolio generation error:", err);
    return res.status(500).json({ error: "Failed to generate portfolio" });
  }
}
