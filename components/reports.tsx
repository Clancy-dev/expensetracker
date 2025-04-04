"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { OverviewChart } from "@/components/overview-chart"
import { CategoryChart } from "@/components/category-chart"
import { MonthlyComparisonChart } from "@/components/monthly-comparison-chart"
import { getMonthlyData, getTotalExpenses, getTotalIncome, getTransactionsByCategory} from "@/actions/transaction-actions"

export function Reports() {
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [balance, setBalance] = useState(0)
  const [incomeByCategory, setIncomeByCategory] = useState<{ name: string; value: number; color: string }[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<{ name: string; value: number; color: string }[]>([])
  const [monthlyIncome, setMonthlyIncome] = useState<{ name: string; amount: number }[]>([])
  const [monthlyExpenses, setMonthlyExpenses] = useState<{ name: string; amount: number }[]>([])

  useEffect(() => {
    // initializeStorage()
    updateData()
  }, [])

  const updateData = () => {
    getTotalIncome("user-id").then((result) => {
      if (result.data !== undefined) {
        setTotalIncome(result.data)
      } else {
        console.error(result.error)
      }
    })
    getTotalExpenses("user-id").then((result) => {
      if (result.data !== undefined) {
        setTotalExpenses(result.data)
      } else {
        console.error(result.error)
      }
    })
    getTotalIncome("user-id").then((result) => {
      if (result.data !== undefined) {
        setBalance(result.data)
      } else {
        console.error(result.error)
      }
    })
    getTransactionsByCategory("user-id", "income").then((result) => {
      if (result.data !== undefined) {
        setIncomeByCategory(result.data)
      } else {
        console.error(result.error)
      }
    })
    getTransactionsByCategory("user-id", "expense").then((result) => {
      if (result.data !== undefined) {
        setExpensesByCategory(result.data)
      } else {
        console.error(result.error)
      }
    })
    getMonthlyData("user-id", "income").then((result) => {
      if (result.data !== undefined) {
        setMonthlyIncome(result.data)
      } else {
        console.error(result.error)
      }
    })
    getMonthlyData("user-id", "expense").then((result) => {
      if (result.data !== undefined) {
        setMonthlyExpenses(result.data)
      } else {
        console.error(result.error)
      }
    })
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground">Analyze your financial data with visual reports</p>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
                <CardDescription>Income vs Expenses over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[400px]">
                  <OverviewChart incomeData={monthlyIncome} expenseData={monthlyExpenses} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
                <CardDescription>Side by side comparison of income and expenses</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[400px]">
                  <MonthlyComparisonChart incomeData={monthlyIncome} expenseData={monthlyExpenses} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="income">
          <div className="grid gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Income by Category</CardTitle>
                <CardDescription>Distribution of your income sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <CategoryChart data={incomeByCategory} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income Trend</CardTitle>
                <CardDescription>Your income over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[400px]">
                  <OverviewChart incomeData={monthlyIncome} expenseData={[]} showOnlyIncome />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="expenses">
          <div className="grid gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>Distribution of your spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <CategoryChart data={expensesByCategory} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses Trend</CardTitle>
                <CardDescription>Your expenses over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[400px]">
                  <OverviewChart incomeData={[]} expenseData={monthlyExpenses} showOnlyExpenses />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

