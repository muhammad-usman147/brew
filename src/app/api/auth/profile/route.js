import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function buildPublicId(prefix) {
  const segment = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now()}-${segment}`;
}

function isNoRowsError(error) {
  return error?.code === "PGRST116";
}

function isMissingColumnError(error) {
  return (
    typeof error?.message === "string" &&
    error.message.includes("column") &&
    error.message.includes("does not exist")
  );
}

async function selectProfileByRole(role, email) {
  const table = role === "client" ? "clients" : "influencers";
  const columns =
    role === "client"
      ? "id, public_id, name, company_name, avatar_url, industry, email"
      : "id, public_id, name, avatar_url, bio, email";

  const { data, error } = await supabaseAdmin
    .from(table)
    .select(columns)
    .eq("email", email)
    .maybeSingle();

  if (error) return { error };
  return { data };
}

async function insertProfile(role, payload) {
  const table = role === "client" ? "clients" : "influencers";

  const insertResult = await supabaseAdmin
    .from(table)
    .insert(payload)
    .select()
    .single();

  if (!insertResult.error) return insertResult;

  // Support schemas where auth_user_id has not been added yet.
  if (payload.auth_user_id && isMissingColumnError(insertResult.error)) {
    const { auth_user_id, ...fallbackPayload } = payload;
    return supabaseAdmin.from(table).insert(fallbackPayload).select().single();
  }

  return insertResult;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = normalizeEmail(searchParams.get("email"));

  if (!email) {
    return NextResponse.json(
      { error: "email query param is required" },
      { status: 400 },
    );
  }

  const clientResult = await selectProfileByRole("client", email);
  if (clientResult.error && !isNoRowsError(clientResult.error)) {
    return NextResponse.json(
      { error: clientResult.error.message },
      { status: 500 },
    );
  }
  if (clientResult.data) {
    return NextResponse.json({ role: "client", profile: clientResult.data });
  }

  const influencerResult = await selectProfileByRole("influencer", email);
  if (influencerResult.error && !isNoRowsError(influencerResult.error)) {
    return NextResponse.json(
      { error: influencerResult.error.message },
      { status: 500 },
    );
  }
  if (influencerResult.data) {
    return NextResponse.json({
      role: "influencer",
      profile: influencerResult.data,
    });
  }

  return NextResponse.json({ role: null, profile: null }, { status: 404 });
}

export async function POST(request) {
  const body = await request.json();
  const role =
    body?.role === "client"
      ? "client"
      : body?.role === "influencer"
        ? "influencer"
        : null;
  const email = normalizeEmail(body?.email);
  const name = String(body?.name || "").trim();

  if (!role || !email || !name) {
    return NextResponse.json(
      { error: "role, email, and name are required" },
      { status: 400 },
    );
  }

  const existing = await selectProfileByRole(role, email);
  if (existing.error && !isNoRowsError(existing.error)) {
    return NextResponse.json(
      { error: existing.error.message },
      { status: 500 },
    );
  }

  if (existing.data) {
    return NextResponse.json({ data: existing.data, existing: true });
  }

  const basePayload = {
    email,
    name,
    public_id: role === "client" ? buildPublicId("CLT") : buildPublicId("INF"),
  };

  const rolePayload =
    role === "client"
      ? {
          company_name: String(body?.company_name || "").trim() || null,
          website: String(body?.website || "").trim() || null,
          industry: String(body?.industry || "").trim() || null,
          description: String(body?.description || "").trim() || null,
        }
      : {
          phone: String(body?.phone || "").trim() || null,
          bio: String(body?.bio || "").trim() || null,
        };

  const payload = {
    ...basePayload,
    ...rolePayload,
  };

  const authUserId = String(body?.auth_user_id || "").trim();
  if (authUserId) {
    payload.auth_user_id = authUserId;
  }

  const { data, error } = await insertProfile(role, payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
