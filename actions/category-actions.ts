"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export async function createCategory(data: {
  userId: string
  name: string
  type: "income" | "expense"
  color: string
}) {
  try {
    const category = await db.category.create({
      data: {
        name: data.name,
        type: data.type,
        color: data.color,
        userId: data.userId,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/${data.type}`)
    return { data: category }
  } catch (error) {
    console.error("Error creating category:", error)
    return { error: "Failed to create category" }
  }
}

export async function getCategoriesByUserId(userId: string) {
  try {
    const categories = await db.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    })

    return { data: categories }
  } catch (error) {
    console.error("Error getting categories:", error)
    return { error: "Failed to get categories" }
  }
}

export async function getCategoriesByType(userId: string, type: "income" | "expense") {
  try {
    const categories = await db.category.findMany({
      where: { userId, type },
      orderBy: { name: "asc" },
    })

    return { data: categories }
  } catch (error) {
    console.error("Error getting categories by type:", error)
    return { error: "Failed to get categories by type" }
  }
}

export async function initializeDefaultCategories(userId: string) {
  try {
    const defaultCategories = [
      { name: "Salary", type: "income", color: "#4CAF50" },
      { name: "Freelance", type: "income", color: "#2196F3" },
      { name: "Investments", type: "income", color: "#9C27B0" },
      { name: "Other Income", type: "income", color: "#FF9800" },
      { name: "Food", type: "expense", color: "#F44336" },
      { name: "Transport", type: "expense", color: "#3F51B5" },
      { name: "Housing", type: "expense", color: "#009688" },
      { name: "Entertainment", type: "expense", color: "#FF5722" },
      { name: "Utilities", type: "expense", color: "#795548" },
      { name: "Shopping", type: "expense", color: "#E91E63" },
      { name: "Other Expense", type: "expense", color: "#607D8B" },
    ]

    // Check if user already has categories
    const existingCategories = await db.category.findMany({
      where: { userId },
    })

    if (existingCategories.length === 0) {
      // Create default categories
      await Promise.all(
        defaultCategories.map(async (category) => {
          await db.category.create({
            data: {
              name: category.name,
              type: category.type as "income" | "expense",
              color: category.color,
              userId,
            },
          })
        }),
      )
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing default categories:", error)
    return { error: "Failed to initialize default categories" }
  }
}

export async function getRandomColor() {
  const colors = [
    "#4CAF50",
    "#2196F3",
    "#9C27B0",
    "#FF9800",
    "#F44336",
    "#3F51B5",
    "#009688",
    "#FF5722",
    "#795548",
    "#E91E63",
    "#607D8B",
    "#673AB7",
    "#FFC107",
    "#00BCD4",
    "#8BC34A",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

