"use client"

import type { BudgetItem, BudgetItemPriority } from "@/lib/types"
import { getCurrentUserId } from "@/lib/auth-client"

// Helper function to get user-specific storage key
const getUserStorageKey = (key: string): string => {
  const userId = getCurrentUserId()
  return userId ? `${userId}_${key}` : key
}

// Initialize budget storage
export const initializeBudgetStorage = () => {
  if (typeof window === "undefined") return

  const userId = getCurrentUserId()
  if (!userId) return // Don't initialize if no user is logged in

  const budgetItemsKey = getUserStorageKey("budgetItems")

  if (!localStorage.getItem(budgetItemsKey)) {
    localStorage.setItem(budgetItemsKey, JSON.stringify([]))
  }
}

// Get all budget items
export const getBudgetItems = (): BudgetItem[] => {
  if (typeof window === "undefined") return []

  const key = getUserStorageKey("budgetItems")
  const items = localStorage.getItem(key)
  return items ? JSON.parse(items) : []
}

// Get budget items by priority
export const getBudgetItemsByPriority = (priority: BudgetItemPriority): BudgetItem[] => {
  const items = getBudgetItems()
  return items.filter((item) => item.priority === priority)
}

// Add a new budget item
export const addBudgetItem = (item: BudgetItem): void => {
  const items = getBudgetItems()
  items.push(item)
  const key = getUserStorageKey("budgetItems")
  localStorage.setItem(key, JSON.stringify(items))
}

// Update a budget item
export const updateBudgetItem = (updatedItem: BudgetItem): void => {
  const items = getBudgetItems()
  const index = items.findIndex((item) => item.id === updatedItem.id)

  if (index !== -1) {
    items[index] = updatedItem
    const key = getUserStorageKey("budgetItems")
    localStorage.setItem(key, JSON.stringify(items))
  }
}

// Delete a budget item
export const deleteBudgetItem = (id: string): void => {
  const items = getBudgetItems()
  const updatedItems = items.filter((item) => item.id !== id)
  const key = getUserStorageKey("budgetItems")
  localStorage.setItem(key, JSON.stringify(updatedItems))
}

// Calculate total budget
export const getTotalBudget = (): number => {
  const items = getBudgetItems()
  return items.reduce((total, item) => total + item.amount, 0)
}

// Calculate budget total by priority
export const getBudgetTotalByPriority = (priority: BudgetItemPriority): number => {
  const items = getBudgetItemsByPriority(priority)
  return items.reduce((total, item) => total + item.amount, 0)
}

