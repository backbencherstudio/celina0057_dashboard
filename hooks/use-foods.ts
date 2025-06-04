"use client"

import { useCallback, useEffect } from "react"
import { useApp } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { getFoods, createFood, updateFood, deleteFood } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useFoods() {
  const { state, dispatch } = useApp()
  const { token, refreshToken } = useAuth()
  const { toast } = useToast()

  const { foods } = state
  const { data, loading, error, pagination, lastFetch, selectedCategory } = foods

  // Check if data needs to be fetched
  const shouldFetch = useCallback(() => {
    if (!lastFetch) return true
    if (Date.now() - lastFetch > CACHE_DURATION) return true
    return false
  }, [lastFetch])

  // Fetch foods
  const fetchFoods = useCallback(
    async (force = false) => {
      if (!token) return
      if (!force && !shouldFetch()) return

      dispatch({ type: "FOODS_LOADING" })

      try {
        const response = await getFoods(pagination.currentPage, pagination.limit, selectedCategory, token)
        dispatch({
          type: "FOODS_SUCCESS",
          payload: {
            data: response.data,
            pagination: response.pagination,
            category: selectedCategory,
          },
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch foods"
        dispatch({ type: "FOODS_ERROR", payload: errorMessage })

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
    [token, pagination.currentPage, pagination.limit, selectedCategory, shouldFetch, dispatch, toast, refreshToken],
  )

  // Create food
  const addFood = useCallback(
    async (formData: FormData) => {
      if (!token) return

      try {
        const response = await createFood(formData, token)
        dispatch({ type: "FOODS_ADD", payload: response.food })
        toast({
          title: "Success",
          description: "Food category created successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create food category"

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

  // Update food
  const editFood = useCallback(
    async (id: string, formData: FormData) => {
      if (!token) return

      try {
        const response = await updateFood(id, formData, token)
        dispatch({ type: "FOODS_UPDATE", payload: response.data })
        toast({
          title: "Success",
          description: "Food category updated successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update food category"

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

  // Delete food
  const removeFood = useCallback(
    async (id: string) => {
      if (!token) return

      try {
        await deleteFood(id, token)
        dispatch({ type: "FOODS_DELETE", payload: id })
        toast({
          title: "Success",
          description: "Food category deleted successfully",
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete food category"

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
    fetchFoods()
  }, [fetchFoods])

  return {
    foods: data,
    loading,
    error,
    pagination,
    selectedCategory,
    fetchFoods,
    addFood,
    editFood,
    removeFood,
    refetch: () => fetchFoods(true),
  }
}
