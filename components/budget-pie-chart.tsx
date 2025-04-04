"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useMobile } from "@/hooks/use-mobile"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

interface BudgetPieChartProps {
  data: { name: string; value: number; color: string }[]
}

export function BudgetPieChart({ data }: BudgetPieChartProps) {
  const { theme } = useTheme()
  const isMobile = useMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const isDark = theme === "dark"
  const textColor = isDark ? "#f9fafb" : "#374151"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={isMobile ? 80 : 100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), ""]}
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: textColor,
          }}
        />
        <Legend
          layout={isMobile ? "horizontal" : "vertical"}
          verticalAlign={isMobile ? "bottom" : "middle"}
          align={isMobile ? "center" : "right"}
          wrapperStyle={isMobile ? { fontSize: "10px" } : { fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

