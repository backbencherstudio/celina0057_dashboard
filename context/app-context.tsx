"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback } from "react"
import type { Food, Feedback } from "@/lib/types"

// State interface
interface AppState {
  // Foods state
  foods: {
    data: Food[]
    loading: boolean
    error: string | null
    pagination: {
      currentPage: number
      totalPages: number
      total: number
      limit: number
    }
    lastFetch: number | null
    selectedCategory: string
  }
  // Feedback state
  feedback: {
    data: Feedback[]
    loading: boolean
    error: string | null
    pagination: {
      currentPage: number
      totalPages: number
      total: number
      limit: number
    }
    lastFetch: number | null
    sortBy: string
    order: "asc" | "desc"
  }
  // UI state
  ui: {
    uploadModalOpen: boolean
    editModalOpen: boolean
    imagePreviewModalOpen: boolean
    selectedFood: Food | null
    previewImage: { url: string; name: string } | null
    sidebarOpen: boolean
  }
}

// Action types
type AppAction =
  // Foods actions
  | { type: "FOODS_LOADING" }
  | { type: "FOODS_SUCCESS"; payload: { data: Food[]; pagination: any; category: string } }
  | { type: "FOODS_ERROR"; payload: string }
  | { type: "FOODS_ADD"; payload: Food }
  | { type: "FOODS_UPDATE"; payload: Food }
  | { type: "FOODS_DELETE"; payload: string }
  | { type: "FOODS_SET_CATEGORY"; payload: string }
  | { type: "FOODS_SET_PAGE"; payload: number }
  | { type: "FOODS_SET_LIMIT"; payload: number }
  // Feedback actions
  | { type: "FEEDBACK_LOADING" }
  | { type: "FEEDBACK_SUCCESS"; payload: { data: Feedback[]; total: number; page: number; limit: number } }
  | { type: "FEEDBACK_ERROR"; payload: string }
  | { type: "FEEDBACK_DELETE"; payload: string }
  | { type: "FEEDBACK_SET_PAGE"; payload: number }
  | { type: "FEEDBACK_SET_SORT"; payload: { sortBy: string; order: "asc" | "desc" } }
  | { type: "FEEDBACK_SET_LIMIT"; payload: number }
  // UI actions
  | { type: "UI_SET_UPLOAD_MODAL"; payload: boolean }
  | { type: "UI_SET_EDIT_MODAL"; payload: boolean }
  | { type: "UI_SET_IMAGE_PREVIEW_MODAL"; payload: boolean }
  | { type: "UI_SET_SELECTED_FOOD"; payload: Food | null }
  | { type: "UI_SET_PREVIEW_IMAGE"; payload: { url: string; name: string } | null }
  | { type: "UI_SET_SIDEBAR"; payload: boolean }

// Initial state
const initialState: AppState = {
  foods: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      limit: 24, // Changed to 24 for better grid layout
    },
    lastFetch: null,
    selectedCategory: "CRAVINGS",
  },
  feedback: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      limit: 8,
    },
    lastFetch: null,
    sortBy: "createdAt",
    order: "desc",
  },
  ui: {
    uploadModalOpen: false,
    editModalOpen: false,
    imagePreviewModalOpen: false,
    selectedFood: null,
    previewImage: null,
    sidebarOpen: false,
  },
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Foods cases
    case "FOODS_LOADING":
      return {
        ...state,
        foods: { ...state.foods, loading: true, error: null },
      }
    case "FOODS_SUCCESS":
      return {
        ...state,
        foods: {
          ...state.foods,
          data: action.payload.data,
          pagination: action.payload.pagination,
          selectedCategory: action.payload.category,
          loading: false,
          error: null,
          lastFetch: Date.now(),
        },
      }
    case "FOODS_ERROR":
      return {
        ...state,
        foods: { ...state.foods, loading: false, error: action.payload },
      }
    case "FOODS_ADD":
      return {
        ...state,
        foods: {
          ...state.foods,
          data: [...state.foods.data, action.payload],
          pagination: {
            ...state.foods.pagination,
            total: state.foods.pagination.total + 1,
          },
        },
      }
    case "FOODS_UPDATE":
      return {
        ...state,
        foods: {
          ...state.foods,
          data: state.foods.data.map((food) => (food.id === action.payload.id ? action.payload : food)),
        },
      }
    case "FOODS_DELETE":
      return {
        ...state,
        foods: {
          ...state.foods,
          data: state.foods.data.filter((food) => food.id !== action.payload),
          pagination: {
            ...state.foods.pagination,
            total: state.foods.pagination.total - 1,
          },
        },
      }
    case "FOODS_SET_CATEGORY":
      return {
        ...state,
        foods: {
          ...state.foods,
          selectedCategory: action.payload,
          pagination: { ...state.foods.pagination, currentPage: 1 },
          lastFetch: null, // Force refetch when category changes
        },
      }
    case "FOODS_SET_PAGE":
      return {
        ...state,
        foods: {
          ...state.foods,
          pagination: { ...state.foods.pagination, currentPage: action.payload },
          lastFetch: null, // Force refetch when page changes
        },
      }
    case "FOODS_SET_LIMIT":
      return {
        ...state,
        foods: {
          ...state.foods,
          pagination: { ...state.foods.pagination, limit: action.payload, currentPage: 1 },
          lastFetch: null, // Force refetch when limit changes
        },
      }

    // Feedback cases
    case "FEEDBACK_LOADING":
      return {
        ...state,
        feedback: { ...state.feedback, loading: true, error: null },
      }
    case "FEEDBACK_SUCCESS":
      return {
        ...state,
        feedback: {
          ...state.feedback,
          data: action.payload.data,
          pagination: {
            currentPage: action.payload.page,
            totalPages: Math.ceil(action.payload.total / action.payload.limit),
            total: action.payload.total,
            limit: action.payload.limit,
          },
          loading: false,
          error: null,
          lastFetch: Date.now(),
        },
      }
    case "FEEDBACK_ERROR":
      return {
        ...state,
        feedback: { ...state.feedback, loading: false, error: action.payload },
      }
    case "FEEDBACK_DELETE":
      return {
        ...state,
        feedback: {
          ...state.feedback,
          data: state.feedback.data.filter((feedback) => feedback.id !== action.payload),
          pagination: {
            ...state.feedback.pagination,
            total: state.feedback.pagination.total - 1,
          },
        },
      }
    case "FEEDBACK_SET_PAGE":
      return {
        ...state,
        feedback: {
          ...state.feedback,
          pagination: { ...state.feedback.pagination, currentPage: action.payload },
        },
      }
    case "FEEDBACK_SET_SORT":
      return {
        ...state,
        feedback: {
          ...state.feedback,
          sortBy: action.payload.sortBy,
          order: action.payload.order,
          pagination: { ...state.feedback.pagination, currentPage: 1 },
          lastFetch: null, // Force refetch when sort changes
        },
      }
    case "FEEDBACK_SET_LIMIT":
      return {
        ...state,
        feedback: {
          ...state.feedback,
          pagination: { ...state.feedback.pagination, limit: action.payload, currentPage: 1 },
          lastFetch: null, // Force refetch when limit changes
        },
      }

    // UI cases
    case "UI_SET_UPLOAD_MODAL":
      return {
        ...state,
        ui: { ...state.ui, uploadModalOpen: action.payload },
      }
    case "UI_SET_EDIT_MODAL":
      return {
        ...state,
        ui: { ...state.ui, editModalOpen: action.payload },
      }
    case "UI_SET_IMAGE_PREVIEW_MODAL":
      return {
        ...state,
        ui: { ...state.ui, imagePreviewModalOpen: action.payload },
      }
    case "UI_SET_SELECTED_FOOD":
      return {
        ...state,
        ui: { ...state.ui, selectedFood: action.payload },
      }
    case "UI_SET_PREVIEW_IMAGE":
      return {
        ...state,
        ui: { ...state.ui, previewImage: action.payload },
      }
    case "UI_SET_SIDEBAR":
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: action.payload },
      }

    default:
      return state
  }
}

// Context interface
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  // Helper functions
  setFoodsCategory: (category: string) => void
  setFoodsPage: (page: number) => void
  setFoodsLimit: (limit: number) => void
  setFeedbackPage: (page: number) => void
  setFeedbackSort: (sortBy: string, order: "asc" | "desc") => void
  setFeedbackLimit: (limit: number) => void
  openUploadModal: () => void
  closeUploadModal: () => void
  openEditModal: (food: Food) => void
  closeEditModal: () => void
  openImagePreviewModal: (imageUrl: string, imageName: string) => void
  closeImagePreviewModal: () => void
  setSidebarOpen: (open: boolean) => void
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Helper functions
  const setFoodsCategory = useCallback((category: string) => {
    dispatch({ type: "FOODS_SET_CATEGORY", payload: category })
  }, [])

  const setFoodsPage = useCallback((page: number) => {
    dispatch({ type: "FOODS_SET_PAGE", payload: page })
  }, [])

  const setFoodsLimit = useCallback((limit: number) => {
    dispatch({ type: "FOODS_SET_LIMIT", payload: limit })
  }, [])

  const setFeedbackPage = useCallback((page: number) => {
    dispatch({ type: "FEEDBACK_SET_PAGE", payload: page })
  }, [])

  const setFeedbackSort = useCallback((sortBy: string, order: "asc" | "desc") => {
    dispatch({ type: "FEEDBACK_SET_SORT", payload: { sortBy, order } })
  }, [])

  const setFeedbackLimit = useCallback((limit: number) => {
    dispatch({ type: "FEEDBACK_SET_LIMIT", payload: limit })
  }, [])

  const openUploadModal = useCallback(() => {
    dispatch({ type: "UI_SET_UPLOAD_MODAL", payload: true })
  }, [])

  const closeUploadModal = useCallback(() => {
    dispatch({ type: "UI_SET_UPLOAD_MODAL", payload: false })
  }, [])

  const openEditModal = useCallback((food: Food) => {
    dispatch({ type: "UI_SET_SELECTED_FOOD", payload: food })
    dispatch({ type: "UI_SET_EDIT_MODAL", payload: true })
  }, [])

  const closeEditModal = useCallback(() => {
    dispatch({ type: "UI_SET_EDIT_MODAL", payload: false })
    dispatch({ type: "UI_SET_SELECTED_FOOD", payload: null })
  }, [])

  const openImagePreviewModal = useCallback((imageUrl: string, imageName: string) => {
    dispatch({ type: "UI_SET_PREVIEW_IMAGE", payload: { url: imageUrl, name: imageName } })
    dispatch({ type: "UI_SET_IMAGE_PREVIEW_MODAL", payload: true })
  }, [])

  const closeImagePreviewModal = useCallback(() => {
    dispatch({ type: "UI_SET_IMAGE_PREVIEW_MODAL", payload: false })
    dispatch({ type: "UI_SET_PREVIEW_IMAGE", payload: null })
  }, [])

  const setSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: "UI_SET_SIDEBAR", payload: open })
  }, [])

  const value: AppContextType = {
    state,
    dispatch,
    setFoodsCategory,
    setFoodsPage,
    setFoodsLimit,
    setFeedbackPage,
    setFeedbackSort,
    setFeedbackLimit,
    openUploadModal,
    closeUploadModal,
    openEditModal,
    closeEditModal,
    openImagePreviewModal,
    closeImagePreviewModal,
    setSidebarOpen,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
