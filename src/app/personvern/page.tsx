import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Omtur Vedlikehold";

export const metadata: Metadata = {
  title: `Personvern – ${appName}`,
  description:
    "Slik behandler Omtur Vedlikehold personopplysningene dine når du sender en anbudsforespørsel.",
};

export default function PersonvernPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 pb-10 pt-12 sm:pt-16">
          <Link
            href="/"
            className="text-sm font-medium text-moss-600 underline-offset-2 hover:underline"
          >
            ← Tilbake
          </Link>

          <h1 className="mt-6 text-3xl font-semibold text-bark-900">
            Personvern
          </h1>
          <p className="mt-3 text-bark-700">
            Sist oppdatert: juni 2026. {appName} er en tjeneste under{" "}
            <a
              href="https://omtur.no"
              className="text-moss-600 underline-offset-2 hover:underline"
            >
              omtur.no
            </a>
            .
          </p>

          <div className="mt-8 space-y-8">
            <Section title="Hva vi samler inn">
              <p>Når du sender en forespørsel, behandler vi:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Navn og e-postadresse</li>
                <li>Bilens registreringsnummer</li>
                <li>
                  Tekniske kjøretøyopplysninger (merke, modell og årsmodell) som
                  hentes fra Statens vegvesen basert på registreringsnummeret
                </li>
                <li>Beskrivelsen du skriver om hva bilen trenger</li>
              </ul>
              <p className="mt-2">
                Vi ber ikke om passord, fødselsnummer eller betalingsinformasjon.
              </p>
            </Section>

            <Section title="Hvorfor vi behandler dataene">
              <p>
                Formålet er å videresende forespørselen din til relevante
                bilverksteder i ditt område, slik at de kan kontakte deg med
                tilbud. Behandlingsgrunnlaget er ditt samtykke, som du gir ved å
                sende inn skjemaet, og oppfyllelse av tjenesten du ber om.
              </p>
            </Section>

            <Section title="Hvem som mottar opplysningene">
              <p>
                Når du sender inn, går forespørselen som e-post til aktive
                verksteder som passer for ditt bilmerke. Verkstedene mottar navn,
                e-post, registreringsnummer, bilopplysninger og beskrivelsen din,
                og kontakter deg direkte. {appName} er ikke part i avtalen mellom
                deg og verkstedet.
              </p>
            </Section>

            <Section title="Oppslag mot Statens vegvesen">
              <p>
                Registreringsnummer regnes som en personopplysning. Når du skriver
                inn reg.nr., gjør vi et oppslag mot Statens vegvesens åpne
                datatjeneste for å hente tekniske data om bilen. Vi henter ikke
                eierinformasjon.
              </p>
            </Section>

            <Section title="Lagring">
              <p>
                Vi lagrer en logg over innsendte forespørsler (dato,
                registreringsnummer, bilmerke, beskrivelse og kontaktinfo) for å
                kunne drifte og forbedre tjenesten. Du kan når som helst be om
                innsyn i, retting av eller sletting av opplysningene dine.
              </p>
            </Section>

            <Section title="Dine rettigheter">
              <p>
                Du har rett til innsyn, retting, sletting og å trekke tilbake
                samtykke. Ta kontakt på{" "}
                <a
                  href="mailto:personvern@omtur.no"
                  className="text-moss-600 underline-offset-2 hover:underline"
                >
                  personvern@omtur.no
                </a>{" "}
                så hjelper vi deg. Du kan også klage til Datatilsynet.
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-bark-900">{title}</h2>
      <div className="space-y-2 leading-relaxed text-bark-700">{children}</div>
    </section>
  );
}
