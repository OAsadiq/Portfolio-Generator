import { createClient } from '@supabase/supabase-js';
import { templates } from "./templateConfig.js";

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
            console.error('Auth error:', authError);
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

        if (!isPro) {
            if (templateId === 'minimal-template' && templateUsageCount > 0) {
                return res.status(403).json({
                    error: "You've already used your free template. Upgrade to Pro for unlimited portfolios!",
                    code: 'FREE_TEMPLATE_LIMIT_REACHED'
                });
            }

            if (templateId !== 'minimal-template') {
                return res.status(403).json({
                    error: 'This template requires a Pro subscription. Upgrade to unlock all templates!',
                    code: 'PRO_TEMPLATE_REQUIRED'
                });
            }
        }

        const userName = formData.fullName || 'writer';
        const userEmail = formData.email || '';
        const baseSlug = createSlug(userName);

        const timestamp = Date.now();
        const slug = `${baseSlug}-${timestamp}`;

        // Pass sections to generateHTML if your template supports it
        const finalHTML = template.generateHTML(formData, sections);

        const filePath = `portfolios/${slug}.html`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('portfolios')
            .upload(filePath, finalHTML, {
                contentType: 'text/html',
                cacheControl: '3600',
                upsert: false
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

        // USE SECTIONS FROM REQ.BODY OR DEFAULT TO EMPTY ARRAY
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
                sections: sections || [], // Use sections from request or empty array
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