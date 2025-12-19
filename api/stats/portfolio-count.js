import { list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({
      prefix: "portfolios/",
      limit: 1000, // adjust if you expect more
    });

    res.status(200).json({
      count: blobs.length,
    });
  } catch (error) {
    console.error("Portfolio count error:", error);
    res.status(500).json({ error: "Failed to fetch portfolio count" });
  }
}
