"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDownIcon, ArrowUpIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatCurrency } from "@/lib/utils"
import { deleteTransaction } from "@/actions/transaction-actions"

interface TransactionListProps {
  transactions: any[]
  onTransactionDeleted: () => void
  showViewAll?: boolean
  title?: string
}

export function TransactionList({
  transactions,
  onTransactionDeleted,
  showViewAll = false,
  title,
}: TransactionListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      setIsDeleting(true)
      try {
        const result = await deleteTransaction(transactionToDelete)
        if (result.success) {
          onTransactionDeleted()
        }
      } catch (error) {
        console.error("Error deleting transaction:", error)
      } finally {
        setIsDeleting(false)
        setIsDeleteDialogOpen(false)
        setTransactionToDelete(null)
      }
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setTransactionToDelete(null)
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-muted-foreground">No transactions found</p>
        {showViewAll && (
          <div className="mt-4">
            <Link href="/income">
              <Button variant="outline" size="sm" className="mx-2">
                Go to Income
              </Button>
            </Link>
            <Link href="/expenses">
              <Button variant="outline" size="sm" className="mx-2">
                Go to Expenses
              </Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.time || "N/A"}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category?.name || "Unknown"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    {transaction.type === "income" ? (
                      <ArrowUpIcon className="w-4 h-4 mr-1 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 mr-1 text-red-500" />
                    )}
                    <span className={transaction.type === "income" ? "text-green-500" : "text-red-500"}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(transaction.id)}
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showViewAll && transactions.length > 0 && (
        <div className="flex justify-center mt-4">
          <Link href="/income">
            <Button variant="outline" size="sm" className="mx-2">
              View All Income
            </Button>
          </Link>
          <Link href="/expenses">
            <Button variant="outline" size="sm" className="mx-2">
              View All Expenses
            </Button>
          </Link>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

