import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/proposals?campaign_id=xxx or ?influencer_id=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const campaign_id = searchParams.get('campaign_id')
  const influencer_id = searchParams.get('influencer_id')

  let query = supabaseAdmin
    .from('proposals')
    .select('*, influencers(id, public_id, name, avatar_url), campaigns(id, title, campaign_no)')
    .order('created_at', { ascending: false })

  if (campaign_id) query = query.eq('campaign_id', campaign_id)
  if (influencer_id) query = query.eq('influencer_id', influencer_id)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/proposals — submit a proposal
export async function POST(request) {
  const body = await request.json()
  const { campaign_id, influencer_id, budget, delivery_days, cover_letter } = body

  if (!campaign_id || !influencer_id || !budget) {
    return NextResponse.json({ error: 'campaign_id, influencer_id and budget are required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('proposals')
    .insert({ campaign_id, influencer_id, budget, delivery_days, cover_letter })
    .select()
    .single()

  if (error) {
    // Unique constraint violation — already applied
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already submitted a proposal for this campaign' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
