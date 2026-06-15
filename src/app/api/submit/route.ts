import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sendInquiryEmails } from "@/lib/email";
import { normalizeRegNr } from "@/lib/vegvesen";

export const runtime = "nodejs";

type SubmitBody = {
  userName?: string;
  userEmail?: string;
  regNr?: string;
  brand?: string | null;
  model?: string | null;
  year?: string | null;
  carInfo?: unknown;
  description?: string;
  services?: string[];
  city?: string;
};

export async function POST(req: Request) {
  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const userName = body.userName?.trim();
  const userEmail = body.userEmail?.trim();
  const regNr = body.regNr ? normalizeRegNr(body.regNr) : "";
  const description = body.description?.trim() || "";
  const services = Array.isArray(body.services)
    ? body.services.map((s) => s.trim()).filter(Boolean)
    : [];
  const brand = body.brand?.trim() || null;
  const city = (body.city || "rana").trim();

  if (!userName || !userEmail || !regNr || (!description && services.length === 0)) {
    return NextResponse.json(
      { error: "Fyll inn navn, e-post, reg.nr og hva bilen trenger hjelp med." },
      { status: 400 }
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(userEmail)) {
    return NextResponse.json(
      { error: "Ugyldig e-postadresse." },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  // 1) Finn brand_id om merket er kjent
  let brandId: string | null = null;
  if (brand) {
    const { data: brandRow } = await supabase
      .from("ov_brands")
      .select("id")
      .ilike("name", brand)
      .maybeSingle();
    brandId = brandRow?.id ?? null;
  }

  // 1b) Finn service-id-er for tjenestene brukeren krysset av
  let serviceIds: string[] = [];
  if (services.length > 0) {
    const { data: serviceRows } = await supabase
      .from("ov_services")
      .select("id, name")
      .in("name", services);
    serviceIds = (serviceRows ?? []).map((s) => s.id);
  }

  // 2) Hent alle aktive verksteder i byen
  const { data: workshops, error: wErr } = await supabase
    .from("ov_workshops")
    .select(
      "id, name, email, ov_workshop_brands(brand_id), ov_workshop_services(service_id)"
    )
    .eq("active", true)
    .eq("city", city);

  if (wErr) {
    console.error("DB-feil ved henting av verksteder:", wErr);
    return NextResponse.json(
      { error: "Klarte ikke hente verksteder." },
      { status: 500 }
    );
  }

  // 3) Filtrer: verksted matcher hvis
  //    (det tar dette bilmerket, eller ikke har registrert noen merker)
  //    OG
  //    (minst én valgt tjeneste finnes hos verkstedet, eller verkstedet
  //     ikke har registrert noen tjenester = tilbyr alt).
  type WorkshopRow = {
    id: string;
    name: string;
    email: string;
    ov_workshop_brands: { brand_id: string }[];
    ov_workshop_services: { service_id: string }[];
  };

  const matching = (workshops as WorkshopRow[] | null ?? []).filter((w) => {
    const brands = w.ov_workshop_brands ?? [];
    const brandMatch =
      brands.length === 0 || (brandId !== null && brands.some((b) => b.brand_id === brandId));

    const workshopServices = w.ov_workshop_services ?? [];
    const serviceMatch =
      serviceIds.length === 0 ||
      workshopServices.length === 0 ||
      workshopServices.some((s) => serviceIds.includes(s.service_id));

    return brandMatch && serviceMatch;
  });

  const recipients = matching.map((w) => w.email).filter(Boolean);

  // 4) Send e-post
  let notified = 0;
  if (recipients.length > 0) {
    try {
      notified = await sendInquiryEmails(recipients, {
        userName,
        userEmail,
        regNr,
        brand,
        model: body.model?.trim() || null,
        year: body.year?.trim() || null,
        description,
        services,
      });
    } catch (err) {
      console.error("E-postfeil:", err);
      // Vi logger fortsatt forespørselen under, men varsler om feilen
    }
  }

  // 5) Logg forespørselen
  const { error: iErr } = await supabase.from("ov_inquiries").insert({
    user_name: userName,
    user_email: userEmail,
    reg_nr: regNr,
    car_brand: brand,
    car_model: body.model?.trim() || null,
    car_year: body.year?.trim() || null,
    car_info: body.carInfo ?? null,
    description,
    services,
    workshops_notified: notified,
  });

  if (iErr) {
    console.error("DB-feil ved logging av forespørsel:", iErr);
  }

  return NextResponse.json({
    ok: true,
    workshopsNotified: notified,
    workshopsMatched: matching.length,
  });
}
