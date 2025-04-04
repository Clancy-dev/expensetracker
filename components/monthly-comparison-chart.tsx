"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useMobile } from "@/hooks/use-mobile"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

interface MonthlyComparisonChartProps {
  incomeData: { name: string; amount: number }[]
  expenseData: { name: string; amount: number }[]
}

export function MonthlyComparisonChart({ incomeData, expenseData }: MonthlyComparisonChartProps) {
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

  // Combine data for the chart
  const chartData = incomeData.map((item, index) => ({
    name: item.name,
    income: item.amount,
    expense: expenseData[index]?.amount || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          left: isMobile ? 0 : 10,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
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
          tickFormatter={(value) => `$${value}`}
          width={isMobile ? 30 : 60}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), ""]}
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: gridColor,
            color: textColor,
          }}
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#4ade80" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

