import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/campaigns/:id
export async function GET(request, { params }) {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*, clients(id, public_id, name, company_name, avatar_url)')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

// PATCH /api/campaigns/:id — update campaign
export async function PATCH(request, { params }) {
  const body = await request.json()

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/campaigns/:id
export async function DELETE(request, { params }) {
  const { error } = await supabaseAdmin
    .from('campaigns')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Campaign deleted' })
}
