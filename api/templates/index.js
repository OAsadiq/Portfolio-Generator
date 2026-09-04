import { templates } from "./_templateConfig.js";

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
        isPro: t.isPro || false,
        usesBuilder: t.usesBuilder || false, // rendering: visual builder vs form flow
        kit: t.kit || null,                  // entitlement: bought separately, not via Pro
        kitName: t.kitName || null,
        fields: t.fields
      }));
      
      return res.status(200).json({ 
        templates: list,
        count: list.length 
      });
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

      // generateHTML(data, sections, meta) — `sections` is a separate argument, so passing
      // the whole body as `data` silently ignored it. The mobile preview sends the user's
      // section toggles, and without this they'd see a page that still showed sections
      // they'd just switched off, then a published page that differed from the preview.
      const { sections, templateId: _id, ...data } = body;
      const html = template.generateHTML(data, Array.isArray(sections) ? sections : []);

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