import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";

/**
 * Beskytter /admin (men ikke /admin/login) med en enkel cookie-sjekk.
 * Selve passordvalideringen skjer i /api/admin/login der vi har tilgang
 * til ADMIN_PASSWORD; her sjekker vi bare at cookien finnes og matcher
 * forventet verdi.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Tillat login-siden og selve login-API-et fritt
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }

  const expected = Buffer.from(
    `ov:${process.env.ADMIN_PASSWORD || ""}`
  ).toString("base64url");
  const got = req.cookies.get(ADMIN_COOKIE)?.value;
  const authed = Boolean(got) && got === expected;

  if (!authed) {
    // API-ruter skal få 401, sider skal redirectes til login
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
