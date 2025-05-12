"use client"

import React, { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"
import {
  uploadPropertyImage,
  savePropertyImageReference,
  setMainImage,
  deletePropertyImageComplete,
  getPropertyImages,
} from "@/lib/storage-service"
import { getPropertyById } from "@/lib/property-service"
import { supabase } from "@/lib/supabaseClient"
import categories from "@/data/categories.json"
import AddressAutocomplete from "@/components/adress-autocomplete"
import AddressAutocompleteGoogle from "@/components/autocomplete-input"
import caracteristicas from "@/data/characteristics.json"

export default function EditarPropiedad({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [propertyId, setPropertyId] = useState<number | null>(null)
  const [isLoadingProperty, setIsLoadingProperty] = useState(true)
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
    features: caracteristicas.reduce((acc, feature) => ({ ...acc, [feature]: false }), {}),
    status: "activa",
    category: "",
    contact_name: "",
    contact_last_name: "",
    contact_phone: "",
    contact_location: "",
    currency: "ARS",
    lat: 0,
    lon: 0,
  })
  const [images, setImages] = useState<Array<{ id: number; url: string; main_image: boolean }>>([])

  // Resolver params y obtener propertyId
  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params
      setPropertyId(Number(resolvedParams.id))
    }
    fetchParams()
  }, [params])

  // Cargar datos de la propiedad
  useEffect(() => {
    if (!propertyId) return

    const loadProperty = async () => {
      setIsLoadingProperty(true)
      try {
        const property = await getPropertyById(propertyId)
        if (!property) {
          toast({
            title: "Error",
            description: "No se pudo encontrar la propiedad.",
            variant: "destructive",
          })
          router.push("/admin/dashboard")
          return
        }

        // Cargar datos del formulario
        setFormData({
          title: property.title,
          description: property.description,
          price: property.price.toString(),
          type: property.type,
          location: property.location,
          bedrooms: property.bedrooms.toString(),
          bathrooms: property.bathrooms.toString(),
          area: property.area.toString(),
          features: property.features,
          status: property.status,
          category: property.category,
          contact_name: property.contact_name,
          contact_last_name: property.contact_last_name,
          contact_phone: property.contact_phone,
          contact_location: property.contact_location || "",
          currency: property.currency,
          lat: property.lat,
          lon: property.lon
        })

        // Cargar imágenes
        const propertyImages = await getPropertyImages(propertyId)
        setImages(
          propertyImages.map((img) => ({
            id: img.id,
            url: img.url,
            main_image: img.main_image,
          })),
        )
      } catch (error) {
        console.error("Error al cargar la propiedad:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la propiedad. Inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProperty(false)
      }
    }

    loadProperty()
  }, [propertyId, router, toast])

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
      const uploadedImage = await uploadPropertyImage(file, propertyId!)
      if (!uploadedImage) throw new Error("Error al subir la imagen")

      const isMainImage = images.length === 0
      const imageId = await savePropertyImageReference(propertyId!, uploadedImage.path, isMainImage)
      if (!imageId) throw new Error("Error al guardar la referencia de la imagen")

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

  const handleRemoveImage = async (index: number, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation() // Prevenir propagación del evento si se pasa
  
    const imageToRemove = images[index]
  
    try {
      const success = await deletePropertyImageComplete(imageToRemove.id)
      if (!success) throw new Error("Error al eliminar la imagen")
  
      setImages((prev) => {
        const newImages = prev.filter((_, i) => i !== index)
        if (imageToRemove.main_image && newImages.length > 0) {
          newImages[0].main_image = true
        }
        return newImages
      })
  
      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada correctamente.",
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

  const handleSetMainImage = async (index: number, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation() // Prevenir propagación del evento si se pasa
  
    const imageToSetAsMain = images[index]
  
    try {
      const success = await setMainImage(imageToSetAsMain.id, propertyId!)
      if (!success) throw new Error("Error al establecer la imagen principal")
  
      setImages((prev) =>
        prev.map((img, i) => ({
          ...img,
          main_image: i === index,
        })),
      )
  
      toast({
        title: "Imagen principal actualizada",
        description: "La imagen principal ha sido actualizada correctamente.",
      })
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
      if (images.length === 0) {
        toast({
          title: "Error",
          description: "Debes subir al menos una imagen para la propiedad.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from("properties")
        .update({
          title: formData.title,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          currency: formData.currency,
          category: formData.category,
          type: formData.type,
          location: formData.location,
          bedrooms: Number.parseInt(formData.bedrooms),
          bathrooms: Number.parseInt(formData.bathrooms),
          area: Number.parseFloat(formData.area),
          contact_name: formData.contact_name,
          contact_last_name: formData.contact_last_name,
          contact_phone: formData.contact_phone,
          contact_location: formData.contact_location,
          features: formData.features,
          status: formData.status,
          updated_at: new Date().toISOString(),
          lat: formData.lat,
          lon: formData.lon
        })
        .eq("id", propertyId)

      if (error) throw error

      toast({
        title: "Propiedad actualizada",
        description: "La propiedad ha sido actualizada exitosamente.",
      })

      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Error al actualizar la propiedad:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la propiedad. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAddress = (place: any) => {
    console.log('Seleccionado:', place.display_name, place.lat, place.lon)
  }

  const handleAddressSelect = (address: any) => {
    //console.log("Dirección seleccionada:", address)
    setFormData((prev) => ({ ...prev, location: address.formattedAddress, lat: address.lat, lon: address.lng }))
  }

  if (isLoadingProperty) {
    return (
      <div className="max-w-4xl py-8 flex flex-col items-center justify-center mx-auto px-4 md:px-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Cargando propiedad...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl py-8 mx-auto md:max-w-full md:mx-12 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Editar Propiedad</h1>
      <Link href="/admin/dashboard" className="w-full justify-end inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de edición</CardTitle>
          <CardDescription>Actualiza la información de la propiedad</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Campos del formulario */}
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
                  rows={8}
                  placeholder="Descripción de la propiedad"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
                <div className="grid gap-3 md:col-span-1">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                  value={formData.currency}
                  onValueChange={(value) => handleSelectChange("currency", value)}
                  >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Selecciona la moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">ARS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 md:col-span-2">
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
                
                <div className="grid gap-3 md:col-span-2">
                  <Label htmlFor="type">Operacion</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de Operacion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="alquiler">Alquiler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 md:col-span-2">
                <Label htmlFor="category">Tipo</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* <div className="grid gap-3 md:col-span-3">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Ej: Ciudad, País"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div> */}
              </div>
              <div className="">
                  
               {/*  <AddressAutocomplete onSelect={handleSelect} /> */}
                <AddressAutocompleteGoogle 
                  onAddressSelect={(address) => handleAddressSelect(address)} 
                  defaultAddress={formData.location} 
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="bedrooms">Habitaciones</Label>
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
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    placeholder="Ej: 120"
                    required
                    value={formData.area}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="grid gap-3">
                  <Label htmlFor="price">Nombre del Propietario</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    type="text"
                    placeholder="Ej: Juan"
                    required
                    value={formData.contact_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="price">Apellido del Propietario</Label>
                  <Input
                    id="contact_last_name"
                    name="contact_last_name"
                    type="text"
                    placeholder="Ej: Pérez"
                    required
                    value={formData.contact_last_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="price">Domicilio del Propietario</Label>
                  <Input
                    id="contact_location"
                    name="contact_location"
                    type="text"
                    placeholder="Ej: Lavalle 155"
                    value={formData.contact_location}
                    onChange={handleInputChange}
                  />
                </div> 
                <div className="grid gap-3">
                  <Label htmlFor="price">Celular del Propietario</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="text"
                    placeholder="Ej: 2983123456"
                    required
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                  />
                </div> 

              </div>

              <div className="grid gap-3">
                <Label>Características</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(formData.features).map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={formData.features[feature as keyof typeof formData.features]}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(feature, checked as boolean)
                        }
                      />
                      <Label htmlFor={feature}>{feature}</Label>
                    </div>
                  ))}
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
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}