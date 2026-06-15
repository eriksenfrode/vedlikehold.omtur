/**
 * Oppslag mot Statens vegvesen sitt åpne datautleverings-API.
 * Returnerer merke, modell og årsmodell for et kjennemerke (reg.nr).
 */

const VEGVESEN_URL =
  "https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata";

export type VegvesenResult = {
  brand: string | null;
  model: string | null;
  year: string | null;
  raw: unknown;
};

export function normalizeRegNr(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}

export async function lookupVegvesen(
  regnr: string
): Promise<VegvesenResult> {
  const kjennemerke = normalizeRegNr(regnr);
  const url = `${VEGVESEN_URL}?kjennemerke=${encodeURIComponent(kjennemerke)}`;

  // Datautleverings-API-et krever en API-nøkkel (SVV-Authorization: Apikey ...).
  // Hent gratis nøkkel her: https://www.vegvesen.no/om-oss/om-organisasjonen/apne-data/api-for-kjoretoyopplysninger/
  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = process.env.VEGVESEN_API_KEY;
  if (apiKey) {
    headers["SVV-Authorization"] = `Apikey ${apiKey}`;
  }

  const res = await fetch(url, {
    headers,
    // Ikke cache – kan endre seg, og vi vil ha ferske data
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      "Vegvesen-oppslag krever API-nøkkel. Sett VEGVESEN_API_KEY i miljøvariablene."
    );
  }

  if (!res.ok) {
    throw new Error(`Vegvesen-oppslag feilet (${res.status})`);
  }

  // 204 No Content = kjennemerket finnes ikke. Tom body, så res.json() ville kastet.
  if (res.status === 204) {
    return { brand: null, model: null, year: null, raw: null };
  }

  const data = await res.json();

  // Strukturen: { kjoretoydataListe: [ { ... } ] }
  const kjoretoy = data?.kjoretoydataListe?.[0];
  const tekniske =
    kjoretoy?.godkjenning?.tekniskGodkjenning?.tekniskeData;

  const generelt = tekniske?.generelt;
  const brand: string | null = generelt?.merke?.[0]?.merke ?? null;
  const model: string | null = generelt?.handelsbetegnelse?.[0] ?? null;

  // Årsmodell finnes typisk under registrering eller forstegangsgodkjenning
  const regAar: string | undefined =
    kjoretoy?.forstegangsregistrering?.registrertForstegangNorgeDato;
  const year: string | null = regAar ? regAar.slice(0, 4) : null;

  return {
    brand,
    model,
    year,
    raw: data,
  };
}
