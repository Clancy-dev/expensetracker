"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Briefcase, LogOut, Menu, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { clearCurrentUser, getCurrentUser } from "@/lib/auth-client"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<{ fullName: string; avatar?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      })
      clearCurrentUser() // Clear user from localStorage
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"

    return (
      name
        .split(" ")
        .map((part) => part[0] || "")
        .join("")
        .toUpperCase()
        .substring(0, 2) || "U"
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Expense Tracker
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              Dashboard
            </Link>
            <Link href="/income" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              Income
            </Link>
            <Link href="/expenses" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              Expenses
            </Link>
            <Link href="/budget" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              Budget
            </Link>
            <Link href="/reports" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              Reports
            </Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.fullName || "User"} />
                  <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button and Avatar */}
        <div className="flex items-center space-x-2 md:hidden">
          <Link href="/profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.fullName || "User"} />
              <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Popup */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 md:hidden">
          <div className="w-64 h-full bg-white shadow-lg animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={closeMenu} aria-label="Close menu">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex flex-col p-4 space-y-2">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/income"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={closeMenu}
              >
                Income
              </Link>
              <Link
                href="/expenses"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={closeMenu}
              >
                Expenses
              </Link>
              <Link
                href="/budget"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={closeMenu}
              >
                Budget
              </Link>
              <Link
                href="/reports"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={closeMenu}
              >
                Reports
              </Link>
              <Link
                href="/profile"
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={closeMenu}
              >
                Profile
              </Link>
              <div className="pt-2 mt-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-medium"
                  onClick={() => {
                    handleLogout()
                    closeMenu()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

