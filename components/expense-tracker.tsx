"use client"

import { useEffect, useState } from "react"
import { ArrowDownIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { initializeStorage, getTransactionsByType, getTotalExpenses, getTransactionsByCategory } from "@/lib/storage"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { TransactionList } from "@/components/transaction-list"
import { TransactionModal } from "@/components/transaction-modal"
import { CategoryChart } from "@/components/category-chart"

export function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([])

  useEffect(() => {
    initializeStorage()
    updateData()
  }, [])

  const updateData = () => {
    const expenseTransactions = getTransactionsByType("expense")
    setTransactions(expenseTransactions)
    setTotalExpenses(getTotalExpenses())
    setCategoryData(getTransactionsByCategory("expense"))
  }

  const handleAddTransaction = () => {
    setIsAddingTransaction(true)
  }

  const handleTransactionAdded = () => {
    setIsAddingTransaction(false)
    updateData()
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <p className="text-muted-foreground">Manage and track your expenses</p>
        </div>
        <Button onClick={handleAddTransaction} className="bg-red-600 hover:bg-red-700">
          <ArrowDownIcon className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>Your total expenses from all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Distribution of your spending</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <CategoryChart data={categoryData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
            <CardDescription>Overview of your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Expenses</div>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Number of Transactions</div>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Categories</div>
                <div className="text-2xl font-bold">{categoryData.length}</div>
              </div>
              <Button onClick={handleAddTransaction} className="w-full bg-red-600 hover:bg-red-700">
                <ArrowDownIcon className="w-4 h-4 mr-2" />
                Add New Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>All your recorded expense transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={transactions} onTransactionDeleted={updateData} />
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      <TransactionModal
        type="expense"
        isOpen={isAddingTransaction}
        onClose={() => setIsAddingTransaction(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  )
}

