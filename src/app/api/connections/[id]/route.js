import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/connections/:id — accept/block a connection
export async function PATCH(request, { params }) {
  const { id } = await params
  const body = await request.json()
  const { status } = body

  const validStatuses = ['pending', 'active', 'blocked']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('connections')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
