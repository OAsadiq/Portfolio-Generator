import { createClient } from '@supabase/supabase-js';
import { templates } from './templateConfig.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

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

    console.log('✅ User authenticated:', user.email);

    const { slug, templateId, formData } = req.body;

    if (!slug || !templateId || !formData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify portfolio belongs to user
    const { data: existingPortfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingPortfolio) {
      console.error('Portfolio not found:', fetchError);
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    console.log('✅ Portfolio found:', slug);

    // Get template
    const template = templates[templateId];
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Regenerate HTML
    const finalHTML = template.generateHTML(formData);

    // Upload updated HTML to Supabase Storage
    const filePath = `portfolios/${slug}.html`;

    const { error: uploadError } = await supabase.storage
      .from('portfolios')
      .update(filePath, finalHTML, {
        contentType: 'text/html',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError);
      return res.status(500).json({
        error: 'Failed to upload updated portfolio',
        details: uploadError.message
      });
    }

    console.log('✅ Portfolio HTML updated in storage');

    // Update portfolio record in database
    const { error: updateError } = await supabase
      .from('portfolios')
      .update({
        form_data: formData,
        user_name: formData.fullName || existingPortfolio.user_name,
        user_email: formData.email || existingPortfolio.user_email,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingPortfolio.id);

    if (updateError) {
      console.error('❌ Error updating portfolio:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update portfolio',
        details: updateError.message 
      });
    }

    console.log('✅ Portfolio updated successfully');

    return res.status(200).json({
      message: 'Portfolio updated successfully',
      slug: slug
    });

  } catch (error) {
    console.error('❌ Update portfolio error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}