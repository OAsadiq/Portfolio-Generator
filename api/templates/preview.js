import { get } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { slug } = req.query;

    const blob = await get(`portfolios/${slug}.html`);

    if (!blob) {
      return res.status(404).send("Portfolio not found");
    }

    const response = await fetch(blob.url);
    const html = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send("Preview failed");
  }
}
