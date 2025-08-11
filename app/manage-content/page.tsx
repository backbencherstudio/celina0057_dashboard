"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Plus, Loader2, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
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
import UploadModal from "@/components/upload-modal"
import ImagePreviewModal from "@/components/image-preview-modal"
import { useApp } from "@/context/app-context"
import { useFoods } from "@/hooks/use-foods"

export default function ManageContentPage() {
  const {
    state,
    setFoodsCategory,
    setFoodsPage,
    setFoodsLimit,
    openUploadModal,
    openEditModal,
    closeUploadModal,
    closeEditModal,
    openImagePreviewModal,
    closeImagePreviewModal,
  } = useApp()
  const { foods, loading, error, selectedCategory, pagination, addFood, editFood, removeFood, refetch } = useFoods()

  const { ui } = state
  const { uploadModalOpen, editModalOpen, selectedFood, imagePreviewModalOpen, previewImage } = ui

  const handleUpload = async (name: string, file: File | null) => {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("category", selectedCategory)

    if (file) {
      formData.append("image", file)
    }

    try {
      await addFood(formData)
      closeUploadModal()
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleEdit = async (name: string, file: File | null) => {
    if (!selectedFood) return

    const formData = new FormData()
    formData.append("name", name)
    formData.append("category", selectedCategory)

    if (file) {
      formData.append("image", file)
    }

    try {
      await editFood(selectedFood.id, formData)
      closeEditModal()
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeFood(id)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleImageClick = (food: any) => {
    if (food.image) {
      openImagePreviewModal(food.image, food.name)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Content</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Select value={selectedCategory} onValueChange={setFoodsCategory}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CRAVINGS">CRAVINGS</SelectItem>
                <SelectItem value="MOOD">MOOD</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openUploadModal} className="bg-gray-900 hover:bg-gray-800 text-white w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

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
        ) : foods.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            No {selectedCategory.toLowerCase()} found. Add some!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 lg:gap-6 xl:gap-8">
              {foods.map((food) => (
                <div key={food.id} className="flex flex-col items-center space-y-2 lg:space-y-3">
                  <div className="relative group">
                    <div
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40 rounded-full overflow-hidden bg-gray-200 cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleImageClick(food)}
                    >
                      {food.image ? (
                        <img
                          src={food.image || "/placeholder.svg"}
                          alt={food.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs lg:text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="absolute top-0 right-0 flex space-x-1">
                      <button
                        className="p-1 lg:p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEditModal(food)}
                      >
                        <Edit className="h-3 w-3 lg:h-4 lg:w-4 text-gray-600" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1 lg:p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this food category.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(food.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <span className="text-xs lg:text-sm xl:text-base font-medium text-gray-900 text-center leading-tight max-w-full break-words">
                    {food.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-6 lg:mt-8 gap-4">
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFoodsPage(Math.max(1, pagination.currentPage - 1))}
                    disabled={pagination.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let page: number
                      if (pagination.totalPages <= 5) {
                        page = i + 1
                      } else if (pagination.currentPage <= 3) {
                        page = i + 1
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        page = pagination.totalPages - 4 + i
                      } else {
                        page = pagination.currentPage - 2 + i
                      }

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
                          onClick={() => setFoodsPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                      <>
                        <span className="text-gray-400 px-2 text-xs lg:text-sm">...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-gray-600 hover:text-gray-900 text-xs lg:text-sm"
                          onClick={() => setFoodsPage(pagination.totalPages)}
                        >
                          {pagination.totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFoodsPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-end space-y-2 sm:space-y-0 sm:space-x-4 text-xs lg:text-sm text-gray-600">
                  <span className="text-center sm:text-left">
                    Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} items
                  </span>
                  <div className="flex items-center justify-center space-x-2">
                    <span>Show</span>
                    <Select value={pagination.limit.toString()} onValueChange={(value) => setFoodsLimit(Number(value))}>
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="48">48</SelectItem>
                        <SelectItem value="96">96</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <UploadModal isOpen={uploadModalOpen} onClose={closeUploadModal} onUpload={handleUpload} />

        <UploadModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          onUpload={handleEdit}
          initialName={selectedFood?.name}
          title="Edit Food Category"
          submitLabel="Update"
        />

        <ImagePreviewModal
          isOpen={imagePreviewModalOpen}
          onClose={closeImagePreviewModal}
          imageUrl={previewImage?.url || null}
          imageName={previewImage?.name || ""}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
