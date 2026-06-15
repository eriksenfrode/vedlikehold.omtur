import InquiryForm from "@/components/InquiryForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero */}
        <header className="bg-gradient-to-b from-moss-50 to-sand-50">
          <div className="mx-auto max-w-2xl px-5 pb-10 pt-12 sm:pt-16">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-moss-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-moss-700">
              <span className="h-1.5 w-1.5 rounded-full bg-moss-500" />
              Omtur Vedlikehold · Mo i Rana
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-bark-900 sm:text-4xl">
              Godt vedlikehold er det grønneste du kan gjøre for bilen din.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-bark-700">
              En bil som holdes i god stand kjøres lenger, forurenser mindre og er
              mer ansvarlig enn å kjøpe ny. Fyll inn reg.nr, beskriv hva du
              trenger – så sender vi forespørselen til alle relevante verksteder
              i Rana.
            </p>
          </div>
        </header>

        {/* Skjema */}
        <section className="mx-auto max-w-2xl px-5 pt-2">
          <InquiryForm />
        </section>

        {/* Hvordan det fungerer */}
        <section className="mx-auto mt-12 max-w-2xl px-5">
          <h2 className="mb-5 text-center text-sm font-semibold uppercase tracking-wide text-bark-700">
            Slik fungerer det
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            <Step n={1} title="Beskriv behovet">
              Reg.nr og en kort beskrivelse av hva bilen trenger.
            </Step>
            <Step n={2} title="Vi finner verkstedene">
              Forespørselen går til alle relevante verksteder for ditt bilmerke.
            </Step>
            <Step n={3} title="Du får tilbud">
              Verkstedene kontakter deg direkte. Du velger selv.
            </Step>
          </ol>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-2xl border border-sand-200 bg-white p-5">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-moss-100 text-sm font-semibold text-moss-700">
        {n}
      </div>
      <h3 className="mb-1 font-medium text-bark-900">{title}</h3>
      <p className="text-sm leading-relaxed text-bark-700">{children}</p>
    </li>
  );
}
