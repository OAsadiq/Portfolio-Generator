import { createClient } from '@supabase/supabase-js';
import { templates } from "./_templateConfig.js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

function createSlug(fullName) {
    return fullName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

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
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // GET SECTIONS FROM REQUEST BODY
        const { templateId, formData, sections } = req.body;

        if (!templateId || !formData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const template = templates[templateId];
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        const { data: subscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('status, plan, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (subError) {
            console.error(subError);
        }

        const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
        const isPro = subscription && subscription.status === 'active' && subscription.plan === 'pro';

        const { data: usageData, error: usageError, count: usageCount } = await supabase
            .from('user_portfolio_usage')
            .select('*', { count: 'exact', head: false })
            .eq('user_id', user.id)
            .eq('template_id', templateId);

        if (usageError) {
            console.error(usageError);
        }

        const templateUsageCount = usageCount || 0;

        const { data: existingPortfolios, error: portfolioError } = await supabase
            .from('portfolios')
            .select('id')
            .eq('user_id', user.id);

        if (portfolioError) {
            console.error(portfolioError);
        }

        const portfolioCount = existingPortfolios?.length || 0;

        // 1 portfolio per user (free and Pro)
        if (portfolioCount >= 1) {
            return res.status(403).json({
                error: 'You already have a portfolio. Delete it first to create a new one.',
                code: 'PORTFOLIO_LIMIT_REACHED'
            });
        }

        // ── Entitlement gate (server-side; the client gate can be bypassed) ──
        // Three tiers, keyed off the template's own flags rather than a hardcoded id list:
        //   • kit templates      → require a template_purchases row (Pro does NOT grant it)
        //   • other pro templates→ require Pro
        //   • everything else    → free
        if (template.kit) {
            const { data: owned, error: ownErr } = await supabase
                .from('template_purchases')
                .select('id')
                .eq('user_id', user.id)
                .eq('template_id', templateId)
                .maybeSingle();
            if (ownErr) {
                console.error('kit ownership check failed:', ownErr);
                return res.status(500).json({ error: 'Could not verify your purchase. Please try again.' });
            }
            if (!owned) {
                return res.status(403).json({
                    error: `The ${template.kitName || 'kit'} is required for this template.`,
                    code: 'KIT_REQUIRED'
                });
            }
        } else if (template.isPro && !isPro) {
            return res.status(403).json({
                error: 'This template requires a Pro subscription.',
                code: 'PRO_TEMPLATE_REQUIRED'
            });
        }

        // Branding removal is a paid perk: Pro members, or anyone who owns a kit. Same
        // rule as update-portfolio so a page's branding doesn't flip on the next save.
        const { count: kitCount } = await supabase
            .from('template_purchases')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);
        const removeBranding = !!isPro || (kitCount || 0) > 0;

        const userName = formData.fullName || 'writer';
        const userEmail = formData.email || '';

        const generateUniqueSlug = async (baseName, userId) => {
        const baseSlug = createSlug(baseName);
        
        const { data: existing } = await supabase
            .from('portfolios')
            .select('slug')
            .eq('user_id', userId)
            .ilike('slug', `${baseSlug}%`)
            .order('slug', { ascending: false })
            .limit(1);
        
        if (!existing || existing.length === 0) {
            return baseSlug;
        }
        
        const existingSlugs = await supabase
            .from('portfolios')
            .select('slug')
            .eq('user_id', userId)
            .ilike('slug', `${baseSlug}%`);
        
        if (!existingSlugs.data || existingSlugs.data.length === 0) {
            return baseSlug;
        }
        
        const numbers = existingSlugs.data
            .map(item => {
            const match = item.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
            return match ? parseInt(match[1]) : 0;
            })
            .filter(num => num > 0);
        
        if (numbers.length === 0) {
            return `${baseSlug}-2`;
        }
        
        const maxNumber = Math.max(...numbers);
        return `${baseSlug}-${maxNumber + 1}`;
        };

        const slug = await generateUniqueSlug(userName, user.id);

        // A brand-new portfolio has no journal yet (journal_enabled defaults to false),
        // so live metrics stay off until the trader turns them on and republishes.
        const finalHTML = template.generateHTML(formData, sections, { slug, journalEnabled: false, metricsCache: null, removeBranding });

        const filePath = `portfolios/${slug}.html`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('portfolios')
            .upload(filePath, finalHTML, {
                contentType: 'text/html',
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            return res.status(500).json({
                error: "Failed to upload portfolio",
                details: uploadError.message
            });
        }

        const { data: urlData } = supabase.storage
            .from('portfolios')
            .getPublicUrl(filePath);

        const { data: portfolio, error: insertError } = await supabase
            .from('portfolios')
            .insert({
                user_id: user.id,
                slug: slug,
                user_name: userName,
                user_email: userEmail,
                template_id: templateId,
                template_fields: template.fields,
                file_path: filePath,
                form_data: formData,
                sections: sections || [],
                deployed_url: `https://porfilr.com/p/${slug}`,
                deployed_at: new Date().toISOString(),
                status: 'active',
            })
            .select()
            .single();

        if (insertError) {
            return res.status(500).json({
                error: 'Failed to create portfolio',
                details: insertError.message
            });
        }

        // Restore trade history on rebuild. A kit's trades belong to the trader, not the
        // page: when a previous kit page was deleted its trades were kept (portfolio_id
        // set to null on delete). Re-point any such orphans of the SAME kit at this new
        // page, so the journal and live track record come back instead of starting empty.
        if (template.kit) {
            const { error: adoptErr } = await supabase
                .from('trades')
                .update({ portfolio_id: portfolio.id })
                .eq('user_id', user.id)
                .eq('template_id', templateId)
                .is('portfolio_id', null);
            if (adoptErr) console.error('trade adoption failed:', adoptErr.message);
        }

        const { error: trackingError } = await supabase
            .from('user_portfolio_usage')
            .insert({
                user_id: user.id,
                template_id: templateId,
                portfolio_slug: slug
            });

        if (trackingError) {
            console.error(trackingError);
        } else {
            console.log('Template usage recorded');
        }

        return res.status(200).json({
            portfolioSlug: portfolio.slug,
            publicUrl: urlData.publicUrl,
            message: 'Portfolio created successfully'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}