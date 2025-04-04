import { Header } from "@/components/header"
import { IncomeTracker } from "@/components/income-tracker"

export default function IncomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <IncomeTracker />
    </main>
  )
}

