import { type NextRequest, NextResponse } from "next/server"
import { verifyCredentials } from "@/actions/user-actions"
import { createSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Verify user credentials
    const { data, error } = await verifyCredentials(email, password)

    if (error || !data) {
      return NextResponse.json(
        {
          data: null,
          error: error || "Invalid email or password",
        },
        {
          status: 403,
        },
      )
    }

    // Create session
    await createSession({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
    })

    return NextResponse.json(
      {
        data,
        error: null,
      },
      {
        status: 200,
      },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        data: null,
        error: "An error occurred during login",
      },
      {
        status: 500,
      },
    )
  }
}

