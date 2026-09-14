import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/clients
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('id, public_id, name, company_name, avatar_url, industry')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
