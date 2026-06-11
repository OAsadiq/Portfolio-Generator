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
    // Try exact slug match first
    let { data: portfolio, error: dbError } = await supabase
      .from('portfolios')
      .select('file_path, slug')
      .eq('slug', slug)
      .maybeSingle();

    // If not found, try fuzzy match (slug may include timestamp or differ slightly)
    if (!portfolio) {
      const { data: fuzzy } = await supabase
        .from('portfolios')
        .select('file_path, slug')
        .ilike('slug', `${slug.split('-').slice(0, 3).join('-')}%`)
        .limit(1);
      if (fuzzy && fuzzy.length > 0) portfolio = fuzzy[0];
    }

    if (!portfolio) {
      return res.status(404).send('<h1>Portfolio not found</h1>');
    }

    // Resolve file path — fall back to constructing from slug if column is null
    const filePath = portfolio.file_path || `portfolios/${portfolio.slug}.html`;

    const { data, error } = await supabase.storage
      .from('portfolios')
      .download(filePath);

    if (error || !data) {
      // Last resort: try the slug as passed in the URL
      const { data: data2, error: error2 } = await supabase.storage
        .from('portfolios')
        .download(`portfolios/${slug}.html`);

      if (error2 || !data2) {
        return res.status(404).send(`<h1>Portfolio file not found</h1><p>slug: ${slug} | path: ${filePath}</p>`);
      }

      const html2 = await data2.text();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html2);
    }

    const html = await data.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (err) {
    return res.status(500).send(`<h1>Error loading portfolio</h1><pre>${err.message}</pre>`);
  }
}
