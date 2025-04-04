"use client"

import { useEffect, useState } from "react"
import { ArrowUpIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { initializeStorage, getTransactionsByType, getTotalIncome, getTransactionsByCategory } from "@/lib/storage"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { TransactionList } from "@/components/transaction-list"
import { TransactionModal } from "@/components/transaction-modal"
import { CategoryChart } from "@/components/category-chart"

export function IncomeTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([])

  useEffect(() => {
    initializeStorage()
    updateData()
  }, [])

  const updateData = () => {
    const incomeTransactions = getTransactionsByType("income")
    setTransactions(incomeTransactions)
    setTotalIncome(getTotalIncome())
    setCategoryData(getTransactionsByCategory("income"))
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
          <h1 className="text-2xl font-bold">Income Tracker</h1>
          <p className="text-muted-foreground">Manage and track your income sources</p>
        </div>
        <Button onClick={handleAddTransaction} className="bg-green-600 hover:bg-green-700">
          <ArrowUpIcon className="w-4 h-4 mr-2" />
          Add Income
        </Button>
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Income</CardTitle>
            <CardDescription>Your total income from all sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
            <CardDescription>Distribution of your income sources</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <CategoryChart data={categoryData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Summary</CardTitle>
            <CardDescription>Overview of your income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Income</div>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Number of Transactions</div>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Categories</div>
                <div className="text-2xl font-bold">{categoryData.length}</div>
              </div>
              <Button onClick={handleAddTransaction} className="w-full bg-green-600 hover:bg-green-700">
                <ArrowUpIcon className="w-4 h-4 mr-2" />
                Add New Income
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>All your recorded income transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={transactions} onTransactionDeleted={updateData} />
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      <TransactionModal
        type="income"
        isOpen={isAddingTransaction}
        onClose={() => setIsAddingTransaction(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  )
}

