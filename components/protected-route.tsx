"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Add a small delay to ensure auth state is properly checked
    const timer = setTimeout(() => {
      if (!isLoading && !user) {
        console.log("No authenticated user found, redirecting to login")
        router.push("/login")
      } else if (user) {
        console.log("User authenticated in protected route:", user.name)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
