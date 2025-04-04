"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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

export type TransactionModalProps = {
  type: "income" | "expense"
  isOpen: boolean
  onClose: () => void
  onTransactionAdded: () => void
  userId: string
}

type FormValues = {
  amount: string
  description: string
  categoryId: string
  date: Date
}

export default function TransactionModal({ type, isOpen, onClose, onTransactionAdded, userId }: TransactionModalProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryError, setNewCategoryError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      amount: "",
      description: "",
      categoryId: "",
      date: new Date(),
    },
  })

  const date = watch("date")
  const categoryId = watch("categoryId")

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

  const validateNewCategory = () => {
    if (!newCategoryName.trim()) {
      setNewCategoryError("Please enter a category name")
      return false
    }
    setNewCategoryError(undefined)
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
        setValue("categoryId", result.data.id)
        setNewCategoryName("")
        setIsAddingCategory(false)
        setNewCategoryError(undefined)
      }
    } catch (error) {
      console.error("Error adding category:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (data: FormValues) => {
    console.log(data)
    if (!userId) return
    

    setIsSubmitting(true)

    try {
      // Get current time in HH:MM format
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const currentTime = `${hours}:${minutes}`

      const result = await createTransaction({
        userId,
        amount: Number(data.amount),
        description: data.description,
        categoryId: data.categoryId,
        date: data.date,
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
    reset({
      amount: "",
      description: "",
      categoryId: "",
      date: new Date(),
    })
    setNewCategoryName("")
    setIsAddingCategory(false)
    setNewCategoryError(undefined)
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UGX)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0"
                className={cn(errors.amount && "border-red-500")}
                step="1"
                min="1"
                disabled={isSubmitting}
                {...register("amount", {
                  required: "Please enter a valid amount",
                  min: { value: 1, message: "Amount must be greater than 0" },
                  valueAsNumber: true,
                })}
              />
            </div>
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description"
              className={cn(errors.description && "border-red-500")}
              disabled={isSubmitting}
              {...register("description", {
                required: "Please enter a description",
              })}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
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
                    className={cn(newCategoryError && "border-red-500")}
                    disabled={isSubmitting}
                  />
                  {newCategoryError && <p className="text-sm text-red-500">{newCategoryError}</p>}
                </div>
                <Button type="button" size="icon" onClick={handleAddCategory} disabled={isSubmitting}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Select
                  value={categoryId}
                  onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category" className={cn(errors.categoryId && "border-red-500")}>
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
                {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
                <input
                  type="hidden"
                  {...register("categoryId", {
                    required: "Please select or add a category",
                  })}
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
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
                  onSelect={(newDate) => setValue("date", newDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" {...register("date")} />
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

