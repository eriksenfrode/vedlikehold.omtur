import { NextResponse } from "next/server";
import { lookupVegvesen, normalizeRegNr } from "@/lib/vegvesen";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const regnr = searchParams.get("regnr");

  if (!regnr || normalizeRegNr(regnr).length < 2) {
    return NextResponse.json(
      { error: "Mangler gyldig reg.nr" },
      { status: 400 }
    );
  }

  try {
    const result = await lookupVegvesen(regnr);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Lookup-feil:", err);
    return NextResponse.json(
      { error: "Klarte ikke hente kjøretøydata akkurat nå." },
      { status: 502 }
    );
  }
}
