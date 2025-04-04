import { Header } from "@/components/header"
import { ExpenseTracker } from "@/components/expense-tracker"

export default function ExpensesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <ExpenseTracker />
    </main>
  )
}

