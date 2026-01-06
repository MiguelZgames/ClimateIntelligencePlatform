import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing vars in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function listUsers() {
  console.log('\n📋 Fetching registered users...\n');

  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error fetching users:', error.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('   No users found in the database.');
  } else {
    console.log(`   Found ${users.length} user(s):`);
    console.log('   -------------------------------------------------------------------');
    console.log('   | Email                          | Confirmed? | Last Sign In       |');
    console.log('   |--------------------------------|------------|--------------------|');
    users.forEach(u => {
      const confirmed = u.email_confirmed_at ? '✅ Yes' : '❌ No';
      const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never';
      console.log(`   | ${u.email.padEnd(30)} | ${confirmed.padEnd(10)} | ${lastSignIn.padEnd(18)} |`);
    });
    console.log('   -------------------------------------------------------------------');
  }
  console.log('\n');
}

listUsers();
