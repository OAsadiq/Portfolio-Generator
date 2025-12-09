function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  enableCORS(res);

  const { slug } = req.query;

  const fileUrl = `${process.env.BLOB_PUBLIC_URL}/portfolios/${slug}.html`;
  return res.redirect(fileUrl);
}
