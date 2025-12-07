import { templates } from "./templateConfig.js";

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default function handler(req, res) {
  enableCORS(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const list = Object.values(templates).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        fields: t.fields
      }));
      return res.status(200).json(list);
    }

    if (req.method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      if (!body?.templateId) {
        return res.status(400).json({ error: "templateId required" });
      }

      const template = templates[body.templateId];
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const html = template.generateHTML(body);

      return res.status(200).json({
        message: "Portfolio generated",
        html
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
