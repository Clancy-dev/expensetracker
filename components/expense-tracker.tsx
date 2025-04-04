"use client"

import { useEffect, useState } from "react"
import { ArrowDownIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { TransactionList } from "@/components/transaction-list"
import { CategoryChart } from "@/components/category-chart"
import { getTotalExpenses, getTransactionsByType, getTransactionsByUserId } from "@/actions/transaction-actions"
import TransactionModal from "./transaction-modal"

export function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([])

  useEffect(() => {
    updateData()
  }, [])

  const updateData = () => {
    const expenseTransactions = getTransactionsByUserId("expense")
    expenseTransactions.then((response) => {
      if (response.data) {
        setTransactions(response.data.map((transaction: any) => ({
          ...transaction,
          type: transaction.type as Transaction["type"], // Ensure type matches TransactionType
        })))
      } else {
        console.error("Error fetching transactions:", response.error)
      }
    }).catch((error) => {
      console.error("Unexpected error fetching transactions:", error)
    })
    getTotalExpenses("user-id").then((response) => {
      if (response.data !== undefined) {
        setTotalExpenses(response.data)
      } else {
        console.error("Error fetching total expenses:", response.error)
      }
    }).catch((error) => {
      console.error("Unexpected error fetching total expenses:", error)
    })
    getTransactionsByUserId("expense").then((response) => {
      if (response.data) {
        const formattedData = response.data.map((transaction) => ({
          name: transaction.category.name,
          value: transaction.amount,
          color: transaction.category.color,
        }))
        setCategoryData(formattedData)
      }
    }).catch((error) => {
      console.error("Error fetching category data:", error)
    })
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
        userId="user-id" // Replace "user-id" with the actual user ID if available
      />
    </div>
  )
}

