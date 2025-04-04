"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export async function createTransaction(data: {
  userId: string
  amount: number
  description: string
  date: Date
  time?: string
  type: "income" | "expense"
  categoryId: string
}) {
  try {
    const transaction = await db.transaction.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date,
        time: data.time,
        type: data.type,
        userId: data.userId,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/${data.type}`)
    return { data: transaction }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { error: "Failed to create transaction" }
  }
}

export async function getTransactionsByUserId(userId: string) {
  try {
    const transactions = await db.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
    })

    return { data: transactions }
  } catch (error) {
    console.error("Error getting transactions:", error)
    return { error: "Failed to get transactions" }
  }
}

export async function getTransactionsByType(userId: string, type: "income" | "expense") {
  try {
    const transactions = await db.transaction.findMany({
      where: { userId, type },
      include: { category: true },
      orderBy: { date: "desc" },
    })

    return { data: transactions }
  } catch (error) {
    console.error("Error getting transactions by type:", error)
    return { error: "Failed to get transactions" }
  }
}

export async function deleteTransaction(id: string) {
  try {
    await db.transaction.delete({
      where: { id },
    })

    revalidatePath("/dashboard")
    revalidatePath("/income")
    revalidatePath("/expenses")
    return { success: true }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return { error: "Failed to delete transaction" }
  }
}

export async function getTotalIncome(userId: string) {
  try {
    const result = await db.transaction.aggregate({
      where: { userId, type: "income" },
      _sum: { amount: true },
    })

    return { data: result._sum.amount || 0 }
  } catch (error) {
    console.error("Error getting total income:", error)
    return { error: "Failed to get total income" }
  }
}

export async function getTotalExpenses(userId: string) {
  try {
    const result = await db.transaction.aggregate({
      where: { userId, type: "expense" },
      _sum: { amount: true },
    })

    return { data: result._sum.amount || 0 }
  } catch (error) {
    console.error("Error getting total expenses:", error)
    return { error: "Failed to get total expenses" }
  }
}

export async function getTransactionsByCategory(userId: string, type: "income" | "expense") {
  try {
    const categories = await db.category.findMany({
      where: { userId, type },
      include: {
        transactions: {
          where: { userId, type },
        },
      },
    })

    const result = categories
      .map((category) => {
        const totalAmount = category.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
        return {
          name: category.name,
          value: totalAmount,
          color: category.color,
        }
      })
      .filter((item) => item.value > 0)

    return { data: result }
  } catch (error) {
    console.error("Error getting transactions by category:", error)
    return { error: "Failed to get transactions by category" }
  }
}

export async function getMonthlyData(userId: string, type: "income" | "expense", months = 6) {
  try {
    // Get current date
    const today = new Date()
    const result = []

    // Generate data for each month
    for (let i = 0; i < months; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const transactions = await db.transaction.findMany({
        where: {
          userId,
          type,
          date: {
            gte: date,
            lte: endDate,
          },
        },
      })

      const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
      const monthName = date.toLocaleString("default", { month: "short" })
      const year = date.getFullYear()

      result.push({
        name: `${monthName} ${year}`,
        amount: totalAmount,
      })
    }

    return { data: result.reverse() }
  } catch (error) {
    console.error("Error getting monthly data:", error)
    return { error: "Failed to get monthly data" }
  }
}

