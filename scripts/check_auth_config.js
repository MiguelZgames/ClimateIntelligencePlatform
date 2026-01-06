import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) return {};
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) env[key.trim()] = value.trim();
    });
    return env;
  } catch (error) { return {}; }
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL;
const ANON_KEY = env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

// Use ANON KEY to simulate a real frontend user
const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function checkAuthConfig() {
  console.log('\n🔍 Verifying Supabase Auth Configuration...\n');

  const testEmail = `test_config_${Date.now()}@example.com`;
  const testPassword = 'testpassword123';

  console.log(`Attempting registration with: ${testEmail}`);

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    console.error('❌ Registration Failed:', error.message);
    return;
  }

  console.log('---------------------------------------------------');
  if (data.session) {
    console.log('✅ SUCCESS: Email Confirmation is DISABLED.');
    console.log('   A valid session was returned immediately.');
    console.log('   New users can access the dashboard instantly.');
  } else if (data.user && !data.session) {
    console.log('⚠️  WARNING: Email Confirmation is ENABLED.');
    console.log('   User was created, but no session was returned.');
    console.log('   The user must verify their email before logging in.');
    console.log('\n   ACTION REQUIRED:');
    console.log('   1. Go to Supabase Dashboard > Authentication > Providers > Email');
    console.log('   2. DISABLE "Confirm email"');
    console.log('   3. Save settings and run this script again.');
  }
  console.log('---------------------------------------------------\n');
}

checkAuthConfig();
