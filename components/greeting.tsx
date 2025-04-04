"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth-client"

export function Greeting() {
  const [greeting, setGreeting] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      // Handle case where fullName might be empty or undefined
      const firstName = currentUser.fullName ? currentUser.fullName.split(" ")[0] : "User"
      setUserName(firstName)
    }

    const hour = new Date().getHours()
    let greetingText = ""

    if (hour < 12) {
      greetingText = "Good Morning"
    } else if (hour < 18) {
      greetingText = "Good Afternoon"
    } else {
      greetingText = "Good Evening"
    }

    setGreeting(greetingText)
  }, [])

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to track your finances today?",
      "Let's make smart financial decisions today!",
      "Stay on top of your expenses and reach your goals.",
      "Financial freedom begins with tracking every shilling.",
      "Your financial journey is looking great!",
      "Take control of your money and secure your future.",
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (!userName) return null

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        {greeting}, {userName}!
      </h1>
      <p className="text-muted-foreground">{getMotivationalMessage()}</p>
    </div>
  )
}

