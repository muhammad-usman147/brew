import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/influencers/:id — get influencer profile with portfolios
export async function GET(request, { params }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('influencers')
    .select('id, public_id, name, avatar_url, bio, portfolios(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

// PATCH /api/influencers/:id — update profile
export async function PATCH(request, { params }) {
  const { id } = await params
  const body = await request.json()
  // Remove sensitive fields that shouldn't be updated via this route
  const { id: _id, email, created_at, ...updateData } = body

  const { data, error } = await supabaseAdmin
    .from('influencers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
