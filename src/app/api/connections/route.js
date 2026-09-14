import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/connections?influencer_id=xxx or ?client_id=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const influencer_id = searchParams.get('influencer_id')
  const client_id = searchParams.get('client_id')

  let query = supabaseAdmin
    .from('connections')
    .select('*, influencers(id, public_id, name, avatar_url), clients(id, public_id, name, company_name, avatar_url)')
    .order('created_at', { ascending: false })

  if (influencer_id) query = query.eq('influencer_id', influencer_id)
  if (client_id) query = query.eq('client_id', client_id)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/connections — create a connection request
export async function POST(request) {
  const body = await request.json()
  const { influencer_id, client_id } = body

  if (!influencer_id || !client_id) {
    return NextResponse.json({ error: 'influencer_id and client_id are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('connections')
    .insert({ influencer_id, client_id, status: 'pending' })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Connection already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
