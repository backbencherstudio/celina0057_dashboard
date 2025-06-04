import axios from "axios"
import type { Food, Feedback, LoginResponse, UpdateAdminResponse, FoodsResponse, FeedbackResponse } from "./types"

const API_BASE_URL = "https://cure-marriage-thinkpad-perfume.trycloudflare.com"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Request interceptor to add auth token (without Bearer prefix)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) {
      config.headers.Authorization = token // Send token directly without "Bearer"
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)

    // Check if token is invalid
    if (error.response?.status === 401 && error.response?.data?.message?.includes("token")) {
      console.log("Token invalid, logging out...")
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      // We'll handle the redirect in the components
    }

    return Promise.reject(new Error(error.response?.data?.message || error.message || "An unknown error occurred"))
  },
)

// Auth API calls
export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  console.log("Attempting login with:", { email })

  try {
    const response = await api.post<LoginResponse>("/admin/login", { email, password })
    console.log("Login response received:", { success: !!response.data.token })
    return response.data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function updateAdmin(formData: FormData, token: string): Promise<UpdateAdminResponse> {
  try {
    const response = await axios.patch<UpdateAdminResponse>(`${API_BASE_URL}/admin`, formData, {
      headers: {
        Authorization: token, // Send token directly without "Bearer"
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Update admin error:", error)
    throw error
  }
}

// Foods API calls
export async function getFoods(page = 1, limit = 10, category?: string, token?: string): Promise<FoodsResponse> {
  try {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    if (category) {
      params.append("category", category)
    }

    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = token // Send token directly without "Bearer"
    }

    const response = await api.get<FoodsResponse>(`/foods?${params.toString()}`, { headers })
    return response.data
  } catch (error) {
    console.error("Get foods error:", error)
    throw error
  }
}

export async function createFood(formData: FormData, token: string): Promise<{ message: string; food: Food }> {
  try {
    const response = await axios.post<{ message: string; food: Food }>(`${API_BASE_URL}/foods`, formData, {
      headers: {
        Authorization: token, // Send token directly without "Bearer"
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Create food error:", error)
    throw error
  }
}

export async function updateFood(
  id: string,
  formData: FormData,
  token: string,
): Promise<{ message: string; data: Food }> {
  try {
    const response = await axios.patch<{ message: string; data: Food }>(`${API_BASE_URL}/foods/${id}`, formData, {
      headers: {
        Authorization: token, // Send token directly without "Bearer"
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Update food error:", error)
    throw error
  }
}

export async function deleteFood(id: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/foods/${id}`, {
      headers: {
        Authorization: token, // Send token directly without "Bearer"
      },
    })
    return response.data
  } catch (error) {
    console.error("Delete food error:", error)
    throw error
  }
}

// Feedback API calls
export async function getFeedbacks(
  page = 1,
  limit = 8,
  sortBy = "createdAt",
  order: "asc" | "desc" = "desc",
  token: string,
): Promise<FeedbackResponse> {
  try {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    params.append("sortBy", sortBy)
    params.append("order", order)

    const response = await api.get<FeedbackResponse>(`/feedback?${params.toString()}`, {
      headers: {
        Authorization: token, // Send token directly without "Bearer"
      },
    })
    return response.data
  } catch (error) {
    console.error("Get feedbacks error:", error)
    throw error
  }
}

export async function createFeedback(
  name: string,
  email: string,
  description: string,
): Promise<{ message: string; data: Feedback }> {
  try {
    const response = await api.post<{ message: string; data: Feedback }>("/feedback", {
      name,
      email,
      description,
    })
    return response.data
  } catch (error) {
    console.error("Create feedback error:", error)
    throw error
  }
}

export async function deleteFeedback(id: string, token: string): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`/feedback/${id}`, {
      headers: {
        Authorization: token, // Send token directly without "Bearer"
      },
    })
    return response.data
  } catch (error) {
    console.error("Delete feedback error:", error)
    throw error
  }
}
