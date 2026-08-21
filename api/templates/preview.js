import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  enableCORS(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).send("Portfolio slug is required");
  }

  const filePath = `portfolios/${slug}.html`;

  try {

    const { data, error } = await supabase.storage
      .from('portfolios')
      .download(filePath);

    if (error) {
      console.error(error);
      return res.status(404).send("Portfolio not found");
    }

    const html = await data.text();

    // NO view increment here, deliberately.
    //
    // This route is the OWNER's own "view my page" link — it's linked only from the edit
    // page and the dashboard; anything shared with other people goes to /p/:slug, which
    // does the counting. Incrementing here meant an author checking their own work
    // inflated their own view count, which is the one number they'd read as "did anyone
    // actually look at this?".

    res.setHeader("Content-Type", "text/html");
    // This is the owner's own preview — it must always reflect their last save. Never
    // cache it, at the edge or in their browser: seeing a stale page here reads as
    // "my change didn't save".
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.send(html);

  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).send("Failed to load portfolio");
  }
}