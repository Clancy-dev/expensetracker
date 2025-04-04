"use client"

// Function to get the current user ID from localStorage
export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null

  try {
    const userDataString = localStorage.getItem("currentUser")
    if (!userDataString) return null

    const userData = JSON.parse(userDataString)
    return userData.id || null
  } catch (error) {
    console.error("Error getting current user ID:", error)
    return null
  }
}

// Function to get the current user from localStorage
export function getCurrentUser(): { id: string; email: string; fullName: string; avatar?: string } | null {
  if (typeof window === "undefined") return null

  try {
    const userDataString = localStorage.getItem("currentUser")
    if (!userDataString) return null

    return JSON.parse(userDataString)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Function to set the current user in localStorage
export function setCurrentUser(user: { id: string; email: string; fullName: string; avatar?: string }): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } catch (error) {
    console.error("Error setting current user:", error)
  }
}

// Function to clear the current user from localStorage
export function clearCurrentUser(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("currentUser")
  } catch (error) {
    console.error("Error clearing current user:", error)
  }
}

export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<boolean> {
  return true
}

export async function updateUserAvatar(avatar: string): Promise<boolean> {
  return true
}

export async function updateUserName(fullName: string): Promise<boolean> {
  return true
}

