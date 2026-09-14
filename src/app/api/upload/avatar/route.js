import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const BUCKET = 'avatars'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file   = formData.get('file')
    const userId = formData.get('userId')
    const role   = formData.get('role') // 'client' | 'influencer'

    // ── Validation ────────────────────────────────────────────
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WEBP, GIF' },
        { status: 400 }
      )
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
    }

    // ── Build storage path ────────────────────────────────────
    const ext       = file.type.split('/')[1].replace('jpeg', 'jpg')
    const timestamp = Date.now()
    const filePath  = `${role}/${userId}/${timestamp}.${ext}`

    // ── Convert File → ArrayBuffer → Buffer ───────────────────
    const arrayBuffer = await file.arrayBuffer()
    const buffer      = Buffer.from(arrayBuffer)

    // ── Upload to Supabase Storage ────────────────────────────
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType:  file.type,
        upsert:       true,
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('[avatar upload] storage error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // ── Get public URL ────────────────────────────────────────
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    const publicUrl = urlData?.publicUrl
    if (!publicUrl) {
      return NextResponse.json({ error: 'Could not get public URL' }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl }, { status: 200 })
  } catch (err) {
    console.error('[avatar upload] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
