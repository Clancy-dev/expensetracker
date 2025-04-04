"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { Transaction, Category } from "@/lib/types"

type TransactionType = "income" | "expense"
import { cn } from "@/lib/utils"
import { getCategoriesByUserId } from "@/actions/category-actions"
import { useEffect } from "react"

interface AddTransactionFormProps {
  type: "income" | "expense"
  onTransactionAdded: () => void
  onCancel: () => void
}

export default function AddTransactionForm({ type, onTransactionAdded, onCancel }: AddTransactionFormProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [categories, setCategories] = useState<Category[]>([])
  
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategoriesByUserId(type)
      if ('data' in result && result.data) {
        setCategories(
          result.data.map((cat) => ({
            ...cat,
            type: cat.type as TransactionType,
          }))
        )
      } else {
        console.error(result.error)
      }
    }
  
    fetchCategories()
  }, [type])
  const [errors, setErrors] = useState<{
    amount?: string
    description?: string
    category?: string
  }>({})

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

    if (!category) {
      newErrors.category = "Please select a category"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Get current time in HH:MM format
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const currentTime = `${hours}:${minutes}`

    const newTransaction: Transaction = {
      id: uuidv4(),
      type,
      amount: Number(amount),
      category,
      description,
      date: date.toISOString(),
      time: currentTime,
    }

     // Replace this with your actual implementation of addTransaction
     console.log("Transaction added:", newTransaction)
    onTransactionAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            className={cn("pl-8", errors.amount && "border-red-500")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0.01"
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
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" className={cn(errors.category && "border-red-500")}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
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

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add {type === "income" ? "Income" : "Expense"}</Button>
      </div>
    </form>
  )
}


