import "server-only"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

// Define the Session type to match what's expected in RootLayout
export type Session = {
  userId: string
  email: string
  fullName: string
}


// SECRET
const secretKey = new TextEncoder().encode(process.env.SECRET_KEY)
if (!secretKey) {
  throw new Error("SECRET_KEY is not defined in the environment variables.")
}

// ENCRYPTING THE PAYLOAD DATA INTO A TOKEN
export async function encrypt(payload: Omit<Session, "exp"> & { expiresAt: Date }) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secretKey)
}

// DECRYPTING THE TOKEN TO GET BACK OUR PAYLOAD DATA
export async function decrypt(session: string | undefined = ""): Promise<any> {
  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, secretKey, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.log("Failed to verify session")
    return null
  }
}

// Get the current session
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  const payload = await decrypt(token)

  if (!payload) return null

  // Return the session in the expected format
  return {
    userId: payload.userId,
    email: payload.email,
    fullName: payload.fullName,
  }
}

export async function createSession(user: { id: string; email: string; fullName: string }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const payloadData = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    expiresAt: expiresAt,
  }

  const session = await encrypt(payloadData)
  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

// Prevent someone logging in after use everytime, auto check and update the session time
export async function updateSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

