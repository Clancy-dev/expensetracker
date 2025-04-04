"use client"

import { useEffect, useState } from "react"
import { ArrowUpIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { TransactionList } from "@/components/transaction-list"
import { CategoryChart } from "@/components/category-chart"
import { getTotalIncome, getTransactionsByUserId } from "@/actions/transaction-actions"
import TransactionModal from "./transaction-modal"

export function IncomeTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([])

  useEffect(() => {
    // initializeStorage()
    updateData()
  }, [])

  const updateData = () => {
    getTransactionsByUserId("income").then((response) => {
          if (response.data) {
            setTransactions(response.data.map((transaction: any) => ({
              ...transaction,
              type: transaction.type as Transaction["type"], // Ensure type matches TransactionType
            })))
          } else {
            // console.error(response.error)
            return Error

          }
        })
    getTotalIncome("income").then((result) => {
      if (result.data !== undefined) {
        setTotalIncome(result.data)
      } else {
        // console.error(result.error)
        return Error
      }
    })
    setCategoryData(
      transactions
        .filter((transaction) => transaction.type === "income")
        .reduce((acc, transaction) => {
          const category = acc.find((cat) => cat.name === transaction.category);
          if (category) {
            category.value += transaction.amount;
          } else {
            acc.push({ name: transaction.category, value: transaction.amount, color: "#"+((1<<24)*Math.random()|0).toString(16) });
          }
          return acc;
        }, [] as { name: string; value: number; color: string }[])
    )
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
        userId="income"
      />
    </div>
  )
}

