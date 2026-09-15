import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/campaigns
// ?type=public|private|draft|all
// ?client_id=xxx  (filter by client)
// ?category=xxx   (filter by category)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type      = searchParams.get('type')
  const client_id = searchParams.get('client_id')
  const category  = searchParams.get('category')

  let query = supabaseAdmin
    .from('campaigns')
    .select('*, clients(id, public_id, name, company_name, avatar_url)')
    .order('created_at', { ascending: false })

  // filter by type unless 'all'
  if (type && type !== 'all') query = query.eq('type', type)

  // filter by client
  if (client_id) query = query.eq('client_id', client_id)

  // filter by category
  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/campaigns
export async function POST(request) {
  const body = await request.json()
  const { client_id, title, description, budget, type, category, location, min_followers } = body

  if (!client_id || !title) {
    return NextResponse.json({ error: 'client_id and title are required' }, { status: 400 })
  }

  const campaign_no = `BREW-${Date.now()}`

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .insert({ client_id, campaign_no, title, description, budget, type: type || 'draft', category, location, min_followers })
    .select('*, clients(id, public_id, name, company_name, avatar_url)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
