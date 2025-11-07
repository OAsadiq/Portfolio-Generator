import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import slugify from "slugify";
import { templates } from "../templates/templateConfig";
import { TemplateConfig } from "../templates/templateTypes";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { error: "Please wait before generating another portfolio" }
});

// List all templates
router.get("/", (req, res) => {
  const list = Object.values(templates as Record<string, TemplateConfig>).map(
    ({ id, name, description, thumbnail }) => ({ id, name, description, thumbnail })
  );
  res.json(list);
});

// Preview template (HTML)
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const templatePath = path.resolve(`./src/templates/${id}/index.html`);

  if (!fs.existsSync(templatePath)) {
    return res.status(404).send("Template not found");
  }

  const html = fs.readFileSync(templatePath, "utf-8");
  res.send(html);
});

// Select a template and return its config
router.get("/select/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const template = Object.values(templates).find((t) => t.id === id);

  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }

  res.json({
    id: template.id,
    name: template.name,
    description: template.description,
    fields: template.fields,
  });
});

// ✅ Create portfolio route
router.post(
  "/create-portfolio",
  generateLimiter,
  upload.any(), // handle file uploads
  async (req: Request, res: Response) => {
    try {
      const { templateId, ...body } = req.body;
      const template = templates[templateId];
      if (!template) return res.status(404).json({ error: "Template not found" });

      // Merge uploaded files into data
      const data: Record<string, any> = { ...body };
      if (req.files) {
        (req.files as Express.Multer.File[]).forEach((file) => {
          data[file.fieldname] = `/uploads/${file.filename}`;
        });
      }

      // Generate a slug from user's full name
      const portfolioDir = path.join(__dirname, "portfolios");
      if (!fs.existsSync(portfolioDir)) fs.mkdirSync(portfolioDir);

      const baseSlug = slugify(data.fullName || "user", { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Check for existing portfolios with same slug
      while (fs.existsSync(path.join(portfolioDir, `${slug}.html`))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const portfolioPath = path.join(portfolioDir, `${slug}.html`);

      // Generate HTML
      const html = template.generateHTML(data);
      fs.writeFileSync(portfolioPath, html, "utf-8");

      // Return the slug to frontend for friendly URL
      res.json({ portfolioSlug: slug });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate portfolio" });
    }
  }
);

export default router;
