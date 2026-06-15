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

// GET: alle tjenestekategorier
export async function GET() {
  const denied = guard();
  if (denied) return denied;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ov_services")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ services: data ?? [] });
}

// POST: legg til eller oppdater tjenestekategori (navn og/eller sortering)
export async function POST(req: Request) {
  const denied = guard();
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const id: string | undefined = body.id;
  const name = (body.name ?? "").trim();
  const sortOrder = Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 0;

  const supabase = getServiceClient();

  if (id) {
    const update: Record<string, unknown> = { sort_order: sortOrder };
    if (name) update.name = name;

    const { error } = await supabase
      .from("ov_services")
      .update(update)
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Klarte ikke oppdatere tjenesten." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (!name) {
    return NextResponse.json({ error: "Mangler navn" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ov_services")
    .insert({ name, sort_order: sortOrder })
    .select("id, name, sort_order")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Tjenesten finnes allerede eller kunne ikke legges til." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, service: data });
}

// DELETE: slett tjenestekategori (?id=...)
export async function DELETE(req: Request) {
  const denied = guard();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Mangler id" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("ov_services").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
