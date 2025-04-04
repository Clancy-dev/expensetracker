"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { BudgetItem } from "@/lib/types"
import { BudgetItemForm } from "@/components/budget-item-form"

interface BudgetItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  item: BudgetItem | null
}

export function BudgetItemModal({ isOpen, onClose, onSave, item }: BudgetItemModalProps) {
  const handleSave = () => {
    onSave()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Budget Item" : "Add Budget Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update your budget item details" : "Add a new item to your budget plan"}
          </DialogDescription>
        </DialogHeader>

        <BudgetItemForm item={item} onSave={handleSave} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}

