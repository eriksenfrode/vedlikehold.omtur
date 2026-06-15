import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

// GET: liste over tjenestekategorier (for skjemaet)
export async function GET() {
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
