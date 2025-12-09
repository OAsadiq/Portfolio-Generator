import { put } from "@vercel/blob";
import { templates } from "./templateConfig.js";

export default async function handler(req, res) {
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
    const html = template.generateHTML(formData);

    // Upload to Vercel Blob Storage
    const blob = await put(`portfolios/${slug}.html`, html, {
      contentType: "text/html",
    });

    return res.status(200).json({
      portfolioSlug: slug,
      previewUrl: blob.url, // 🔥 Direct permanent URL
    });

  } catch (err) {
    console.error("Blob Save Error:", err);
    return res.status(500).json({ error: "Failed to generate portfolio" });
  }
}
