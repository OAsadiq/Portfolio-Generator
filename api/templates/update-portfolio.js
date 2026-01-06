// api/templates/update-portfolio.js
import { createClient } from '@supabase/supabase-js';
import { templates } from "./templateConfig.js";

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
    const { slug, templateId, formData } = req.body;

    console.log('📝 Update request:', { slug, templateId, formDataKeys: Object.keys(formData) });
    
    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', user.id)
      .single();

    if (portfolioError || !portfolio) {
      console.error('❌ Portfolio error:', portfolioError);
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    console.log('✅ Portfolio found:', portfolio.slug);

    // Get the template
    const template = templates[templateId];
    if (!template) {
      console.error('❌ Template not found:', templateId);
      return res.status(404).json({ error: "Template not found" });
    }

    console.log('✅ Template found:', template.name);

    // Generate new HTML
    const generatedHtml = template.generateHTML(formData);
    console.log('✅ HTML generated, length:', generatedHtml.length);

    // Update storage file
    const filePath = `portfolios/${slug}.html`;
    
    console.log('📤 Uploading to storage:', filePath);
    
    // First try to remove old file
    try {
      await supabase.storage
        .from('portfolios')
        .remove([filePath]);
      console.log('🗑️ Old file removed');
    } catch (removeErr) {
      console.log('⚠️ No old file to remove (or error):', removeErr);
    }

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('portfolios')
      .upload(filePath, generatedHtml, {
        contentType: 'text/html',
        cacheControl: '3600',
        upsert: true // Important: allows overwriting
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to update portfolio file',
        details: uploadError.message 
      });
    }

    console.log('✅ Storage updated successfully');

    // Update database - PRESERVE template_fields
    const { error: updateError } = await supabase
      .from('portfolios')
      .update({
        form_data: formData,
        user_name: formData.fullName || portfolio.user_name,
        user_email: formData.email || portfolio.user_email,
        // ✅ DO NOT modify template_fields - keep existing
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      throw updateError;
    }

    console.log('✅ Database updated successfully');

    return res.status(200).json({ 
      success: true,
      message: 'Portfolio updated successfully',
      slug: slug
    });

  } catch (error) {
    console.error('❌ Update portfolio error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to update portfolio',
      details: error.toString()
    });
  }
}