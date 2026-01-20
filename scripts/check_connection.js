import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env');
  process.exit(1);
}

console.log('Testing connection with SERVICE ROLE key (Bypasses RLS)...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // 1. Try to fetch users (usually restricted)
    const { data: users, error: userError } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (userError) {
      console.error('❌ Service Role Error accessing users:', userError.message);
    } else {
      console.log('✅ Connection Successful! Users count:', users);
    }

    // 2. Try to fetch predictions
    const { data: predictions, error: predError } = await supabase.from('predictions').select('*').limit(1);
    
    if (predError) {
      console.error('❌ Service Role Error accessing predictions:', predError.message);
    } else {
      console.log('✅ Predictions table accessible. Rows found:', predictions.length);
      if (predictions.length > 0) {
        console.log('Sample prediction:', predictions[0].city);
      } else {
        console.log('Note: Predictions table is empty.');
      }
    }

    console.log('\n--- DIAGNOSIS ---');
    console.log('If you see ✅ above, your database is WORKING and data exists.');
    console.log('The errors in your browser are strictly due to the Security Policies (RLS) loop.');
    console.log('You MUST run the SQL fix in the Supabase Dashboard to unblock the frontend.');

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
