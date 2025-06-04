"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { loginAdmin, updateAdmin } from "@/lib/api"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (formData: FormData) => Promise<void>
  refreshToken: () => void
  checkAuthState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      } catch (error) {
        // If there's an error parsing the user, clear the storage
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await loginAdmin(email, password)

      // Store in localStorage first
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("token", response.token)

      // Then update state
      setUser(response.user)
      setToken(response.token)

      router.push("/feedback")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  const refreshToken = () => {
    // In a real app, you would implement token refresh logic here
    // For now, we'll just log the user out if their token is invalid
    logout()
  }

  const updateProfile = async (formData: FormData) => {
    if (!token) {
      setError("Not authenticated")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await updateAdmin(formData, token)
      setUser(response.user)
      localStorage.setItem("user", JSON.stringify(response.user))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Profile update failed"

      // Check if token is invalid
      if (errorMessage.includes("Invalid") && errorMessage.includes("token")) {
        refreshToken()
        return
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Add this function after the updateProfile function
  const checkAuthState = () => {
    console.log("Current auth state:", {
      user: user,
      token: token?.substring(0, 10) + "...",
      localStorage: {
        user: localStorage.getItem("user") ? "exists" : "missing",
        token: localStorage.getItem("token") ? "exists" : "missing",
      },
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        updateProfile,
        refreshToken,
        checkAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
