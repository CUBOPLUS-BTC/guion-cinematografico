import { auth } from "@/lib/auth/auth.edge"

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/auth")) {
    return
  }

  if (pathname.startsWith("/api/webhooks")) {
    return
  }

  if (pathname.startsWith("/api")) {
    if (!req.auth) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }
    return
  }

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")

  if (!req.auth && !isPublic) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", pathname)
    return Response.redirect(url)
  }

  if (req.auth && (pathname === "/login" || pathname === "/signup")) {
    return Response.redirect(new URL("/dashboard", req.url))
  }
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
