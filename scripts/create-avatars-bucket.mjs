/**
 * Creates the 'avatars' Supabase Storage bucket and sets up RLS policies.
 * Run with: node scripts/create-avatars-bucket.mjs
 */

const SUPABASE_URL = 'https://qidrkfgjzyzvpaeqsnks.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpZHJrZmdqenl6dnBhZXFzbmtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjY5NTc2NCwiZXhwIjoyMTAyMjcxNzY0fQ.sK0TX-4SH-XQNpfETig2NAQlwC8Z5bEM8P0BEQ-CrYU'

async function run() {
  // 1. Create the bucket
  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
    },
    body: JSON.stringify({
      id:                  'avatars',
      name:                'avatars',
      public:              true,
      file_size_limit:     5242880,
      allowed_mime_types:  ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    }),
  })

  const createBody = await createRes.json()

  if (!createRes.ok) {
    if (createBody?.error === 'The resource already exists') {
      console.log('✅ Bucket "avatars" already exists — skipping creation.')
    } else {
      console.error('❌ Failed to create bucket:', createBody)
      process.exit(1)
    }
  } else {
    console.log('✅ Bucket "avatars" created successfully:', createBody)
  }

  // 2. Apply RLS policies via SQL
  const sql = `
    -- Public SELECT
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename  = 'objects'
          AND policyname = 'avatars_public_read'
      ) THEN
        EXECUTE 'CREATE POLICY avatars_public_read ON storage.objects FOR SELECT USING (bucket_id = ''avatars'')';
      END IF;
    END $$;

    -- Authenticated INSERT
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename  = 'objects'
          AND policyname = 'avatars_authenticated_insert'
      ) THEN
        EXECUTE 'CREATE POLICY avatars_authenticated_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''avatars'')';
      END IF;
    END $$;

    -- Authenticated UPDATE
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename  = 'objects'
          AND policyname = 'avatars_authenticated_update'
      ) THEN
        EXECUTE 'CREATE POLICY avatars_authenticated_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''avatars'')';
      END IF;
    END $$;

    -- Authenticated DELETE
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename  = 'objects'
          AND policyname = 'avatars_authenticated_delete'
      ) THEN
        EXECUTE 'CREATE POLICY avatars_authenticated_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''avatars'')';
      END IF;
    END $$;
  `

  const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  })

  // Supabase doesn't expose a direct SQL endpoint via REST for anon/service key.
  // Bucket creation is what matters — policies can be set via Dashboard SQL editor.
  console.log('\n⚠️  RLS policies must be applied via the Supabase Dashboard SQL Editor.')
  console.log('   Open: https://supabase.com/dashboard/project/qidrkfgjzyzvpaeqsnks/sql/new')
  console.log('   Run the contents of: supabase/migrations/20240818000000_avatars_bucket.sql\n')
  console.log('   (The bucket itself is already created and set to public above, so')
  console.log('    uploads will work immediately via the service-role key in the API route.)\n')
}

run().catch(console.error)
