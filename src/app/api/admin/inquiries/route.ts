import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAuthed } from "@/lib/auth";

export const runtime = "nodejs";

// GET: logg over innsendte anbud
export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ov_inquiries")
    .select(
      "id, created_at, reg_nr, car_brand, car_model, car_year, user_name, services, workshops_notified"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ inquiries: data ?? [] });
}
