import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/clients/:id
export async function GET(request, { params }) {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('id, public_id, name, company_name, avatar_url, website, industry, description')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

// PATCH /api/clients/:id
export async function PATCH(request, { params }) {
  const body = await request.json()
  const { id, email, created_at, ...updateData } = body

  const { data, error } = await supabaseAdmin
    .from('clients')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
