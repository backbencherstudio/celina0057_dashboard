"use client"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"

interface ImagePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  imageName: string
}

export default function ImagePreviewModal({ isOpen, onClose, imageUrl, imageName }: ImagePreviewModalProps) {
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `${imageName}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between">
            <h3 className="text-white font-medium text-lg">{imageName}</h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleDownload} className="text-white hover:bg-white/20">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="flex items-center justify-center bg-black min-h-[60vh] max-h-[80vh]">
            {imageUrl ? (
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={imageName}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-white/60 text-center p-8">
                <div className="text-6xl mb-4">🖼️</div>
                <p>No image available</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
