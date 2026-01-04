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
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_]+/g, '-')   // Replace spaces with hyphens
        .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

export default async function handler(req, res) {
    // Set CORS headers
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
        // Get auth token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth error:', authError);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('✅ User authenticated:', user.email, 'ID:', user.id);

        const { templateId, formData } = req.body;

        if (!templateId || !formData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const template = templates[templateId];
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        // Check if user has Pro subscription
        const { data: subscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('status, plan, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (subError) {
            console.error('Error checking subscription:', subError);
        }

        const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
        const isPro = subscription && subscription.status === 'active' && subscription.plan === 'pro';
        console.log('User Pro status:', isPro);

        // Count how many times user has used this template
        const { data: usageData, error: usageError, count: usageCount } = await supabase
            .from('user_portfolio_usage')
            .select('*', { count: 'exact', head: false })
            .eq('user_id', user.id)
            .eq('template_id', templateId);

        if (usageError) {
            console.error('Error checking template usage:', usageError);
        }

        const templateUsageCount = usageCount || 0;
        console.log(`User has used template "${templateId}" ${templateUsageCount} time(s)`);

        // Get total portfolio count
        const { data: existingPortfolios, error: portfolioError } = await supabase
            .from('portfolios')
            .select('id')
            .eq('user_id', user.id);

        if (portfolioError) {
            console.error('Error checking portfolios:', portfolioError);
        }

        const portfolioCount = existingPortfolios?.length || 0;
        console.log('Total portfolios:', portfolioCount);

        // FREE USERS: Only allow 1 use of minimal-template
        if (!isPro) {
            // Check if they're trying to use minimal-template and already used it
            if (templateId === 'minimal-template' && templateUsageCount > 0) {
                console.log(`❌ Free user already used minimal-template ${templateUsageCount} time(s)`);
                return res.status(403).json({
                    error: "You've already used your free template. Upgrade to Pro for unlimited portfolios!",
                    code: 'FREE_TEMPLATE_LIMIT_REACHED'
                });
            }

            // Free users can only use minimal-template
            if (templateId !== 'minimal-template') {
                console.log('❌ Free user tried to use pro template');
                return res.status(403).json({
                    error: 'This template requires a Pro subscription. Upgrade to unlock all templates!',
                    code: 'PRO_TEMPLATE_REQUIRED'
                });
            }
        }

        // PRO USERS: No limits, can use any template
        console.log('✅ User can create portfolio');

        const userName = formData.fullName || 'writer';
        const userEmail = formData.email || '';
        const baseSlug = createSlug(userName);

        // Add unique timestamp to ensure uniqueness
        const timestamp = Date.now();
        const slug = `${baseSlug}-${timestamp}`;

        console.log('📝 Creating portfolio with slug:', slug);

        // ✅ Generate portfolio HTML
        const finalHTML = template.generateHTML(formData);

        // ✅ Upload to Supabase Storage
        const filePath = `portfolios/${slug}.html`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('portfolios')
            .upload(filePath, finalHTML, {
                contentType: 'text/html',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error("❌ Supabase upload error:", uploadError);
            return res.status(500).json({
                error: "Failed to upload portfolio",
                details: uploadError.message
            });
        }

        console.log('✅ Portfolio HTML uploaded to storage');

        // ✅ Get public URL
        const { data: urlData } = supabase.storage
            .from('portfolios')
            .getPublicUrl(filePath);

        console.log('💾 Saving portfolio to database...');

        // ✅ Save portfolio to database WITH user_id
        const { data: portfolio, error: insertError } = await supabase
            .from('portfolios')
            .insert({
                user_id: user.id,           // ✅ ADDED THIS!
                slug: slug,
                user_name: userName,
                user_email: userEmail,
                template_id: templateId,
                file_path: filePath,
                form_data: formData,        // ✅ Also saving form data
                status: 'active',
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Error creating portfolio:', insertError);
            return res.status(500).json({ 
                error: 'Failed to create portfolio',
                details: insertError.message 
            });
        }

        console.log('✅ Portfolio created successfully:', portfolio.slug);
        console.log('✅ User ID saved:', portfolio.user_id);

        // ✅ Track template usage
        console.log('📊 Recording template usage...');
        const { error: trackingError } = await supabase
            .from('user_portfolio_usage')
            .insert({
                user_id: user.id,
                template_id: templateId,
                portfolio_slug: slug
            });

        if (trackingError) {
            console.error('⚠️ Error recording template usage:', trackingError);
            // Don't fail the request if usage tracking fails
        } else {
            console.log('✅ Template usage recorded');
        }

        return res.status(200).json({
            portfolioSlug: portfolio.slug,
            publicUrl: urlData.publicUrl,
            message: 'Portfolio created successfully'
        });

    } catch (error) {
        console.error('❌ Create portfolio error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}