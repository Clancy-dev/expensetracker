import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/actions/user-actions"
import { createSession } from "@/lib/session"
import { initializeDefaultCategories } from "@/actions/category-actions"

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password } = await request.json()

    // Create new user
    const result = await createUser({
      fullName,
      email,
      password,
    })

    if (!result || "error" in result) {
      return NextResponse.json(
        {
          data: null,
          error: result?.error || "Failed to create user",
        },
        {
          status: result?.error === "Email already exists" ? 409 : 500,
        },
      )
    }

    if ("data" in result) {
      const user = result.data

      // Create session
      await createSession({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      })

      // Initialize default categories for the new user
      await initializeDefaultCategories(user.id)

      return NextResponse.json(
        {
          data: user,
          error: null,
        },
        {
          status: 201,
        },
      )
    } else {
      return NextResponse.json(
        {
          data: null,
          error: "Unexpected result format",
        },
        {
          status: 500,
        },
      )
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "An error occurred during sign up",
      },
      {
        status: 500,
      },
    )
  }
}

