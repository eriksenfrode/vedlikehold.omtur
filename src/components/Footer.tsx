import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-sand-200 bg-sand-100">
      <div className="mx-auto max-w-2xl px-5 py-8 text-center">
        <p className="text-sm leading-relaxed text-bark-700">
          Vedlikehold forlenger bilens liv og reduserer klimaavtrykket.
          <br />
          En del av{" "}
          <a
            href="https://omtur.no"
            className="font-medium text-moss-600 underline-offset-2 hover:underline"
          >
            omtur.no
          </a>{" "}
          – for fornuftig forbruk.
        </p>
        <p className="mt-4 text-xs text-bark-700/70">
          <Link
            href="/personvern"
            className="underline-offset-2 hover:text-moss-600 hover:underline"
          >
            Personvern
          </Link>
        </p>
      </div>
    </footer>
  );
}
