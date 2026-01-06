import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser since we don't have dotenv installed
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env file not found!');
      process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
    return env;
  } catch (error) {
    console.error('Error loading .env:', error);
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('Please ensure your .env file contains these variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

if (!email || !password) {
  console.log('\nUsage: node scripts/create_user.js <email> <password>');
  console.log('Example: node scripts/create_user.js user@example.com mysecurepass\n');
  process.exit(1);
}

async function createUser() {
  console.log(`\n🚀 Creating confirmed user: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // This bypasses email confirmation!
    user_metadata: {
        role: 'visualizador',
        full_name: email.split('@')[0]
    }
  });

  if (error) {
    console.error('❌ Error creating user:', error.message);
  } else {
    console.log('✅ User created successfully!');
    console.log('   ID:', data.user.id);
    console.log('   Email:', data.user.email);
    console.log('   Status: Confirmed (Ready to Login)\n');
  }
}

createUser();
