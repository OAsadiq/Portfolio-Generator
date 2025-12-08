import fs from "fs";
import path from "path";
import {templates} from "./templateConfig.js";

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

    const outputDir = "/tmp/portfolios"; // ✔️ writable on Vercel
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const finalHTML = template.generateHTML(formData);

    fs.writeFileSync(`${outputDir}/${slug}.html`, finalHTML);

    return res.status(200).json({
      portfolioSlug: slug,
      tmpPath: `${outputDir}/${slug}.html`,
    });
  } catch (err) {
    console.error("Portfolio generation error:", err);
    return res.status(500).json({ error: "Failed to generate portfolio" });
  }
}