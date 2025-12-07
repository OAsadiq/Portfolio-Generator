import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { templateId, formData } = req.body;

    if (!templateId || !formData) {
      return res.status(400).json({ error: "Missing template or form data" });
    }

    // Load template from JS file
    const templatePath = path.join(
      process.cwd(),
      "api",
      "templates",
      templateId,
      "index.js"
    );

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Import template module dynamically
    const templateModule = await import(templatePath);
    const template = templateModule.default;

    if (!template.generateHTML) {
      return res.status(500).json({ error: "Template missing generateHTML()" });
    }

    // Generate unique portfolio slug
    const slug = `portfolio-${Date.now()}`;

    // Output folder
    const outputDir = path.join(process.cwd(), "public", "portfolios");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate final HTML
    const finalHTML = template.generateHTML(formData);

    // Save file
    fs.writeFileSync(path.join(outputDir, `${slug}.html`), finalHTML);

    res.status(200).json({
      portfolioSlug: slug,
    });

  } catch (err) {
    console.error("Portfolio generation error:", err);
    res.status(500).json({ error: "Failed to generate portfolio" });
  }
}
