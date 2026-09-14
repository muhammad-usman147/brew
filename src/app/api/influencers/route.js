import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/influencers — search/list influencers
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  let query = supabaseAdmin
    .from('influencers')
    .select('id, public_id, name, avatar_url, bio')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
