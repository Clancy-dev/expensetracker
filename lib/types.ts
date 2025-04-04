export type TransactionType = "income" | "expense"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
  time?: string // Add time field
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  color: string
}

export type BudgetItemPriority = "most-crucial" | "less-crucial"

export interface BudgetItem {
  id: string
  name: string
  amount: number
  priority: BudgetItemPriority
  notes?: string
}

