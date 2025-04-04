"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  initializeBudgetStorage,
  getBudgetItems,
  getBudgetItemsByPriority,
  getTotalBudget,
  getBudgetTotalByPriority,
} from "@/lib/budget-storage"
import type { BudgetItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { BudgetItemList } from "@/components/budget-item-list"
import { BudgetItemForm } from "@/components/budget-item-form"
import { BudgetPieChart } from "@/components/budget-pie-chart"
import { BudgetItemModal } from "@/components/budget-item-modal"

export function BudgetManager() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [mostCrucialItems, setMostCrucialItems] = useState<BudgetItem[]>([])
  const [lessCrucialItems, setLessCrucialItems] = useState<BudgetItem[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [mostCrucialTotal, setMostCrucialTotal] = useState(0)
  const [lessCrucialTotal, setLessCrucialTotal] = useState(0)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    initializeBudgetStorage()
    updateData()
  }, [])

  const updateData = () => {
    const allItems = getBudgetItems()
    const mostCrucial = getBudgetItemsByPriority("most-crucial")
    const lessCrucial = getBudgetItemsByPriority("less-crucial")

    setBudgetItems(allItems)
    setMostCrucialItems(mostCrucial)
    setLessCrucialItems(lessCrucial)
    setTotalBudget(getTotalBudget())
    setMostCrucialTotal(getBudgetTotalByPriority("most-crucial"))
    setLessCrucialTotal(getBudgetTotalByPriority("less-crucial"))
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setIsAddingItem(true)
  }

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item)
    setIsAddingItem(true)
  }

  const handleItemSaved = () => {
    setIsAddingItem(false)
    setEditingItem(null)
    updateData()
  }

  const handleCancel = () => {
    setIsAddingItem(false)
    setEditingItem(null)
  }

  const handleItemDeleted = () => {
    updateData()
  }

  const getChartData = () => {
    return [
      { name: "Most Crucial", value: mostCrucialTotal, color: "#ef4444" },
      { name: "Less Crucial", value: lessCrucialTotal, color: "#3b82f6" },
    ].filter((item) => item.value > 0)
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Budget Manager</h1>
          <p className="text-muted-foreground">Plan and manage your budget</p>
        </div>
        {!isAddingItem && (
          <Button onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Budget Item
          </Button>
        )}
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Budget</CardTitle>
            <CardDescription>Your total planned budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">{budgetItems.length} items in your budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center pb-2 space-y-0">
            <div>
              <CardTitle>Most Crucial</CardTitle>
              <CardDescription>Essential expenses</CardDescription>
            </div>
            <CheckCircle2 className="w-5 h-5 ml-auto text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{formatCurrency(mostCrucialTotal)}</div>
            <p className="text-xs text-muted-foreground">{mostCrucialItems.length} crucial items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center pb-2 space-y-0">
            <div>
              <CardTitle>Less Crucial</CardTitle>
              <CardDescription>Desired but not essential</CardDescription>
            </div>
            <AlertCircle className="w-5 h-5 ml-auto text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{formatCurrency(lessCrucialTotal)}</div>
            <p className="text-xs text-muted-foreground">{lessCrucialItems.length} less crucial items</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-2">
        {isAddingItem ? (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>{editingItem ? "Edit Budget Item" : "Add Budget Item"}</CardTitle>
              <CardDescription>
                {editingItem ? "Update your budget item details" : "Add a new item to your budget plan"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetItemForm item={editingItem} onSave={handleItemSaved} onCancel={handleCancel} />
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
                <CardDescription>Distribution of your budget by priority</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <BudgetPieChart data={getChartData()} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
                <CardDescription>Overview of your budget allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Budget</div>
                    <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Most Crucial</div>
                      <div className="text-xl font-bold text-red-500">{formatCurrency(mostCrucialTotal)}</div>
                      <div className="text-sm text-muted-foreground">
                        {mostCrucialTotal > 0
                          ? `${Math.round((mostCrucialTotal / totalBudget) * 100)}% of total`
                          : "0% of total"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Less Crucial</div>
                      <div className="text-xl font-bold text-blue-500">{formatCurrency(lessCrucialTotal)}</div>
                      <div className="text-sm text-muted-foreground">
                        {lessCrucialTotal > 0
                          ? `${Math.round((lessCrucialTotal / totalBudget) * 100)}% of total`
                          : "0% of total"}
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleAddItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Budget Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Items</CardTitle>
          <CardDescription>Manage your budget items</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="most-crucial">Most Crucial</TabsTrigger>
              <TabsTrigger value="less-crucial">Less Crucial</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <BudgetItemList items={budgetItems} onEdit={handleEditItem} onDelete={handleItemDeleted} />
            </TabsContent>
            <TabsContent value="most-crucial" className="mt-4">
              <BudgetItemList items={mostCrucialItems} onEdit={handleEditItem} onDelete={handleItemDeleted} />
            </TabsContent>
            <TabsContent value="less-crucial" className="mt-4">
              <BudgetItemList items={lessCrucialItems} onEdit={handleEditItem} onDelete={handleItemDeleted} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <BudgetItemModal isOpen={isAddingItem} onClose={handleCancel} onSave={handleItemSaved} item={editingItem} />
    </div>
  )
}

