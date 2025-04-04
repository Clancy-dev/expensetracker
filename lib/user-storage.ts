"use client"

import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  fullName: string
  email: string
  password: string
  avatar?: string
}

// Initialize user storage
export const initializeUserStorage = () => {
  if (typeof window === "undefined") return

  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]))
  }
}

// Get all users
export const getUsers = (): User[] => {
  if (typeof window === "undefined") return []

  const users = localStorage.getItem("users")
  return users ? JSON.parse(users) : []
}

// Find user by email
export const findUserByEmail = (email: string): User | undefined => {
  const users = getUsers()
  return users.find((user) => user.email === email)
}

// Find user by ID
export const findUserById = (id: string): User | undefined => {
  const users = getUsers()
  return users.find((user) => user.id === id)
}

// Create a new user
export const createUser = async (userData: Omit<User, "id">): Promise<User> => {
  const users = getUsers()

  // Check if email already exists
  if (users.some((user) => user.email === userData.email)) {
    throw new Error("Email already exists")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  // Create new user
  const newUser: User = {
    id: uuidv4(),
    ...userData,
    password: hashedPassword,
  }

  // Save to storage
  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  return newUser
}

// Update user
export const updateUser = (id: string, updates: Partial<Omit<User, "id" | "email">>): boolean => {
  const users = getUsers()
  const userIndex = users.findIndex((user) => user.id === id)

  if (userIndex === -1) return false

  // Update user fields
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
  }

  // Save to storage
  localStorage.setItem("users", JSON.stringify(users))
  return true
}

// Verify user credentials
export const verifyCredentials = async (email: string, password: string): Promise<User | null> => {
  const user = findUserByEmail(email)

  if (!user) {
    return null
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return null
  }

  return user
}

