"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useMobile } from "@/hooks/use-mobile"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

interface OverviewChartProps {
  incomeData: { name: string; amount: number }[]
  expenseData: { name: string; amount: number }[]
  showOnlyIncome?: boolean
  showOnlyExpenses?: boolean
}

export function OverviewChart({
  incomeData,
  expenseData,
  showOnlyIncome = false,
  showOnlyExpenses = false,
}: OverviewChartProps) {
  const { theme } = useTheme()
  const isMobile = useMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"
  const textColor = isDark ? "#f9fafb" : "#374151"
  const gridColor = isDark ? "#374151" : "#e5e7eb"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={incomeData.map((item, index) => ({
          name: item.name,
          income: item.amount,
          expense: expenseData[index]?.amount || 0,
        }))}
        margin={{
          top: 10,
          right: 10,
          left: isMobile ? 0 : 10,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          tick={{ fill: textColor, fontSize: isMobile ? 10 : 12 }}
          tickLine={{ stroke: gridColor }}
          axisLine={{ stroke: gridColor }}
          tickMargin={8}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: isMobile ? 10 : 12 }}
          tickLine={{ stroke: gridColor }}
          axisLine={{ stroke: gridColor }}
          tickFormatter={(value) => `${value.toLocaleString()}`}
          width={isMobile ? 30 : 60}
        />
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), ""]}
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: gridColor,
            color: textColor,
          }}
        />
        <Legend />
        {!showOnlyExpenses && (
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#4ade80"
            fillOpacity={1}
            fill="url(#colorIncome)"
            strokeWidth={2}
          />
        )}
        {!showOnlyIncome && (
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="#f87171"
            fillOpacity={1}
            fill="url(#colorExpense)"
            strokeWidth={2}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}

