import { Header } from "@/components/header"
import { BudgetManager } from "@/components/budget-manager"

export default function BudgetPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <BudgetManager />
    </main>
  )
}

