"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon } from "lucide-react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (name: string, file: File | null) => void
  initialName?: string
  title?: string
  submitLabel?: string
}

export default function UploadModal({
  isOpen,
  onClose,
  onUpload,
  initialName = "",
  title = "Upload File",
  submitLabel = "Ban",
}: UploadModalProps) {
  const [name, setName] = useState(initialName)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    setName(initialName)
  }, [initialName, isOpen])

  useEffect(() => {
    // Clean up the object URL when component unmounts or when file changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = () => {
    onUpload(name, file)
    setName("")
    setFile(null)
    setPreviewUrl(null)
    onClose()
  }

  const handleCancel = () => {
    setName("")
    setFile(null)
    setPreviewUrl(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg lg:text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 lg:space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 lg:p-8 text-center">
            {previewUrl ? (
              <div className="mb-4 flex justify-center">
                <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="max-h-40 rounded-md" />
              </div>
            ) : (
              <ImageIcon className="mx-auto h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mb-3 lg:mb-4" />
            )}
            <p className="text-xs lg:text-sm text-gray-500 mb-2">Min 2mb, PNG, JPEG</p>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block mt-2 cursor-pointer text-blue-600 hover:text-blue-500 text-sm lg:text-base"
            >
              Click to upload
            </label>
            {file && <p className="mt-2 text-xs lg:text-sm text-green-600">Selected: {file.name}</p>}
          </div>

          <div>
            <Label htmlFor="name" className="text-sm lg:text-base">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter food name"
              className="mt-1 text-sm lg:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button variant="outline" onClick={handleCancel} className="flex-1 text-sm lg:text-base">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm lg:text-base"
              disabled={!name.trim()}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
