"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export async function createBudgetItem(data: {
  userId: string
  name: string
  amount: number
  priority: "most-crucial" | "less-crucial"
  notes?: string
}) {
  try {
    const budgetItem = await db.budgetItem.create({
      data: {
        name: data.name,
        amount: data.amount,
        priority: data.priority,
        notes: data.notes,
        userId: data.userId,
      },
    })

    revalidatePath("/budget")
    return { data: budgetItem }
  } catch (error) {
    console.error("Error creating budget item:", error)
    return { error: "Failed to create budget item" }
  }
}

export async function getBudgetItemsByUserId(userId: string) {
  try {
    const budgetItems = await db.budgetItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return { data: budgetItems }
  } catch (error) {
    console.error("Error getting budget items:", error)
    return { error: "Failed to get budget items" }
  }
}

export async function getBudgetItemsByPriority(userId: string, priority: "most-crucial" | "less-crucial") {
  try {
    const budgetItems = await db.budgetItem.findMany({
      where: { userId, priority },
      orderBy: { createdAt: "desc" },
    })

    return { data: budgetItems }
  } catch (error) {
    console.error("Error getting budget items by priority:", error)
    return { error: "Failed to get budget items by priority" }
  }
}

export async function updateBudgetItem(
  id: string,
  data: {
    name: string
    amount: number
    priority: "most-crucial" | "less-crucial"
    notes?: string
  },
) {
  try {
    const budgetItem = await db.budgetItem.update({
      where: { id },
      data: {
        name: data.name,
        amount: data.amount,
        priority: data.priority,
        notes: data.notes,
      },
    })

    revalidatePath("/budget")
    return { data: budgetItem }
  } catch (error) {
    console.error("Error updating budget item:", error)
    return { error: "Failed to update budget item" }
  }
}

export async function deleteBudgetItem(id: string) {
  try {
    await db.budgetItem.delete({
      where: { id },
    })

    revalidatePath("/budget")
    return { success: true }
  } catch (error) {
    console.error("Error deleting budget item:", error)
    return { error: "Failed to delete budget item" }
  }
}

export async function getTotalBudget(userId: string) {
  try {
    const result = await db.budgetItem.aggregate({
      where: { userId },
      _sum: { amount: true },
    })

    return { data: result._sum.amount || 0 }
  } catch (error) {
    console.error("Error getting total budget:", error)
    return { error: "Failed to get total budget" }
  }
}

export async function getBudgetTotalByPriority(userId: string, priority: "most-crucial" | "less-crucial") {
  try {
    const result = await db.budgetItem.aggregate({
      where: { userId, priority },
      _sum: { amount: true },
    })

    return { data: result._sum.amount || 0 }
  } catch (error) {
    console.error("Error getting budget total by priority:", error)
    return { error: "Failed to get budget total by priority" }
  }
}

