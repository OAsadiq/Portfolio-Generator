import path from "path";
import fs from "fs";
import slugify from "slugify";
import { templates } from "../src/templates/templateConfig";
import { TemplateConfig } from "../src/templates/templateTypes";

export function listTemplates() {
  return Object.values(templates as Record<string, TemplateConfig>).map(
    ({ id, name, description, thumbnail }) => ({
      id,
      name,
      description,
      thumbnail,
    })
  );
}

export function getTemplatePreview(id: string): string | null {
  const template = templates[id];
  if (!template) return null;

  const filePath = path.join(process.cwd(), "src/templates", id, "preview.html");

  return fs.existsSync(filePath) ? filePath : null;
}

export function selectTemplate(id: string) {
  const template = Object.values(templates).find((t) => t.id === id);
  if (!template) return null;

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    fields: template.fields,
  };
}

export function createPortfolio(body: any, files: any[]) {
  const { templateId, ...data } = body;

  const template = templates[templateId];
  if (!template) throw new Error("Template not found");

  // Attach files to data
  if (files) {
    files.forEach((file) => {
      data[file.fieldname] = `/uploads/${file.filename}`;
    });
  }

  const portfolioDir = path.join(process.cwd(), "src/portfolios");
  if (!fs.existsSync(portfolioDir)) fs.mkdirSync(portfolioDir, { recursive: true });

  const baseSlug = slugify(data.fullName || "user", { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (fs.existsSync(path.join(portfolioDir, `${slug}.html`))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const portfolioPath = path.join(portfolioDir, `${slug}.html`);
  const html = template.generateHTML(data);

  fs.writeFileSync(portfolioPath, html, "utf8");

  return {
    message: "Portfolio generated successfully",
    portfolioSlug: slug,
    filePath: `/src/portfolios/${slug}.html`,
  };
}
