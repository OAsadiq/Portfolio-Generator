import { createClient } from '@supabase/supabase-js';
import { templates } from "./_templateConfig.js";
import { computeMetrics } from "../_lib/metrics.js";
import { removeBrandingFor } from "../_lib/branding.js";
import { validateFormData } from "../_lib/formSize.js";

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

    // Size/content limits before any work is done — see api/_lib/formSize.js. Applied on
    // update as well as create: an existing portfolio can be edited into the same state.
    const sizeCheck = validateFormData(formData, sections);
    if (!sizeCheck.ok) {
      return res.status(sizeCheck.status).json({ error: sizeCheck.error, code: sizeCheck.code });
    }

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

    // Branding removal is a paid perk, scoped to THIS portfolio's template — see
    // api/_lib/branding.js. Computed server-side so it can't be spoofed from the client.
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('status, plan')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    const isPro = subs && subs[0] && subs[0].status === 'active' && subs[0].plan === 'pro';

    // Ownership of THIS kit, not "any kit" — a second kit must not de-brand the first
    // one's page, and a kit must not de-brand anything else the user owns.
    let ownsKit = false;
    if (template.kit) {
      const { data: owned, error: ownErr } = await supabase
        .from('template_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('template_id', templateId)
        .maybeSingle();
      if (ownErr) console.error('kit ownership check failed:', ownErr);
      ownsKit = !!owned;
    }

    const removeBranding = removeBrandingFor(template, { isPro, ownsKit });

    // Compute the journal metrics NOW rather than reusing portfolio.metrics_cache.
    // The cache is only written when a visitor hits /api/track-record, so on the publish
    // that immediately follows "turn on live track record" it is still null — the page
    // would bake the trader's typed placeholder figures and keep showing them until a
    // stranger happened to load it. Computing here means the page is correct the moment
    // it's published.
    let metricsCache = portfolio.metrics_cache || null;
    // Also reused by the opt-in trading calendar below, so it's declared out here.
    let closedTradeRows = [];
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
        closedTradeRows = trades || [];
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
      removeBranding,
      // Opt-in trading calendar: only rendered when the trader turned it on.
      calendarPublic: !!portfolio.calendar_public,
      trades: closedTradeRows,
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
        updated_at: new Date().toISOString(),
        // Saving from the builder publishes the page, so a draft becomes live here.
        //
        // The builder routes to update-portfolio whenever it has a slug — which a
        // journal-first user always does, because /journal created their draft. Without
        // this the HTML was written and the page served, but the row stayed 'draft': the
        // dashboard kept saying "Journal only — publish one" for a page that was already
        // published, and /p/:slug 404'd because it filters on status='active'.
        status: 'active',
        // Required: sql/012 enforces that an ACTIVE row has a file_path, so a page can
        // never be marked live with nothing to serve. A draft's file_path is null until
        // this first publish writes the HTML above.
        file_path: filePath,
        deployed_url: portfolio.deployed_url || `https://porfilr.com/p/${slug}`,
        deployed_at: portfolio.deployed_at || new Date().toISOString(),
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