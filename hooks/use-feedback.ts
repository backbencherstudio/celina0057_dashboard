"use client"

import { useCallback, useEffect } from "react"
import { useApp } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { getFeedbacks, deleteFeedback } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

export function useFeedback() {
  const { state, dispatch } = useApp()
  const { token, refreshToken } = useAuth()
  const { toast } = useToast()

  const { feedback } = state
  const { data, loading, error, pagination, lastFetch, sortBy, order } = feedback

  // Check if data needs to be fetched
  const shouldFetch = useCallback(() => {
    if (!lastFetch) return true
    if (Date.now() - lastFetch > CACHE_DURATION) return true
    return false
  }, [lastFetch])

  // Fetch feedback
  const fetchFeedback = useCallback(
    async (force = false) => {
      if (!token) return
      if (!force && !shouldFetch()) return

      dispatch({ type: "FEEDBACK_LOADING" })

      try {
        console.log("Fetching feedback with params:", {
          page: pagination.currentPage,
          limit: pagination.limit,
          sortBy,
          order,
        })

        const response = await getFeedbacks(pagination.currentPage, pagination.limit, sortBy, order, token)

        console.log("Feedback API response:", response)

        dispatch({
          type: "FEEDBACK_SUCCESS",
          payload: {
            data: response.data,
            total: response.total,
            page: response.page,
            limit: response.limit,
          },
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch feedback"
        dispatch({ type: "FEEDBACK_ERROR", payload: errorMessage })

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
      }
    },
    [token, pagination.currentPage, pagination.limit, sortBy, order, shouldFetch, dispatch, toast, refreshToken],
  )

  // Delete feedback
  const removeFeedback = useCallback(
    async (id: string) => {
      if (!token) return

      try {
        await deleteFeedback(id, token)
        dispatch({ type: "FEEDBACK_DELETE", payload: id })
        toast({
          title: "Success",
          description: "Feedback deleted successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete feedback"

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
        throw err
      }
    },
    [token, dispatch, toast, refreshToken],
  )

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  return {
    feedback: data,
    loading,
    error,
    pagination,
    sortBy,
    order,
    fetchFeedback,
    removeFeedback,
    refetch: () => fetchFeedback(true),
  }
}
