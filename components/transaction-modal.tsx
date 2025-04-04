"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { createTransaction } from "@/actions/transaction-actions"
import { createCategory, getCategoriesByType, getRandomColor } from "@/actions/category-actions"

interface TransactionModalProps {
  type: "income" | "expense"
  isOpen: boolean
  onClose: () => void
  onTransactionAdded: () => void
  userId: string
}

export function TransactionModal({ type, isOpen, onClose, onTransactionAdded, userId }: TransactionModalProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [categories, setCategories] = useState<any[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [errors, setErrors] = useState<{
    amount?: string
    description?: string
    category?: string
    newCategory?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      fetchCategories()
    }
  }, [isOpen, userId])

  const fetchCategories = async () => {
    if (!userId) return

    const result = await getCategoriesByType(userId, type)
    if (result.data) {
      setCategories(result.data)
    }
  }

  const validateForm = () => {
    const newErrors: {
      amount?: string
      description?: string
      category?: string
    } = {}

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
    }

    if (!description.trim()) {
      newErrors.description = "Please enter a description"
    }

    if (!categoryId && !isAddingCategory) {
      newErrors.category = "Please select or add a category"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateNewCategory = () => {
    if (!newCategoryName.trim()) {
      setErrors((prev) => ({ ...prev, newCategory: "Please enter a category name" }))
      return false
    }
    return true
  }

  const handleAddCategory = async () => {
    if (!validateNewCategory() || !userId) return

    setIsSubmitting(true)

    try {
      const color = await getRandomColor()
      const result = await createCategory({
        name: newCategoryName.trim(),
        type,
        color,
        userId,
      })

      if (result.data) {
        await fetchCategories()
        setCategoryId(result.data.id)
        setNewCategoryName("")
        setIsAddingCategory(false)
        setErrors((prev) => ({ ...prev, newCategory: undefined }))
      }
    } catch (error) {
      console.error("Error adding category:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !userId) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get current time in HH:MM format
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const currentTime = `${hours}:${minutes}`

      const result = await createTransaction({
        userId,
        amount: Number(amount),
        description,
        categoryId,
        date,
        time: currentTime,
        type,
      })

      if (result.data) {
        resetForm()
        onTransactionAdded()
      } else if (result.error) {
        console.error(result.error)
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAmount("")
    setDescription("")
    setCategoryId("")
    setDate(new Date())
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add {type === "income" ? "Income" : "Expense"}</DialogTitle>
          <DialogDescription>
            Enter the details of your {type === "income" ? "income" : "expense"} transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UGX)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0"
                className={cn(errors.amount && "border-red-500")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="1"
                min="1"
                disabled={isSubmitting}
              />
            </div>
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description"
              className={cn(errors.description && "border-red-500")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="category">Category</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="h-8 px-2 text-xs"
                disabled={isSubmitting}
              >
                {isAddingCategory ? "Select Existing" : "Add New Category"}
              </Button>
            </div>

            {isAddingCategory ? (
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={cn(errors.newCategory && "border-red-500")}
                    disabled={isSubmitting}
                  />
                  {errors.newCategory && <p className="text-sm text-red-500">{errors.newCategory}</p>}
                </div>
                <Button type="button" size="icon" onClick={handleAddCategory} disabled={isSubmitting}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={isSubmitting}>
                  <SelectTrigger id="category" className={cn(errors.category && "border-red-500")}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => setDate(newDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </div>
              ) : (
                `Add ${type === "income" ? "Income" : "Expense"}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

