import { list } from "@vercel/blob";

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  enableCORS(res);

  const { slug } = req.query;
  const filePath = `portfolios/${slug}.html`;

  try {
    const { blobs } = await list({ prefix: "portfolios/" });

    const file = blobs.find((b) => b.pathname === filePath);

    if (!file) {
      return res.status(404).send("Portfolio not found");
    }

    const response = await fetch(file.url);
    const html = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.send(html);

  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).send("Failed to load portfolio");
  }
}
