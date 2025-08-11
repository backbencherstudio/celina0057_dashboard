"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { getLegalDocument, saveLegalDocument } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export function useLegalDocuments() {
  const { token, refreshToken } = useAuth()
  const { toast } = useToast()

  const [privacyPolicyContent, setPrivacyPolicyContent] = useState<string>("")
  const [termsConditionsContent, setTermsConditionsContent] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLegalDocuments = useCallback(async () => {
    if (!token) {
      setError("Authentication token missing.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await getLegalDocument()
      setPrivacyPolicyContent(response.data.privacyPolicy || "")
      setTermsConditionsContent(response.data.termsConditions || "")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch legal documents"
      setError(errorMessage)
      if (errorMessage.includes("Invalid") && errorMessage.includes("token")) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
        })
        refreshToken()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [token, refreshToken, toast])

  const saveContent = useCallback(
    async (data: { privacyPolicy?: string; termsConditions?: string }) => {
      if (!token) {
        setError("Authentication token missing.")
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
        })
        refreshToken()
        return
      }

      setSaving(true)
      setError(null)

      try {
        const response = await saveLegalDocument(data, token)
        toast({
          title: "Success",
          description: response.message || "Legal document saved successfully!",
        })
        // Re-fetch to ensure the latest state is reflected, especially if only one field was updated
        await fetchLegalDocuments()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save legal document"
        setError(errorMessage)
        if (errorMessage.includes("Invalid") && errorMessage.includes("token")) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
          })
          refreshToken()
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          })
        }
        throw err // Re-throw to allow component to handle specific error states if needed
      } finally {
        setSaving(false)
      }
    },
    [token, refreshToken, toast, fetchLegalDocuments],
  )

  useEffect(() => {
    fetchLegalDocuments()
  }, [fetchLegalDocuments])

  return {
    privacyPolicyContent,
    setPrivacyPolicyContent,
    termsConditionsContent,
    setTermsConditionsContent,
    loading,
    saving,
    error,
    saveContent,
    refetch: fetchLegalDocuments,
  }
}
