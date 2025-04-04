import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { getSession } from "@/lib/session"
import { UserProvider } from "@/components/user-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Clancy's Expense Tracker",
  description: "Track your expenses and income with ease",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get the current user session
  const session = await getSession()

  // Extract user data from session
  const user = session
    ? {
        id: session.userId,
        email: session.email,
        fullName: session.fullName,
      }
    : null

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <UserProvider user={user}>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'