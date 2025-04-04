"use client"

import type { Transaction, Category } from "@/lib/types"
import { getCurrentUserId } from "@/lib/auth-client"

// Default categories
const defaultCategories: Category[] = [
  { id: "1", name: "Salary", type: "income", color: "#4CAF50" },
  { id: "2", name: "Freelance", type: "income", color: "#2196F3" },
  { id: "3", name: "Investments", type: "income", color: "#9C27B0" },
  { id: "4", name: "Other Income", type: "income", color: "#FF9800" },
  { id: "5", name: "Food", type: "expense", color: "#F44336" },
  { id: "6", name: "Transport", type: "expense", color: "#3F51B5" },
  { id: "7", name: "Housing", type: "expense", color: "#009688" },
  { id: "8", name: "Entertainment", type: "expense", color: "#FF5722" },
  { id: "9", name: "Utilities", type: "expense", color: "#795548" },
  { id: "10", name: "Shopping", type: "expense", color: "#E91E63" },
  { id: "11", name: "Other Expense", type: "expense", color: "#607D8B" },
]

// Random color generator for new categories
export const getRandomColor = (): string => {
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

// Helper function to get user-specific storage key
const getUserStorageKey = (key: string): string => {
  const userId = getCurrentUserId()
  return userId ? `${userId}_${key}` : key
}

// Initialize local storage with default data if empty
export const initializeStorage = () => {
  if (typeof window === "undefined") return

  const userId = getCurrentUserId()
  if (!userId) return // Don't initialize if no user is logged in

  const transactionsKey = getUserStorageKey("transactions")
  const categoriesKey = getUserStorageKey("categories")

  if (!localStorage.getItem(transactionsKey)) {
    localStorage.setItem(transactionsKey, JSON.stringify([]))
  }

  if (!localStorage.getItem(categoriesKey)) {
    localStorage.setItem(categoriesKey, JSON.stringify(defaultCategories))
  }
}

// Get all transactions
export const getTransactions = (): Transaction[] => {
  if (typeof window === "undefined") return []

  const key = getUserStorageKey("transactions")
  const transactions = localStorage.getItem(key)
  return transactions ? JSON.parse(transactions) : []
}

// Get transactions by type
export const getTransactionsByType = (type: "income" | "expense"): Transaction[] => {
  const transactions = getTransactions()
  return transactions.filter((transaction) => transaction.type === type)
}

// Add a new transaction
export const addTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions()
  transactions.push(transaction)
  const key = getUserStorageKey("transactions")
  localStorage.setItem(key, JSON.stringify(transactions))
}

// Delete a transaction
export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions()
  const updatedTransactions = transactions.filter((transaction) => transaction.id !== id)
  const key = getUserStorageKey("transactions")
  localStorage.setItem(key, JSON.stringify(updatedTransactions))
}

// Get all categories
export const getCategories = (): Category[] => {
  if (typeof window === "undefined") return defaultCategories

  const key = getUserStorageKey("categories")
  const categories = localStorage.getItem(key)
  return categories ? JSON.parse(categories) : defaultCategories
}

// Get categories by type
export const getCategoriesByType = (type: "income" | "expense"): Category[] => {
  const categories = getCategories()
  return categories.filter((category) => category.type === type)
}

// Add a new category
export const addCategory = (category: Omit<Category, "id" | "color">): void => {
  const categories = getCategories()
  const newCategory: Category = {
    ...category,
    id: Date.now().toString(),
    color: getRandomColor(),
  }

  categories.push(newCategory)
  const key = getUserStorageKey("categories")
  localStorage.setItem(key, JSON.stringify(categories))
}

// Calculate total income
export const getTotalIncome = (): number => {
  const incomeTransactions = getTransactionsByType("income")
  return incomeTransactions.reduce((total, transaction) => total + transaction.amount, 0)
}

// Calculate total expenses
export const getTotalExpenses = (): number => {
  const expenseTransactions = getTransactionsByType("expense")
  return expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0)
}

// Calculate balance
export const getBalance = (): number => {
  return getTotalIncome() - getTotalExpenses()
}

// Get transactions grouped by category for charts
export const getTransactionsByCategory = (
  type: "income" | "expense",
): { name: string; value: number; color: string }[] => {
  const transactions = getTransactionsByType(type)
  const categories = getCategoriesByType(type)

  const result: Record<string, { name: string; value: number; color: string }> = {}

  categories.forEach((category) => {
    result[category.name] = {
      name: category.name,
      value: 0,
      color: category.color,
    }
  })

  transactions.forEach((transaction) => {
    if (result[transaction.category]) {
      result[transaction.category].value += transaction.amount
    } else {
      // Handle transactions with categories that might have been deleted
      result[transaction.category] = {
        name: transaction.category,
        value: transaction.amount,
        color: getRandomColor(),
      }
    }
  })

  return Object.values(result).filter((item) => item.value > 0)
}

// Get monthly data for line chart
export const getMonthlyData = (type: "income" | "expense", months = 6): { name: string; amount: number }[] => {
  const transactions = getTransactionsByType(type)
  const result: { [key: string]: number } = {}

  // Initialize last 6 months with 0
  const today = new Date()
  for (let i = 0; i < months; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
    result[monthYear] = 0
  }

  // Fill in the data
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

    if (result[monthYear] !== undefined) {
      result[monthYear] += transaction.amount
    }
  })

  // Convert to array and reverse to get chronological order
  return Object.entries(result)
    .map(([name, amount]) => ({ name, amount }))
    .reverse()
}

