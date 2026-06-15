import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ov_admin";

/**
 * Lager en enkel signaturverdi for admin-cookien basert på passordet.
 * Dette er ikke en kryptografisk sterk løsning, men holder admin-panelet
 * bak ADMIN_PASSWORD slik oppgaven beskriver.
 */
export function adminCookieValue(): string {
  const pw = process.env.ADMIN_PASSWORD || "";
  // Enkel, deterministisk token avledet av passordet.
  return Buffer.from(`ov:${pw}`).toString("base64url");
}

export function isValidPassword(password: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || "";
  return pw.length > 0 && password === pw;
}

/**
 * Sjekker om gjeldende request har gyldig admin-session-cookie.
 */
export function isAuthed(): boolean {
  const expected = adminCookieValue();
  const got = cookies().get(ADMIN_COOKIE)?.value;
  return Boolean(got) && got === expected;
}
