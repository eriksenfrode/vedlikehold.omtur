# Omtur Vedlikehold

Anbudstjeneste for bilverksteder i Mo i Rana. Privatpersoner sender én
forespørsel – tjenesten videresender den til alle relevante verksteder,
filtrert på bilmerke.

> Godt vedlikehold er det grønneste du kan gjøre for bilen din. En bil som
> holdes i stand kjøres lenger, forurenser mindre og er mer ansvarlig enn å
> kjøpe ny. En del av [omtur.no](https://omtur.no).

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Postgres, tabellprefiks `ov_`)
- **Resend** (e-postutsending)
- **Tailwind CSS**
- **Vercel** (deploy, domene `vedlikehold.omtur.no`)

## Kom i gang

### 1. Installer avhengigheter

```bash
npm install
```

### 2. Miljøvariabler

Kopier eksempelfilen og fyll inn verdiene:

```bash
cp .env.local.example .env.local
```

| Variabel | Beskrivelse |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL til Supabase-prosjektet |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public-nøkkel |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role-nøkkel (kun server) |
| `RESEND_API_KEY` | API-nøkkel fra Resend |
| `ADMIN_PASSWORD` | Passord for `/admin` |
| `NEXT_PUBLIC_APP_NAME` | Visningsnavn (Omtur Vedlikehold) |
| `NEXT_PUBLIC_APP_URL` | Full URL til appen |

Valgfritt:

- `RESEND_FROM` – avsenderadresse (standard
  `Omtur Vedlikehold <vedlikehold@omtur.no>` – domenet må være verifisert i
  Resend).
- `VEGVESEN_API_KEY` – **påkrevd for live reg.nr-oppslag.** Statens vegvesens
  datautleverings-API krever en gratis API-nøkkel (sendes som
  `SVV-Authorization: Apikey …`). Søk om tilgang hos
  [Vegvesen – API for kjøretøyopplysninger](https://www.vegvesen.no/om-oss/om-organisasjonen/apne-data/api-for-kjoretoyopplysninger/).
  Uten nøkkel fungerer skjemaet fortsatt – brukeren kan sende inn manuelt, og
  oppslaget viser bare en vennlig feilmelding.

### 3. Database

Kjør migrasjonen og seed-data i Supabase. Enten via SQL-editoren i
Supabase-dashboardet, eller med Supabase CLI:

```bash
# I SQL-editoren: lim inn og kjør innholdet i
supabase/migrations/001_init.sql
supabase/seed.sql
```

Seed-fila legger inn 4 testverksteder og 15 vanlige bilmerker. Ett verksted
(`Nordland Motor`) har ingen merker registrert og fungerer som
universalverksted – det tar imot alle merker.

### 4. Kjør lokalt

```bash
npm run dev
```

- Brukerside: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> (logg inn med `ADMIN_PASSWORD`)

## Hvordan det fungerer

1. Brukeren skriver inn reg.nr. Appen slår opp kjøretøyet live mot Statens
   vegvesen og viser merke, modell og årsmodell.
2. Ved innsending finner `/api/submit` alle aktive verksteder i byen som
   enten har bilmerket registrert, **eller** ikke har noen merker registrert
   (universalverksted).
3. Hvert verksted får en e-post via Resend. Forespørselen logges i
   `ov_inquiries`.
4. Verkstedene kontakter kunden direkte med tilbud.

## API-ruter

| Rute | Metode | Beskrivelse |
| --- | --- | --- |
| `/api/lookup?regnr=XX00000` | GET | Vegvesen-oppslag → `{ brand, model, year, raw }` |
| `/api/submit` | POST | Tar imot skjema, sender e-post, logger |
| `/api/admin/login` | POST/DELETE | Logg inn / ut (cookie-session) |
| `/api/admin/workshops` | GET/POST/DELETE | CRUD for verksteder |
| `/api/admin/brands` | GET/POST/DELETE | CRUD for bilmerker |
| `/api/admin/inquiries` | GET | Logg over forespørsler |

Alle `/api/admin/*`-ruter (unntatt login) og `/admin` er beskyttet av en
enkel cookie-sjekk mot `ADMIN_PASSWORD` via `src/middleware.ts`.

## Deploy til Vercel

1. Koble repoet til et Vercel-prosjekt.
2. Legg inn miljøvariablene i Vercel (Project Settings → Environment
   Variables).
3. Sett opp custom domain `vedlikehold.omtur.no` (se `vercel.json`).
4. Verifiser avsenderdomenet i Resend for å sende fra `@omtur.no`.

## Datamodell (`ov_`-prefiks)

- `ov_workshops` – verksteder (navn, e-post, by, aktiv)
- `ov_brands` – bilmerker
- `ov_workshop_brands` – kobling verksted ↔ merke (tom = tar alle merker)
- `ov_inquiries` – logg over innsendte forespørsler

## Fremtidig utvidelse

Admin har et by-filter (`rana` / `helgeland`) klart for utvidelse til hele
Helgeland.
