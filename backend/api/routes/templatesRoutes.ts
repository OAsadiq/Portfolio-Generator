import path from "path";
import fs from "fs";
import slugify from "slugify";
import { templates } from "../templates/templateConfig";

export function createPortfolio(body: any) {
  const { templateId, ...data } = body;
  const template = (templates as any)[templateId];
  if (!template) throw new Error("Template not found");

  const baseSlug = slugify(data.fullName || "user", { lower: true, strict: true });
  let slug = baseSlug || "user";
  let counter = 1;
  const portfolioDir = path.join(process.cwd(), "src", "portfolios");
  if (!fs.existsSync(portfolioDir)) fs.mkdirSync(portfolioDir, { recursive: true });

  while (fs.existsSync(path.join(portfolioDir, `${slug}.html`))) {
    slug = `${baseSlug}-${counter++}`;
  }
  const html = template.generateHTML(data);
  const outPath = path.join(portfolioDir, `${slug}.html`);
  fs.writeFileSync(outPath, html, "utf8");
  return { portfolioSlug: slug, filePath: outPath };
}
