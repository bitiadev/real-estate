"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"
import {
  uploadPropertyImage,
  savePropertyImageReference,
  setMainImage,
  deletePropertyImageComplete,
} from "@/lib/storage-service"

export default function NuevaPropiedad() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    type: "venta",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    features: {
      pool: false,
      garden: false,
      garage: false,
      security: false,
      airConditioning: false,
      heating: false,
    },
  })
  const [images, setImages] = useState<Array<{ id: number; url: string; main_image: boolean }>>([])
  const [tempPropertyId, setTempPropertyId] = useState<number | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [name]: checked,
      },
    }))
  }

  const handleImageUpload = async (file: File) => {
    try {
      // Si no hay un ID de propiedad temporal, crear uno
      let propertyId = tempPropertyId
      if (!propertyId) {
        // Crear una propiedad temporal en la base de datos
        const { data, error } = await supabase
          .from("properties")
          .insert({
            title: "Propiedad temporal",
            description: "",
            price: 0,
            type: "venta",
            location: "",
            bedrooms: 0,
            bathrooms: 0,
            area: 0,
            status: "borrador",
          })
          .select("id")
          .single()

        if (error) throw error
        propertyId = data.id
        setTempPropertyId(propertyId)
      }

      // Subir la imagen a Supabase Storage
      const uploadedImage = await uploadPropertyImage(file, propertyId)
      if (!uploadedImage) throw new Error("Error al subir la imagen")

      // Guardar la referencia en la base de datos
      const isMainImage = images.length === 0 // La primera imagen será la principal
      const imageId = await savePropertyImageReference(propertyId, uploadedImage.path, isMainImage)
      if (!imageId) throw new Error("Error al guardar la referencia de la imagen")

      // Actualizar el estado de las imágenes
      setImages((prev) => [...prev, { id: imageId, url: uploadedImage.url, main_image: isMainImage }])
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveImage = async (index: number) => {
    try {
      const imageToRemove = images[index]
      const success = await deletePropertyImageComplete(imageToRemove.id)

      if (!success) throw new Error("Error al eliminar la imagen")

      // Si era la imagen principal y hay más imágenes, establecer la primera como principal
      if (imageToRemove.main_image && images.length > 1 && tempPropertyId) {
        const nextMainImage = images.find((img, i) => i !== index)
        if (nextMainImage) {
          await setMainImage(nextMainImage.id, tempPropertyId)
        }
      }

      // Actualizar el estado
      setImages((prev) => {
        const newImages = [...prev]
        newImages.splice(index, 1)

        // Si era la principal, actualizar la primera como principal
        if (imageToRemove.main_image && newImages.length > 0) {
          newImages[0] = { ...newImages[0], main_image: true }
        }

        return newImages
      })
    } catch (error) {
      console.error("Error al eliminar la imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleSetMainImage = async (index: number) => {
    try {
      if (!tempPropertyId) return

      const imageToSetAsMain = images[index]
      const success = await setMainImage(imageToSetAsMain.id, tempPropertyId)

      if (!success) throw new Error("Error al establecer la imagen principal")

      // Actualizar el estado
      setImages((prev) =>
        prev.map((img, i) => ({
          ...img,
          main_image: i === index,
        })),
      )
    } catch (error) {
      console.error("Error al establecer la imagen principal:", error)
      toast({
        title: "Error",
        description: "No se pudo establecer la imagen principal. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar que haya al menos una imagen
      if (images.length === 0) {
        toast({
          title: "Error",
          description: "Debes subir al menos una imagen para la propiedad.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Si hay un ID de propiedad temporal, actualizar esa propiedad
      if (tempPropertyId) {
        const { error } = await supabase
          .from("properties")
          .update({
            title: formData.title,
            description: formData.description,
            price: Number.parseFloat(formData.price),
            type: formData.type,
            location: formData.location,
            bedrooms: Number.parseInt(formData.bedrooms),
            bathrooms: Number.parseInt(formData.bathrooms),
            area: Number.parseFloat(formData.area),
            features: formData.features,
            status: "activa", // Cambiar de borrador a activa
          })
          .eq("id", tempPropertyId)

        if (error) throw error

        toast({
          title: "Propiedad creada",
          description: "La propiedad ha sido creada exitosamente.",
        })
      } else {
        // Si no hay un ID temporal, crear una nueva propiedad
        const { data, error } = await supabase
          .from("properties")
          .insert({
            title: formData.title,
            description: formData.description,
            price: Number.parseFloat(formData.price),
            type: formData.type,
            location: formData.location,
            bedrooms: Number.parseInt(formData.bedrooms),
            bathrooms: Number.parseInt(formData.bathrooms),
            area: Number.parseFloat(formData.area),
            features: formData.features,
            status: "activa",
          })
          .select("id")
          .single()

        if (error) throw error

        toast({
          title: "Propiedad creada",
          description: "La propiedad ha sido creada exitosamente.",
        })
      }

      // Redirigir al dashboard
      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Error al guardar la propiedad:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la propiedad. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Link href="/admin/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Propiedad</CardTitle>
          <CardDescription>Completa el formulario para agregar una nueva propiedad</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ej: Casa moderna con jardín"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe la propiedad en detalle"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Ej: 250000"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="alquiler">Alquiler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Ej: Palermo, Buenos Aires"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="bedrooms">Dormitorios</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    placeholder="Ej: 3"
                    required
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="bathrooms">Baños</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    placeholder="Ej: 2"
                    required
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="area">Superficie (m²)</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    placeholder="Ej: 180"
                    required
                    value={formData.area}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label>Características</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pool"
                      checked={formData.features.pool}
                      onCheckedChange={(checked) => handleCheckboxChange("pool", checked as boolean)}
                    />
                    <label
                      htmlFor="pool"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Piscina
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="garden"
                      checked={formData.features.garden}
                      onCheckedChange={(checked) => handleCheckboxChange("garden", checked as boolean)}
                    />
                    <label
                      htmlFor="garden"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Jardín
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="garage"
                      checked={formData.features.garage}
                      onCheckedChange={(checked) => handleCheckboxChange("garage", checked as boolean)}
                    />
                    <label
                      htmlFor="garage"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Garage
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="security"
                      checked={formData.features.security}
                      onCheckedChange={(checked) => handleCheckboxChange("security", checked as boolean)}
                    />
                    <label
                      htmlFor="security"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Seguridad 24hs
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="airConditioning"
                      checked={formData.features.airConditioning}
                      onCheckedChange={(checked) => handleCheckboxChange("airConditioning", checked as boolean)}
                    />
                    <label
                      htmlFor="airConditioning"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Aire acondicionado
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="heating"
                      checked={formData.features.heating}
                      onCheckedChange={(checked) => handleCheckboxChange("heating", checked as boolean)}
                    />
                    <label
                      htmlFor="heating"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Calefacción
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <Label>Imágenes</Label>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                  onSetMainImage={handleSetMainImage}
                  images={images}
                  maxImages={10}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => router.push("/admin/dashboard")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  "Guardar propiedad"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
