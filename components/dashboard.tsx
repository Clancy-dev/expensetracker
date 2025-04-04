"use client"

import { useEffect, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, PiggyBank } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { TransactionList } from "@/components/transaction-list"
import { TransactionModal } from "@/components/transaction-modal"
import { OverviewChart } from "@/components/overview-chart"
import { Greeting } from "@/components/greeting"
import { getCurrentUser } from "@/lib/auth-client"
import {
  getTransactionsByUserId,
  getTotalIncome,
  getTotalExpenses,
  getMonthlyData,
} from "@/actions/transaction-actions"

export function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [balance, setBalance] = useState(0)
  const [isAddingIncome, setIsAddingIncome] = useState(false)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [monthlyIncome, setMonthlyIncome] = useState<{ name: string; amount: number }[]>([])
  const [monthlyExpenses, setMonthlyExpenses] = useState<{ name: string; amount: number }[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setUserId(user.id)
      fetchData(user.id)
    }
  }, [])

  const fetchData = async (userId: string) => {
    setIsLoading(true)
    try {
      // Fetch transactions
      const transactionsResult = await getTransactionsByUserId(userId)
      if (transactionsResult.data) {
        setTransactions(transactionsResult.data.slice(0, 5)) // Show only the latest 5 transactions
      }

      // Fetch total income
      const incomeResult = await getTotalIncome(userId)
      if (incomeResult.data !== undefined) {
        setTotalIncome(incomeResult.data)
      }

      // Fetch total expenses
      const expensesResult = await getTotalExpenses(userId)
      if (expensesResult.data !== undefined) {
        setTotalExpenses(expensesResult.data)
      }

      // Calculate balance
      setBalance((incomeResult.data || 0) - (expensesResult.data || 0))

      // Fetch monthly data
      const monthlyIncomeResult = await getMonthlyData(userId, "income")
      if (monthlyIncomeResult.data) {
        setMonthlyIncome(monthlyIncomeResult.data)
      }

      const monthlyExpensesResult = await getMonthlyData(userId, "expense")
      if (monthlyExpensesResult.data) {
        setMonthlyExpenses(monthlyExpensesResult.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddIncome = () => {
    setIsAddingIncome(true)
  }

  const handleAddExpense = () => {
    setIsAddingExpense(true)
  }

  const handleTransactionAdded = () => {
    setIsAddingIncome(false)
    setIsAddingExpense(false)
    if (userId) {
      fetchData(userId)
    }
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <Greeting />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <PiggyBank className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground">Your current balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpIcon className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">All time income</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownIcon className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">All time expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your financial activity over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <OverviewChart incomeData={monthlyIncome} expenseData={monthlyExpenses} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
              <Button
                onClick={handleAddIncome}
                variant="outline"
                className="bg-green-50 hover:bg-green-100 border-green-200"
              >
                <ArrowUpIcon className="w-4 h-4 mr-2 text-green-500" />
                Add Income
              </Button>
              <Button
                onClick={handleAddExpense}
                variant="outline"
                className="bg-red-50 hover:bg-red-100 border-red-200"
              >
                <ArrowDownIcon className="w-4 h-4 mr-2 text-red-500" />
                Add Expense
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={transactions}
              onTransactionDeleted={() => userId && fetchData(userId)}
              showViewAll
            />
          </CardContent>
        </Card>
      </div>

      {/* Transaction Modals */}
      {userId && (
        <>
          <TransactionModal
            type="income"
            isOpen={isAddingIncome}
            onClose={() => setIsAddingIncome(false)}
            onTransactionAdded={handleTransactionAdded}
            userId={userId}
          />

          <TransactionModal
            type="expense"
            isOpen={isAddingExpense}
            onClose={() => setIsAddingExpense(false)}
            onTransactionAdded={handleTransactionAdded}
            userId={userId}
          />
        </>
      )}
    </div>
  )
}

