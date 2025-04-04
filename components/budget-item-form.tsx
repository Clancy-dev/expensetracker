"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addBudgetItem, updateBudgetItem } from "@/lib/budget-storage"
import type { BudgetItem, BudgetItemPriority } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BudgetItemFormProps {
  item: BudgetItem | null
  onSave: () => void
  onCancel: () => void
}

export function BudgetItemForm({ item, onSave, onCancel }: BudgetItemFormProps) {
  const [name, setName] = useState(item?.name || "")
  const [amount, setAmount] = useState(item?.amount ? item.amount.toString() : "")
  const [priority, setPriority] = useState<BudgetItemPriority>(item?.priority || "most-crucial")
  const [notes, setNotes] = useState(item?.notes || "")
  const [errors, setErrors] = useState<{
    name?: string
    amount?: string
    priority?: string
  }>({})

  const validateForm = () => {
    const newErrors: {
      name?: string
      amount?: string
      priority?: string
    } = {}

    if (!name.trim()) {
      newErrors.name = "Please enter a name"
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
    }

    if (!priority) {
      newErrors.priority = "Please select a priority"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const budgetItem: BudgetItem = {
      id: item?.id || uuidv4(),
      name: name.trim(),
      amount: Number(amount),
      priority,
      notes: notes.trim() || undefined,
    }

    if (item) {
      updateBudgetItem(budgetItem)
    } else {
      addBudgetItem(budgetItem)
    }

    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          placeholder="e.g., Rent, Groceries, Internet"
          className={cn(errors.name && "border-red-500")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (UGX)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="0"
          className={cn(errors.amount && "border-red-500")}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="1"
          min="1"
        />
        {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={(value) => setPriority(value as BudgetItemPriority)}>
          <SelectTrigger id="priority" className={cn(errors.priority && "border-red-500")}>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="most-crucial">Most Crucial</SelectItem>
            <SelectItem value="less-crucial">Less Crucial but Needed</SelectItem>
          </SelectContent>
        </Select>
        {errors.priority && <p className="text-sm text-red-500">{errors.priority}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional details about this budget item"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{item ? "Update" : "Add"} Budget Item</Button>
      </div>
    </form>
  )
}

