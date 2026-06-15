import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";

function guard() {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  }
  return null;
}

// GET: alle merker
export async function GET() {
  const denied = guard();
  if (denied) return denied;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ov_brands")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ brands: data ?? [] });
}

// POST: legg til merke
export async function POST(req: Request) {
  const denied = guard();
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Mangler navn" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ov_brands")
    .insert({ name })
    .select("id, name")
    .single();

  if (error) {
    // Trolig unik-konflikt
    return NextResponse.json(
      { error: "Merket finnes allerede eller kunne ikke legges til." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, brand: data });
}

// DELETE: slett merke (?id=...)
export async function DELETE(req: Request) {
  const denied = guard();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Mangler id" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("ov_brands").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
