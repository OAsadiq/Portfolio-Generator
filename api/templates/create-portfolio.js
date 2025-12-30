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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Helper function to create URL-safe slug from name
function createSlug(fullName) {
  return fullName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-')   // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
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
    const { templateId, formData } = req.body;

    if (!templateId || !formData) {
      return res.status(400).json({ error: "Missing template or form data" });
    }

    const template = templates[templateId];
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // ✅ Create slug from user's name
    const userName = formData.fullName || 'writer';
    const userEmail = formData.email || '';
    const baseSlug = createSlug(userName);
    
    // Add unique timestamp to ensure uniqueness
    const timestamp = Date.now();
    const slug = `${baseSlug}-${timestamp}`;

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
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ 
        error: "Failed to upload portfolio",
        details: uploadError.message 
      });
    }

    // ✅ Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolios')
      .getPublicUrl(filePath);

    // ✅ Store portfolio metadata in database (optional but recommended)
    try {
      const { error: dbError } = await supabase
        .from('portfolios')
        .insert({
          slug: slug,
          user_name: userName,
          user_email: userEmail,
          template_id: templateId,
          file_path: filePath,
        });

      if (dbError) {
        console.error("Database insert error:", dbError);
        // Don't fail the request if DB insert fails
      }
    } catch (dbErr) {
      console.error("Database error:", dbErr);
      // Continue even if DB fails
    }

    // ✅ Return URLs
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