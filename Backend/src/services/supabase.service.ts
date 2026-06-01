import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service role client bypasses Row Level Security.
// Use this carefully on the backend to interact with the DB.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'copilot_money'
  }
});
