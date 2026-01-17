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

    // Generate HTML with both formData and sections
    const generatedHtml = template.generateHTML(formData, sections);

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

    // Update database with formData AND sections
    const { error: updateError } = await supabase
      .from('portfolios')
      .update({
        form_data: formData,
        sections: sections, // Add sections to database
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