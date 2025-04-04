"use server"

import { db } from "@/prisma/db"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createUser(data: {
  email: string
  password: string
  fullName: string
}) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      // return { error: "Email already exists" }
      return Error
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        password: hashedPassword,
      },
    })

    // Return user without password
    const { password, ...userWithoutPassword } = user
    return { data: userWithoutPassword }
  } catch (error) {
    console.error("Error creating user:", error)
    // return { error: "Failed to create user" }
    return Error
  }
}

export async function verifyCredentials(email: string, password: string) {
  try {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "Invalid email or password" }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { error: "Invalid email or password" }
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return { data: userWithoutPassword }
  } catch (error) {
    console.error("Error verifying credentials:", error)
    return { error: "Failed to verify credentials" }
  }
}

export async function updateUserProfile(userId: string, data: { fullName: string }) {
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { fullName: data.fullName },
    })

    const { password, ...userWithoutPassword } = updatedUser
    revalidatePath("/profile")
    return { data: userWithoutPassword }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { error: "Failed to update profile" }
  }
}

export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { error: "User not found" }
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return { error: "Current password is incorrect" }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating password:", error)
    return { error: "Failed to update password" }
  }
}

export async function updateUserAvatar(userId: string, avatar: string) {
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { avatar },
    })

    const { password, ...userWithoutPassword } = updatedUser
    revalidatePath("/profile")
    return { data: userWithoutPassword }
  } catch (error) {
    console.error("Error updating avatar:", error)
    return { error: "Failed to update avatar" }
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { error: "User not found" }
    }

    const { password, ...userWithoutPassword } = user
    return { data: userWithoutPassword }
  } catch (error) {
    console.error("Error getting user:", error)
    return { error: "Failed to get user" }
  }
}

