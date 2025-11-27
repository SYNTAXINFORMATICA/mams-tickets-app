// Esta es la nueva forma de manejar middleware en Next.js 16+
// Referencia: https://nextjs.org/docs/messages/middleware-to-proxy

import { NextResponse } from "next/server"

export function middleware(request) {
  const sessionToken = request.cookies.get("session")?.value
  const { pathname } = request.nextUrl

  // Rutas públicas
  const publicRoutes = ["/login", "/"]

  // Si no tiene sesión y no está en ruta pública, redirigir a login
  if (!sessionToken && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si tiene sesión y está en login, redirigir a dashboard
  if (sessionToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|public|icon|apple-icon).*)"],
}
