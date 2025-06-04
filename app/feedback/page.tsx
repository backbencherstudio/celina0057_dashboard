"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Loader2, Trash2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import DashboardLayout from "@/components/layout"
import ProtectedRoute from "@/components/protected-route"
import { useApp } from "@/context/app-context"
import { useFeedback } from "@/hooks/use-feedback"

export default function FeedbackPage() {
  const { setFeedbackPage, setFeedbackSort, setFeedbackLimit } = useApp()
  const { feedback, loading, error, pagination, sortBy, order, removeFeedback, refetch } = useFeedback()

  const handleSortChange = (value: string) => {
    switch (value) {
      case "newest":
        setFeedbackSort("createdAt", "desc")
        break
      case "oldest":
        setFeedbackSort("createdAt", "asc")
        break
      case "name":
        setFeedbackSort("name", "asc")
        break
      case "email":
        setFeedbackSort("email", "asc")
        break
    }
  }

  const handleDeleteFeedback = async (id: string) => {
    try {
      await removeFeedback(id)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getSortValue = () => {
    if (sortBy === "createdAt" && order === "desc") return "newest"
    if (sortBy === "createdAt" && order === "asc") return "oldest"
    if (sortBy === "name") return "name"
    if (sortBy === "email") return "email"
    return "newest"
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Feedback</h3>
          <Select value={getSortValue()} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-20 text-red-500">
                <AlertTriangle className="h-10 w-10 mb-4" />
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={refetch}>
                  Try Again
                </Button>
              </div>
            ) : feedback.length === 0 ? (
              <div className="flex justify-center items-center py-20 text-gray-500">No feedback found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="text-gray-600 font-medium py-3 lg:py-4 px-3 lg:px-6 min-w-[200px] lg:min-w-[300px]">
                        Feedbacks Given
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium py-3 lg:py-4 px-3 lg:px-6 min-w-[150px]">
                        E-mail
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium py-3 lg:py-4 px-3 lg:px-6 min-w-[100px]">
                        Name
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium py-3 lg:py-4 px-3 lg:px-6 min-w-[100px]">
                        Date
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium py-3 lg:py-4 px-3 lg:px-6 w-[80px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedback.map((feedbackItem) => (
                      <TableRow key={feedbackItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="py-3 lg:py-4 px-3 lg:px-6">
                          <p className="text-gray-900 text-xs lg:text-sm leading-relaxed">{feedbackItem.description}</p>
                        </TableCell>
                        <TableCell className="py-3 lg:py-4 px-3 lg:px-6">
                          <p className="text-gray-600 text-xs lg:text-sm break-all">{feedbackItem.email}</p>
                        </TableCell>
                        <TableCell className="py-3 lg:py-4 px-3 lg:px-6">
                          <p className="text-gray-900 text-xs lg:text-sm font-medium">{feedbackItem.name}</p>
                        </TableCell>
                        <TableCell className="py-3 lg:py-4 px-3 lg:px-6">
                          <p className="text-gray-600 text-xs lg:text-sm">{formatDate(feedbackItem.createdAt)}</p>
                        </TableCell>
                        <TableCell className="py-3 lg:py-4 px-3 lg:px-6">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this feedback.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteFeedback(feedbackItem.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && !error && feedback.length > 0 && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-4 lg:mt-6 gap-4">
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFeedbackPage(Math.max(1, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={pagination.currentPage === page ? "default" : "ghost"}
                      size="sm"
                      className={`w-8 h-8 p-0 text-xs lg:text-sm ${
                        pagination.currentPage === page
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      onClick={() => setFeedbackPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                {pagination.totalPages > 5 && (
                  <>
                    <span className="text-gray-400 px-2 text-xs lg:text-sm">...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-gray-600 hover:text-gray-900 text-xs lg:text-sm"
                      onClick={() => setFeedbackPage(pagination.totalPages)}
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFeedbackPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-end space-y-2 sm:space-y-0 sm:space-x-4 text-xs lg:text-sm text-gray-600">
              <span className="text-center sm:text-left">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} entries
              </span>
              <div className="flex items-center justify-center space-x-2">
                <span>Show</span>
                <Select value={pagination.limit.toString()} onValueChange={(value) => setFeedbackLimit(Number(value))}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
