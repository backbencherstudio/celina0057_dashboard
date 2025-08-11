export interface User {
  id: string
  name: string
  email: string
  image: string | null
  role: "ADMIN"
}

export interface LoginResponse {
  message: string
  user: User
  token: string
}

export interface UpdateAdminResponse {
  message: string
  user: User
}

export interface Food {
  id: string
  name: string
  category: string
  image: string | null
  createdAt: string
}

export interface FoodsResponse {
  success: boolean
  data: Food[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface Feedback {
  id: string
  name: string
  email: string
  description: string
  createdAt: string
}

export interface FeedbackResponse {
  success: boolean
  total: number
  page: number
  limit: number
  data: Feedback[]
}

export interface LegalDocument {
  id?: string // Optional as it might not be present on creation
  privacyPolicy?: string | null
  termsConditions?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface LegalDocumentResponse {
  success: boolean
  message?: string
  data: LegalDocument
}

export interface ApiError {
  message: string
  error?: string
}

export interface AuthContextType {
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
