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
    let { data: portfolio } = await supabase
      .from('portfolios')
      .select('file_path, slug, views')
      .eq('slug', slug)
      .maybeSingle();

    // Fuzzy fallback for old timestamped slugs
    if (!portfolio) {
      const { data: fuzzy } = await supabase
        .from('portfolios')
        .select('file_path, slug, views')
        .ilike('slug', `${slug.split('-').slice(0, 3).join('-')}%`)
        .limit(1);
      if (fuzzy && fuzzy.length > 0) portfolio = fuzzy[0];
    }

    if (!portfolio) {
      return res.status(404).send('<h1>Portfolio not found</h1>');
    }

    const filePath = portfolio.file_path || `portfolios/${portfolio.slug}.html`;

    const { data, error } = await supabase.storage
      .from('portfolios')
      .download(filePath);

    if (error || !data) {
      const { data: data2, error: error2 } = await supabase.storage
        .from('portfolios')
        .download(`portfolios/${slug}.html`);

      if (error2 || !data2) {
        return res.status(404).send(`<h1>Portfolio file not found</h1><p>slug: ${slug} | path: ${filePath}</p>`);
      }

      const html2 = await data2.text();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html2);

      // Increment view count after sending response
      await supabase
        .from('portfolios')
        .update({ views: (portfolio.views || 0) + 1 })
        .eq('slug', portfolio.slug);

      return;
    }

    const html = await data.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).send(html);

    // Increment view count after sending response
    await supabase
      .from('portfolios')
      .update({ views: (portfolio.views || 0) + 1 })
      .eq('slug', portfolio.slug);

  } catch (err) {
    return res.status(500).send(`<h1>Error loading portfolio</h1><pre>${err.message}</pre>`);
  }
}
