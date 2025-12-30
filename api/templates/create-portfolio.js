// api/templates/create-portfolio.js - Updated with Auth
import { createClient } from '@supabase/supabase-js';
import { templates } from "./templateConfig.js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// Helper function to create URL-safe slug from name
function createSlug(fullName) {
  return fullName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to get user from Authorization header
async function getUserFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export default async function handler(req, res) {
  enableCORS(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user from token
    const user = await getUserFromToken(req.headers.authorization);
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { templateId, formData } = req.body;

    if (!templateId || !formData) {
      return res.status(400).json({ error: "Missing template or form data" });
    }

    // Check if it's the free template
    if (templateId === 'minimal-template') {
      // Check if user has already used their free template
      const { data: existingUsage, error: usageCheckError } = await supabase
        .from('user_portfolio_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('template_id', templateId)
        .single();

      if (usageCheckError && usageCheckError.code !== 'PGRST116') {
        console.error("Error checking usage:", usageCheckError);
        return res.status(500).json({ error: "Failed to check template usage" });
      }

      if (existingUsage) {
        return res.status(403).json({ 
          error: "You have already used your free template. Please upgrade to Pro for unlimited portfolios.",
          code: "FREE_TEMPLATE_LIMIT_REACHED"
        });
      }
    }

    const template = templates[templateId];
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Create slug from user's name
    const userName = formData.fullName || user.user_metadata?.full_name || 'writer';
    const userEmail = formData.email || user.email || '';
    const baseSlug = createSlug(userName);
    
    // Add unique timestamp to ensure uniqueness
    const timestamp = Date.now();
    const slug = `${baseSlug}-${timestamp}`;

    // Generate portfolio HTML
    const finalHTML = template.generateHTML(formData);

    // Upload to Supabase Storage
    const filePath = `portfolios/${slug}.html`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolios')
      .upload(filePath, finalHTML, {
        contentType: 'text/html',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ 
        error: "Failed to upload portfolio",
        details: uploadError.message 
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolios')
      .getPublicUrl(filePath);

    // Store portfolio metadata in database with user_id
    try {
      const { error: dbError } = await supabase
        .from('portfolios')
        .insert({
          slug: slug,
          user_id: user.id,
          user_name: userName,
          user_email: userEmail,
          template_id: templateId,
          file_path: filePath,
        });

      if (dbError) {
        console.error("Database insert error:", dbError);
      }

      // Record template usage (only for free template)
      if (templateId === 'minimal-template') {
        const { error: usageError } = await supabase
          .from('user_portfolio_usage')
          .insert({
            user_id: user.id,
            template_id: templateId,
            portfolio_slug: slug,
          });

        if (usageError) {
          console.error("Usage tracking error:", usageError);
          // Don't fail the request if usage tracking fails
        }
      }
    } catch (dbErr) {
      console.error("Database error:", dbErr);
      // Continue even if DB fails
    }

    // Return URLs
    const customUrl = `https://${slug}-foliobase.vercel.app`;

    return res.status(200).json({
      portfolioSlug: slug,
      publicUrl: urlData.publicUrl,
      customUrl: customUrl,
      message: "Portfolio generated successfully"
    });

  } catch (err) {
    console.error("Portfolio generation error:", err);
    return res.status(500).json({ 
      error: "Failed to generate portfolio",
      details: err.message 
    });
  }
}