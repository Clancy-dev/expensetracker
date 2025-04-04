"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { setCurrentUser, clearCurrentUser } from "@/lib/auth-client"

interface UserProviderProps {
  user: {
    id: string
    email: string
    fullName: string
  } | null
  children: React.ReactNode
}

export function UserProvider({ user, children }: UserProviderProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Set or clear the current user in localStorage based on session
    if (user) {
      setCurrentUser(user)
    } else {
      clearCurrentUser()

      // If on a protected route and no user, redirect to login
      const protectedRoutes = ["/dashboard", "/income", "/expenses", "/budget", "/reports"]
      const isProtectedRoute = protectedRoutes.some((route) => pathname?.startsWith(route))

      if (isProtectedRoute) {
        router.push("/login")
      }
    }
  }, [user, pathname, router])

  return <>{children}</>
}

