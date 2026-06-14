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
    // Look up the actual file_path from the DB — filenames may include timestamps
    const { data: portfolio, error: dbError } = await supabase
      .from('portfolios')
      .select('file_path')
      .eq('slug', slug)
      .single();

    if (dbError || !portfolio) {
      return res.status(404).send('<h1>Portfolio not found</h1>');
    }

    const { data, error } = await supabase.storage
      .from('portfolios')
      .download(portfolio.file_path);

    if (error || !data) {
      return res.status(404).send('<h1>Portfolio file not found</h1>');
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
