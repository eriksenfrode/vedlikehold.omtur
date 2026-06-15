"use client";

import { useEffect, useRef, useState } from "react";

type CarData = {
  brand: string | null;
  model: string | null;
  year: string | null;
  raw: unknown;
};

type Service = { id: string; name: string; sort_order: number };

type Status = "idle" | "loading" | "found" | "notfound" | "error";

export default function InquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regNr, setRegNr] = useState("");
  const [description, setDescription] = useState("");

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [car, setCar] = useState<CarData | null>(null);
  const [lookupStatus, setLookupStatus] = useState<Status>("idle");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ notified: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data.services ?? []))
      .catch(() => setServices([]));
  }, []);

  function toggleService(name: string) {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  }

  function onRegChange(value: string) {
    const v = value.toUpperCase();
    setRegNr(v);
    setCar(null);
    setLookupStatus("idle");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const cleaned = v.replace(/\s+/g, "");
    if (cleaned.length < 7) return;

    debounceRef.current = setTimeout(() => doLookup(cleaned), 500);
  }

  async function doLookup(regnr: string) {
    setLookupStatus("loading");
    try {
      const res = await fetch(
        `/api/lookup?regnr=${encodeURIComponent(regnr)}`
      );
      if (!res.ok) {
        setLookupStatus("error");
        return;
      }
      const data: CarData = await res.json();
      setCar(data);
      setLookupStatus(data.brand ? "found" : "notfound");
    } catch {
      setLookupStatus("error");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !name.trim() ||
      !email.trim() ||
      !regNr.trim() ||
      (selectedServices.length === 0 && !description.trim())
    ) {
      setError(
        "Fyll inn navn, e-post, reg.nr og hva bilen trenger hjelp med."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: name,
          userEmail: email,
          regNr,
          brand: car?.brand ?? null,
          model: car?.model ?? null,
          year: car?.year ?? null,
          carInfo: car?.raw ?? null,
          description,
          services: selectedServices,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Noe gikk galt. Prøv igjen.");
      } else {
        setResult({ notified: data.workshopsNotified ?? 0 });
      }
    } catch {
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-moss-200 bg-moss-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-moss-500 text-2xl text-white">
          ✓
        </div>
        <h2 className="mb-2 text-xl font-semibold text-moss-700">
          Forespørselen er sendt!
        </h2>
        <p className="text-bark-700">
          Sendt til <strong>{result.notified}</strong>{" "}
          {result.notified === 1 ? "verksted" : "verksteder"}. De kontakter deg
          direkte med tilbud.
        </p>
        <button
          onClick={() => {
            setResult(null);
            setName("");
            setEmail("");
            setRegNr("");
            setDescription("");
            setSelectedServices([]);
            setCar(null);
            setLookupStatus("idle");
          }}
          className="mt-6 text-sm font-medium text-moss-600 hover:underline"
        >
          Send en ny forespørsel
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Navn">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ditt navn"
              className={inputClass}
              autoComplete="name"
            />
          </Field>
          <Field label="E-post">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.no"
              className={inputClass}
              autoComplete="email"
            />
          </Field>
        </div>

        <Field label="Reg.nr">
          <input
            type="text"
            value={regNr}
            onChange={(e) => onRegChange(e.target.value)}
            placeholder="f.eks. EK12345"
            className={`${inputClass} tracking-widest`}
            maxLength={9}
            autoCapitalize="characters"
          />
          <CarPreview status={lookupStatus} car={car} />
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-bark-800">
            Hva trenger bilen hjelp med?
          </span>

          {services.length > 0 && (
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              {services.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2.5 text-sm text-bark-800 transition hover:border-moss-300"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(s.name)}
                    onChange={() => toggleService(s.name)}
                    className="h-4 w-4 accent-moss-600"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-bark-800">
              Annet / mer detaljer
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv kort hva bilen trenger – f.eks. en ulyd, eller noe som ikke fungerer som det skal."
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </label>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-xl bg-moss-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-moss-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sender …" : "Send forespørsel"}
        </button>

        <p className="text-center text-xs text-bark-700/70">
          Ingen passord nødvendig. Verkstedene kontakter deg direkte. Ved å
          sende godtar du vår{" "}
          <a
            href="/personvern"
            className="underline underline-offset-2 hover:text-moss-600"
          >
            personvernerklæring
          </a>
          .
        </p>
      </div>
    </form>
  );
}

function CarPreview({
  status,
  car,
}: {
  status: Status;
  car: CarData | null;
}) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <p className="mt-2 text-sm text-bark-700/70">Henter kjøretøydata …</p>
    );
  }

  if (status === "error") {
    return (
      <p className="mt-2 text-sm text-amber-700">
        Klarte ikke hente data nå – du kan sende inn likevel.
      </p>
    );
  }

  if (status === "notfound") {
    return (
      <p className="mt-2 text-sm text-bark-700/70">
        Fant ikke kjøretøyet. Sjekk reg.nr, eller send inn likevel.
      </p>
    );
  }

  // found
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-moss-50 px-3 py-2 text-sm text-moss-700">
      <span className="font-semibold">{car?.brand}</span>
      {car?.model && <span>{car.model}</span>}
      {car?.year && (
        <span className="text-moss-600">· {car.year}</span>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-bark-800">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-3 text-base text-bark-900 outline-none transition placeholder:text-bark-700/40 focus:border-moss-400 focus:bg-white focus:ring-2 focus:ring-moss-200";
