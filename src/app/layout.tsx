import type { Metadata } from "next";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Omtur Vedlikehold";

export const metadata: Metadata = {
  title: `${appName} – anbud fra bilverksteder i Rana`,
  description:
    "Send én forespørsel til alle relevante bilverksteder i Mo i Rana. Godt vedlikehold forlenger bilens liv og reduserer klimaavtrykket. En del av omtur.no.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://vedlikehold.omtur.no"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
