import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function enableCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  enableCORS(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // ✅ Option 1: Count from database (faster, recommended)
    const { count, error } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Database count error:", error);
      // Fallback to storage count if database fails
      return await countFromStorage(res);
    }

    return res.status(200).json({ count: count || 0 });

  } catch (err) {
    console.error("Portfolio count error:", err);
    return res.status(500).json({ error: "Failed to fetch portfolio count" });
  }
}

async function countFromStorage(res) {
  try {
    const { data, error } = await supabase.storage
      .from('portfolios')
      .list('portfolios', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error("Storage count error:", error);
      return res.status(500).json({ error: "Failed to count portfolios" });
    }

    return res.status(200).json({ count: data?.length || 0 });
  } catch (err) {
    console.error("Storage count error:", err);
    return res.status(500).json({ error: "Failed to count portfolios" });
  }
}