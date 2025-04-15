"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Star, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  onImageUpload: (file: File) => Promise<void>
  onRemoveImage?: (index: number) => void
  onSetMainImage?: (index: number) => void
  images?: Array<{ id: number; url: string; main_image: boolean }>
  maxImages?: number
  className?: string
}

export default function ImageUpload({
  onImageUpload,
  onRemoveImage,
  onSetMainImage,
  images = [],
  maxImages = 10,
  className = "",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (images.length >= maxImages) {
      toast({
        title: "Límite alcanzado",
        description: `Solo puedes subir un máximo de ${maxImages} imágenes.`,
        variant: "destructive",
      })
      return
    }

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFiles(files)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      await processFiles(files)
      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      e.target.value = ""
    }
  }

  const processFiles = async (files: File[]) => {
    // Filtrar solo archivos de imagen
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    // Verificar si hay espacio disponible
    const availableSlots = maxImages - images.length
    const filesToUpload = imageFiles.slice(0, availableSlots)

    if (filesToUpload.length === 0) return

    setIsUploading(true)

    try {
      // Procesar cada archivo
      for (const file of filesToUpload) {
        await onImageUpload(file)
      }

      toast({
        title: "Imágenes subidas",
        description: `${filesToUpload.length} ${filesToUpload.length === 1 ? "imagen subida" : "imágenes subidas"} correctamente.`,
      })
    } catch (error) {
      console.error("Error al subir imágenes:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al subir las imágenes.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de carga */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          disabled={isUploading || images.length >= maxImages}
        />

        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Arrastra y suelta imágenes aquí o haz clic para seleccionar archivos</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG o WEBP (máx. 5MB por archivo)</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleButtonClick}
          disabled={isUploading || images.length >= maxImages}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            "Seleccionar archivos"
          )}
        </Button>
      </div>

      {/* Vista previa de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {images.map((image, index) => (
            <Card key={image.id} className="relative group overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Botones de acción */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {onRemoveImage && (
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onRemoveImage(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {onSetMainImage && !image.main_image && (
                  <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => onSetMainImage(index)}>
                    <Star className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Indicador de imagen principal */}
              {image.main_image && (
                <div className="absolute top-1 right-1 bg-yellow-500 text-white rounded-full p-1">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
