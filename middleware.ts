import { type NextRequest, NextResponse } from "next/server"
import { decrypt } from "./lib/session"

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard", "/income", "/expenses", "/budget", "/reports", "/profile"]
const publicRoutes = ["/login", "/signup", "/"]
const authRoutes = ["/login", "/signup"]

export async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)
  const isAuthRoute = authRoutes.includes(path)

  // 3. Decrypt the session from the cookie
  const cookie = req.cookies.get("session")?.value
  const session = await decrypt(cookie)

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
}

