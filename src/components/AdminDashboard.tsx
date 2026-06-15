"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Brand = { id: string; name: string };

type Service = { id: string; name: string; sort_order: number };

type Workshop = {
  id: string;
  name: string;
  email: string;
  city: string;
  active: boolean;
  created_at: string;
  brandIds: string[];
  serviceIds: string[];
};

type Inquiry = {
  id: string;
  created_at: string;
  reg_nr: string;
  car_brand: string | null;
  car_model: string | null;
  car_year: string | null;
  user_name: string;
  services: string[] | null;
  workshops_notified: number;
};

const CITIES = [
  { value: "rana", label: "Rana" },
  { value: "helgeland", label: "Helgeland" },
];

const emptyDraft = (city: string): WorkshopDraft => ({
  id: undefined,
  name: "",
  email: "",
  city,
  active: true,
  brandIds: [],
  serviceIds: [],
});

type WorkshopDraft = {
  id?: string;
  name: string;
  email: string;
  city: string;
  active: boolean;
  brandIds: string[];
  serviceIds: string[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [cityFilter, setCityFilter] = useState("rana");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<WorkshopDraft | null>(null);
  const [newBrand, setNewBrand] = useState("");
  const [newService, setNewService] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wRes, bRes, sRes, iRes] = await Promise.all([
        fetch(`/api/admin/workshops?city=${cityFilter}`),
        fetch("/api/admin/brands"),
        fetch("/api/admin/services"),
        fetch("/api/admin/inquiries"),
      ]);
      if (wRes.status === 401) {
        router.push("/admin/login");
        return;
      }
      const wData = await wRes.json();
      const bData = await bRes.json();
      const sData = await sRes.json();
      const iData = await iRes.json();
      setWorkshops(wData.workshops ?? []);
      setBrands(bData.brands ?? []);
      setServices(sData.services ?? []);
      setInquiries(iData.inquiries ?? []);
    } catch {
      setError("Klarte ikke laste data.");
    } finally {
      setLoading(false);
    }
  }, [cityFilter, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  async function saveWorkshop(d: WorkshopDraft) {
    setError(null);
    const res = await fetch("/api/admin/workshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Klarte ikke lagre verksted.");
      return;
    }
    setDraft(null);
    await load();
  }

  async function deleteWorkshop(id: string) {
    if (!confirm("Slette dette verkstedet?")) return;
    await fetch(`/api/admin/workshops?id=${id}`, { method: "DELETE" });
    await load();
  }

  async function addBrand() {
    const name = newBrand.trim();
    if (!name) return;
    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Klarte ikke legge til merke.");
      return;
    }
    setNewBrand("");
    await load();
  }

  async function deleteBrand(id: string) {
    if (!confirm("Slette dette merket? Det fjernes også fra verkstedene.")) return;
    await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
    await load();
  }

  async function addService() {
    const name = newService.trim();
    if (!name) return;
    const sortOrder = services.length
      ? Math.max(...services.map((s) => s.sort_order)) + 1
      : 1;
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sortOrder }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Klarte ikke legge til tjeneste.");
      return;
    }
    setNewService("");
    await load();
  }

  async function deleteService(id: string) {
    if (!confirm("Slette denne tjenesten? Den fjernes også fra verkstedene.")) return;
    await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    await load();
  }

  async function moveService(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    const a = services[index];
    const b = services[target];
    await Promise.all([
      fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, name: a.name, sortOrder: b.sort_order }),
      }),
      fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, name: b.name, sortOrder: a.sort_order }),
      }),
    ]);
    await load();
  }

  const brandName = (id: string) =>
    brands.find((b) => b.id === id)?.name ?? "?";

  const serviceName = (id: string) =>
    services.find((s) => s.id === id)?.name ?? "?";

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <header className="border-b border-sand-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold text-bark-900">
              Omtur Vedlikehold
            </h1>
            <p className="text-xs text-bark-700">Administrasjon</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-sand-200 px-4 py-2 text-sm text-bark-700 hover:bg-sand-100"
          >
            Logg ut
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-5 py-8">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* By-filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-bark-800">By:</span>
          {CITIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCityFilter(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                cityFilter === c.value
                  ? "bg-moss-600 text-white"
                  : "border border-sand-200 text-bark-700 hover:bg-sand-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Verksteder */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-bark-900">
              Verksteder ({workshops.length})
            </h2>
            <button
              onClick={() => setDraft(emptyDraft(cityFilter))}
              className="rounded-lg bg-moss-600 px-4 py-2 text-sm font-medium text-white hover:bg-moss-700"
            >
              + Nytt verksted
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-bark-700">Laster …</p>
          ) : (
            <div className="grid gap-3">
              {workshops.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-sand-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-bark-900">
                          {w.name}
                        </span>
                        {!w.active && (
                          <span className="rounded-full bg-sand-200 px-2 py-0.5 text-xs text-bark-700">
                            Inaktiv
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-bark-700">{w.email}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {w.brandIds.length === 0 ? (
                          <span className="rounded-full bg-moss-100 px-2.5 py-0.5 text-xs text-moss-700">
                            Tar alle merker
                          </span>
                        ) : (
                          w.brandIds.map((bid) => (
                            <span
                              key={bid}
                              className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs text-bark-700"
                            >
                              {brandName(bid)}
                            </span>
                          ))
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {w.serviceIds.length === 0 ? (
                          <span className="rounded-full bg-moss-100 px-2.5 py-0.5 text-xs text-moss-700">
                            Tilbyr alle tjenester
                          </span>
                        ) : (
                          w.serviceIds.map((sid) => (
                            <span
                              key={sid}
                              className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs text-bark-700"
                            >
                              {serviceName(sid)}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setDraft({
                            id: w.id,
                            name: w.name,
                            email: w.email,
                            city: w.city,
                            active: w.active,
                            brandIds: w.brandIds,
                            serviceIds: w.serviceIds ?? [],
                          })
                        }
                        className="rounded-lg border border-sand-200 px-3 py-1.5 text-sm text-bark-700 hover:bg-sand-100"
                      >
                        Rediger
                      </button>
                      <button
                        onClick={() => deleteWorkshop(w.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                      >
                        Slett
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {workshops.length === 0 && (
                <p className="text-sm text-bark-700">
                  Ingen verksteder for {cityFilter} ennå.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Bilmerker */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-bark-900">
            Bilmerker ({brands.length})
          </h2>
          <div className="rounded-xl border border-sand-200 bg-white p-4">
            <div className="mb-4 flex gap-2">
              <input
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addBrand()}
                placeholder="Nytt merke, f.eks. Citroën"
                className="flex-1 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-sm outline-none focus:border-moss-400 focus:bg-white"
              />
              <button
                onClick={addBrand}
                className="rounded-lg bg-moss-600 px-4 py-2 text-sm font-medium text-white hover:bg-moss-700"
              >
                Legg til
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 py-1 pl-3 pr-1.5 text-sm text-bark-800"
                >
                  {b.name}
                  <button
                    onClick={() => deleteBrand(b.id)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-bark-700 hover:bg-red-100 hover:text-red-700"
                    aria-label={`Slett ${b.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Logg over forespørsler */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-bark-900">
            Innsendte forespørsler ({inquiries.length})
          </h2>
          <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-200 text-left text-bark-700">
                  <th className="px-4 py-3 font-medium">Dato</th>
                  <th className="px-4 py-3 font-medium">Reg.nr</th>
                  <th className="px-4 py-3 font-medium">Merke / modell</th>
                  <th className="px-4 py-3 font-medium">Kunde</th>
                  <th className="px-4 py-3 text-right font-medium">Varslet</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-sand-100 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-bark-700">
                      {formatDate(i.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium tracking-wide text-bark-900">
                      {i.reg_nr}
                    </td>
                    <td className="px-4 py-3 text-bark-700">
                      {[i.car_brand, i.car_model].filter(Boolean).join(" ") ||
                        "–"}
                      {i.car_year ? ` (${i.car_year})` : ""}
                    </td>
                    <td className="px-4 py-3 text-bark-700">{i.user_name}</td>
                    <td className="px-4 py-3 text-right text-bark-900">
                      {i.workshops_notified}
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-bark-700"
                    >
                      Ingen forespørsler ennå.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {draft && (
        <WorkshopModal
          draft={draft}
          brands={brands}
          services={services}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={() => saveWorkshop(draft)}
        />
      )}
    </div>
  );
}

function WorkshopModal({
  draft,
  brands,
  services,
  onChange,
  onCancel,
  onSave,
}: {
  draft: WorkshopDraft;
  brands: Brand[];
  services: Service[];
  onChange: (d: WorkshopDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  function toggleBrand(id: string) {
    const has = draft.brandIds.includes(id);
    onChange({
      ...draft,
      brandIds: has
        ? draft.brandIds.filter((b) => b !== id)
        : [...draft.brandIds, id],
    });
  }

  function toggleService(id: string) {
    const has = draft.serviceIds.includes(id);
    onChange({
      ...draft,
      serviceIds: has
        ? draft.serviceIds.filter((s) => s !== id)
        : [...draft.serviceIds, id],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-bark-900">
          {draft.id ? "Rediger verksted" : "Nytt verksted"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-bark-800">
              Navn
            </label>
            <input
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              className={modalInput}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-bark-800">
              E-post
            </label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => onChange({ ...draft, email: e.target.value })}
              className={modalInput}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-bark-800">
                By
              </label>
              <select
                value={draft.city}
                onChange={(e) => onChange({ ...draft, city: e.target.value })}
                className={modalInput}
              >
                {CITIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm text-bark-800">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) =>
                  onChange({ ...draft, active: e.target.checked })
                }
                className="h-4 w-4 accent-moss-600"
              />
              Aktiv
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-bark-800">
              Bilmerker
            </label>
            <p className="mb-2 text-xs text-bark-700">
              Ingen valgt = universalverksted (tar alle merker).
            </p>
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => {
                const on = draft.brandIds.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBrand(b.id)}
                    className={`rounded-full px-3 py-1 text-sm transition ${
                      on
                        ? "bg-moss-600 text-white"
                        : "border border-sand-200 text-bark-700 hover:bg-sand-100"
                    }`}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-bark-800">
              Tjenester
            </label>
            <p className="mb-2 text-xs text-bark-700">
              Ingen valgt = tilbyr alle tjenester.
            </p>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => {
                const on = draft.serviceIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={`rounded-full px-3 py-1 text-sm transition ${
                      on
                        ? "bg-moss-600 text-white"
                        : "border border-sand-200 text-bark-700 hover:bg-sand-100"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-sand-200 px-4 py-2 text-sm text-bark-700 hover:bg-sand-100"
          >
            Avbryt
          </button>
          <button
            onClick={onSave}
            className="rounded-lg bg-moss-600 px-5 py-2 text-sm font-semibold text-white hover:bg-moss-700"
          >
            Lagre
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const modalInput =
  "w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-sm outline-none focus:border-moss-400 focus:bg-white focus:ring-2 focus:ring-moss-200";
