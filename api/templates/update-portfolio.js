import { createClient } from '@supabase/supabase-js';
import { templates } from "./_templateConfig.js";
import { computeMetrics } from "../_lib/metrics.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug, templateId, formData, sections } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error(authError);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', user.id)
      .single();

    if (portfolioError || !portfolio) {
      console.error(portfolioError);
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const template = templates[templateId];
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Compute the journal metrics NOW rather than reusing portfolio.metrics_cache.
    // The cache is only written when a visitor hits /api/track-record, so on the publish
    // that immediately follows "turn on live track record" it is still null — the page
    // would bake the trader's typed placeholder figures and keep showing them until a
    // stranger happened to load it. Computing here means the page is correct the moment
    // it's published.
    let metricsCache = portfolio.metrics_cache || null;
    if (portfolio.journal_enabled && portfolio.starting_balance > 0) {
      const { data: trades, error: tradesErr } = await supabase
        .from('trades')
        .select('opened_at, closed_at, pnl, fees')
        .eq('portfolio_id', portfolio.id)
        .not('closed_at', 'is', null)
        .limit(5000);

      if (tradesErr) {
        // Never fail a publish over metrics — fall back to the last known cache.
        console.error('trades fetch failed during publish:', tradesErr.message);
      } else {
        metricsCache = computeMetrics(trades || [], portfolio.starting_balance);
        // Persist so the baked fallback and the live endpoint agree from the start.
        const { error: cacheErr } = await supabase
          .from('portfolios')
          .update({ metrics_cache: metricsCache, metrics_updated_at: new Date().toISOString() })
          .eq('id', portfolio.id);
        if (cacheErr) console.error('metrics_cache write failed:', cacheErr.message);
      }
    }

    const generatedHtml = template.generateHTML(formData, sections, {
      slug,
      journalEnabled: !!portfolio.journal_enabled,
      metricsCache,
    });

    const filePath = `portfolios/${slug}.html`;
    
    try {
      await supabase.storage
        .from('portfolios')
        .remove([filePath]);
    } catch (removeErr) {
      console.log(removeErr);
    }

    const { error: uploadError } = await supabase.storage
      .from('portfolios')
      .upload(filePath, generatedHtml, {
        contentType: 'text/html',
        cacheControl: '3600',
        upsert: true 
      });

    if (uploadError) {
      return res.status(500).json({ 
        error: 'Failed to update portfolio file',
        details: uploadError.message 
      });
    }

    const { error: updateError } = await supabase
      .from('portfolios')
      .update({
        form_data: formData,
        sections: sections, 
        user_name: formData.fullName || portfolio.user_name,
        user_email: formData.email || portfolio.user_email,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({ 
      success: true,
      message: 'Portfolio updated successfully',
      slug: slug
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: error.message || 'Failed to update portfolio',
      details: error.toString()
    });
  }
}