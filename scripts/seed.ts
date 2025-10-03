import { createClient } from '@supabase/supabase-js';

/**
 * Seed script
 * - Creates demo user (demo@reclaim.com / demo123)
 * - Inserts today's usage logs
 * - Calls /api/generate-insights for this user
 *
 * Env required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE (for admin user creation)
 * - SEED_BASE_URL (optional; e.g. http://localhost:3000). Fallbacks to VERCEL_URL or http://localhost:3000
 */

async function main() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE as string;

  if (!SUPABASE_URL || !SUPABASE_ANON || !SUPABASE_SERVICE_ROLE) {
    throw new Error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE');
  }

  const anon = createClient(SUPABASE_URL, SUPABASE_ANON);
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  const email = 'demo@reclaim.com';
  const password = 'demo123';
  const today = new Date().toISOString().split('T')[0];

  console.log('Seeding demo user and data...');

  // 1) Ensure user exists and get session token
  let userId: string | null = null;
  let accessToken: string | null = null;

  // Try sign in first (user may already exist)
  const signInRes = await anon.auth.signInWithPassword({ email, password }).catch(() => null);
  if (signInRes && signInRes.data?.user && signInRes.data?.session) {
    userId = signInRes.data.user.id;
    accessToken = signInRes.data.session.access_token;
    console.log('User exists, signed in.');
  } else {
    console.log('User not found, creating via admin...');
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) throw new Error(`admin.createUser failed: ${createErr.message}`);
    userId = created.user?.id ?? null;

    if (!userId) throw new Error('User creation returned no user id');

    // Sign in to get a session token
    const { data: login, error: loginErr } = await anon.auth.signInWithPassword({ email, password });
    if (loginErr || !login?.session) {
      throw new Error(`Sign-in after create failed: ${loginErr?.message}`);
    }
    accessToken = login.session.access_token;
    console.log('User created and signed in.');
  }

  if (!userId || !accessToken) throw new Error('Failed to obtain user session.');

  // 2) Ensure users profile row exists (optional)
  await anon
    .from('users')
    .upsert({ id: userId, email })
    .eq('id', userId);

  // 3) Upsert usage for today (generic app names)
  const apps = [
    { name: 'Social Media App', minutes: 180 },
    { name: 'Video Platform', minutes: 120 },
    { name: 'Productivity App', minutes: 60 },
  ];

  const { error: usageErr } = await anon
    .from('usage_logs')
    .upsert(
      {
        user_id: userId,
        date: today,
        apps,
      },
      { onConflict: 'user_id,date' }
    );
  if (usageErr) throw new Error(`Upsert usage_logs failed: ${usageErr.message}`);
  console.log('Inserted usage logs for today.');

  // 4) Call /api/generate-insights with Bearer token
  const baseUrl = (() => {
    const envBase = process.env.SEED_BASE_URL;
    if (envBase) return envBase.replace(/\/$/, '');
    const vercelUrl = process.env.VERCEL_URL; // e.g. my-app.vercel.app
    if (vercelUrl) return `https://${vercelUrl}`;
    return 'http://localhost:3000';
  })();

  const resp = await fetch(`${baseUrl}/api/generate-insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`/api/generate-insights failed: ${resp.status} ${text}`);
  }

  const json = await resp.json();
  console.log('Generated insights:', JSON.stringify(json, null, 2));

  console.log('Seed completed successfully.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
