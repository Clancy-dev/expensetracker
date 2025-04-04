import { SignJWT, jwtVerify } from "jose"

// Secret key for encryption/decryption
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_this_in_production")

// Encrypt data to a string
export async function encrypt(data: any): Promise<string> {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d") // 30 days
    .sign(secretKey)

  return token
}

// Decrypt data from a string
export async function decrypt<T = any>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as T
  } catch (error) {
    return null
  }
}

