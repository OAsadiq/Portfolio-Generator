import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { slug } = req.query;

  const filePath = path.join(process.cwd(), "public", "portfolios", `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Portfolio not found");
  }

  const html = fs.readFileSync(filePath, "utf-8");
  res.setHeader("Content-Type", "text/html");
  res.send(html);
}
