import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).send('<h1>Missing portfolio slug</h1>');
  }

  try {
    const filePath = `portfolios/${slug}.html`;

    const { data, error } = await supabase.storage
      .from('portfolios')
      .download(filePath);

    if (error || !data) {
      return res.status(404).send('<h1>Portfolio not found</h1>');
    }

    const html = await data.text();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (err) {
    console.error(err);
    return res.status(500).send('<h1>Error loading portfolio</h1>');
  }
}
