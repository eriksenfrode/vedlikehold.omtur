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

// GET: alle verksteder med tilknyttede merker (valgfritt by-filter)
export async function GET(req: Request) {
  const denied = guard();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  const supabase = getServiceClient();
  let query = supabase
    .from("ov_workshops")
    .select(
      "id, name, email, city, active, created_at, ov_workshop_brands(brand_id), ov_workshop_services(service_id)"
    )
    .order("created_at", { ascending: true });

  if (city) query = query.eq("city", city);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const workshops = (data ?? []).map((w: any) => ({
    id: w.id,
    name: w.name,
    email: w.email,
    city: w.city,
    active: w.active,
    created_at: w.created_at,
    brandIds: (w.ov_workshop_brands ?? []).map((b: any) => b.brand_id),
    serviceIds: (w.ov_workshop_services ?? []).map((s: any) => s.service_id),
  }));

  return NextResponse.json({ workshops });
}

// POST: opprett eller oppdater verksted (inkl. merker)
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
  const email = (body.email ?? "").trim();
  const city = (body.city ?? "rana").trim();
  const active = body.active !== false;
  const brandIds: string[] = Array.isArray(body.brandIds) ? body.brandIds : [];
  const serviceIds: string[] = Array.isArray(body.serviceIds)
    ? body.serviceIds
    : [];
  const id: string | undefined = body.id;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Navn og e-post er påkrevd." },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  let workshopId = id;

  if (id) {
    const { error } = await supabase
      .from("ov_workshops")
      .update({ name, email, city, active })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { data, error } = await supabase
      .from("ov_workshops")
      .insert({ name, email, city, active })
      .select("id")
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Klarte ikke opprette verksted" },
        { status: 500 }
      );
    }
    workshopId = data.id;
  }

  // Synkroniser merker: slett eksisterende og sett inn nye
  await supabase
    .from("ov_workshop_brands")
    .delete()
    .eq("workshop_id", workshopId);

  if (brandIds.length > 0) {
    const rows = brandIds.map((brand_id) => ({
      workshop_id: workshopId,
      brand_id,
    }));
    const { error } = await supabase.from("ov_workshop_brands").insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Synkroniser tjenester: slett eksisterende og sett inn nye
  await supabase
    .from("ov_workshop_services")
    .delete()
    .eq("workshop_id", workshopId);

  if (serviceIds.length > 0) {
    const rows = serviceIds.map((service_id) => ({
      workshop_id: workshopId,
      service_id,
    }));
    const { error } = await supabase.from("ov_workshop_services").insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, id: workshopId });
}

// DELETE: slett verksted (?id=...)
export async function DELETE(req: Request) {
  const denied = guard();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Mangler id" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("ov_workshops").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
