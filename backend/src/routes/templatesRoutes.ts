import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import rateLimit from "express-rate-limit";
import slugify from "slugify";
import { templates } from "../templates/templateConfig";
import { TemplateConfig } from "../templates/templateTypes";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "src", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
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
  max: 5,
  keyGenerator: (req) => {
    const ip = req.ip || "unknown";
    const templateId = (req.body?.templateId || "global").toString();
    return `${ip}-${templateId}`;
  },
  message: { error: "You’ve reached the limit. Please wait a bit before generating more." },
});


// List all templates
router.get("/", (req, res) => {
  const list = Object.values(templates as Record<string, TemplateConfig>).map(
    ({ id, name, description, thumbnail }) => ({ id, name, description, thumbnail })
  );
  res.json(list);
});

// Preview template
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const template = templates[id];

  if (!template) {
    return res.status(404).send("Template not found");
  }

  const filePath = path.join(__dirname, `../templates/${id}/preview.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Preview file missing");
  }
});


// Select a template
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

// ✅ Create portfolio
router.post(
  "/create-portfolio",
  generateLimiter,
  upload.any(),
  async (req: Request, res: Response) => {
    try {
      const { templateId, ...body } = req.body;
      const template = templates[templateId];
      if (!template) return res.status(404).json({ error: "Template not found" });

      const data: Record<string, any> = { ...body };
      if (req.files) {
        (req.files as Express.Multer.File[]).forEach((file) => {
          data[file.fieldname] = `/uploads/${file.filename}`;
        });
      }

      // ✅ Use consistent directory
      const portfolioDir = path.join(process.cwd(), "src", "portfolios");
      if (!fs.existsSync(portfolioDir)) fs.mkdirSync(portfolioDir, { recursive: true });

      const baseSlug = slugify(data.fullName || "user", { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      while (fs.existsSync(path.join(portfolioDir, `${slug}.html`))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const portfolioPath = path.join(portfolioDir, `${slug}.html`);

      console.log("🟢 Generating portfolio for:", data.fullName);
      console.log("📄 Template used:", templateId);
      console.log("📁 Saving at:", portfolioPath);

      const html = template.generateHTML(data);
      fs.writeFileSync(portfolioPath, html, "utf-8");

      res.json({
        message: "Portfolio generated successfully",
        portfolioSlug: slug,
        filePath: `/src/portfolios/${slug}.html`,
      });
    } catch (err) {
      console.error("❌ Portfolio generation failed:", err);
      res.status(500).json({ error: "Failed to generate portfolio" });
    }
  }
);

export default router;
