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
import { ArrowLeft, Currency, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
// import ImageUpload from "@/components/image-upload" // Puedes comentar o eliminar si no lo usas directamente
import {
  uploadPropertyImage, // Usaremos esta función para subir al storage
  savePropertyImageReference, // <-- Ahora usaremos esta función para guardar la referencia
  // setMainImage, // No necesario directamente aquí al crear
  // deletePropertyImageComplete, // No necesario directamente aquí al crear
} from "@/lib/storage-service"
import categories from "@/data/categories.json"
import AddressAutocompleteGoogle from "@/components/autocomplete-input"
import caracteristicas from "@/data/characteristics.json"

interface UploadedImage {
  id?: number; // Opcional, si guardas referencia temporal en DB (aunque el nuevo enfoque evita esto)
  url: string;
  name?: string; // Nombre del archivo original
  main_image: boolean;
  file?: File; // Guardar el objeto File para la subida posterior
}

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
    /* features: {
      pool: false,
      garden: false,
      garage: false,
      security: false,
      airConditioning: false,
      heating: false,
    }, */
    features: caracteristicas.reduce((acc: any, feature: string) => ({ ...acc, [feature]: false }), {}),
    visible: true,
    category: "",
    contact_name: "",
    contact_last_name: "",
    contact_phone: "",
    contact_location: "",
    currency: "ARS",
    lat: -38.3817,
    lon: -60.2725,
  })
  const [images, setImages] = useState<UploadedImage[]>([]) // Usaremos este estado para las imágenes subidas

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

  const handleCheckboxChangeVisible = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      visible: checked,
    }))
  }

  // Modificación para manejar la selección de archivos y previsualización
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newImages: UploadedImage[] = files.map(file => ({
        url: URL.createObjectURL(file), // Crear URL temporal para previsualización
        name: file.name,
        main_image: false, // Se establecerá la principal después
        file: file, // Guardar el objeto File para la subida posterior
    }));

    setImages((prev) => {
        const updatedImages = [...prev, ...newImages];
        // Si no había imágenes antes, establecer la primera nueva como principal
        if (prev.length === 0 && newImages.length > 0) {
             updatedImages[0].main_image = true;
        }
        return updatedImages;
    });

    // Limpiar el input de archivo para poder subir los mismos archivos de nuevo si es necesario
    e.target.value = '';
  }

  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];

    // Revocar la URL temporal para liberar memoria
    if (imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
    }

    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // Si la imagen eliminada era la principal y quedan imágenes, establecer la primera como principal
      if (imageToRemove.main_image && newImages.length > 0) {
        newImages[0].main_image = true;
      }
      return newImages;
    });

    toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada de la lista.",
    });
  }

  const handleSetMainImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        main_image: i === index,
      })),
    );
  }

  const handleAddressSelect = (address: any) => {
    //console.log("Dirección seleccionada:", address)
    setFormData((prev) => ({ ...prev, location: address.formattedAddress, lat: address.lat, lon: address.lng }))
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

      // 1. Crear la propiedad principal en la base de datos
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        type: formData.type,
        location: formData.location,
        bedrooms: Number.parseInt(formData.bedrooms),
        bathrooms: Number.parseInt(formData.bathrooms),
        area: Number.parseFloat(formData.area),
        features: formData.features,
        visible: formData.visible,
        status: "activa", // O "borrador" si prefieres un paso de publicación
        category: formData.category,
        contact_name: formData.contact_name,
        contact_last_name: formData.contact_last_name,
        contact_phone: formData.contact_phone,
        contact_location: formData.contact_location,
        currency: formData.currency,
      };

      const { data: newProperty, error: propertyError } = await supabase
        .from("properties")
        .insert([propertyData]) // Insertar como array
        .select("id")
        .single();

      if (propertyError) throw propertyError;

      const newPropertyId = newProperty.id;

      // 2. Subir las imágenes al storage y GUARDAR SUS REFERENCIAS USANDO savePropertyImageReference
      const imageUploadAndSavePromises = images.map(async (img) => {
          if (!img.file) {
              console.warn("Skipping image without file object:", img);
              return null; // O manejar el error
          }
          // Subir la imagen al storage, asociándola directamente con el newPropertyId
          const uploadedImage = await uploadPropertyImage(img.file, newPropertyId);
          if (!uploadedImage) {
              console.error("Error uploading image to storage:", img.name);
              return null; // O manejar el error
          }

          // --- Usar savePropertyImageReference para guardar la referencia ---
          console.log("Attempting to save image reference using savePropertyImageReference:");
          console.log("  property_id:", newPropertyId);
          console.log("  uploadedImage.path:", uploadedImage.path); // savePropertyImageReference parece usar el path
          console.log("  is_main:", img.main_image);

          // Llama a la función existente que funciona en la página de edición
          const imageId = await savePropertyImageReference(newPropertyId, uploadedImage.path, img.main_image);

          if (!imageId) {
              console.error("Error saving image reference via savePropertyImageReference:", { propertyId: newPropertyId, path: uploadedImage.path, isMain: img.main_image });
              // Agregar logging del objeto de error completo si savePropertyImageReference lo devuelve
              // console.log("Image save error object:", errorFromSaveFunction); // Si savePropertyImageReference devuelve un error
              // Decide si quieres lanzar un error aquí o continuar
          } else {
              console.log("Image reference saved successfully with ID:", imageId);
          }
          return imageId; // Retornar el ID de la referencia guardada
      });

      // Esperar a que todas las operaciones de subida y guardado de referencia terminen
      const savedImageReferences = await Promise.all(imageUploadAndSavePromises);

      // Opcional: Filtrar referencias nulas si hubo errores individuales
      const successfulImageSaves = savedImageReferences.filter(id => id !== null);

      if (successfulImageSaves.length === 0 && images.length > 0) {
           // Considerar si esto debe ser un error fatal o solo una advertencia
           console.warn("No image references were successfully saved.");
           // Dependiendo de tu lógica, podrías querer eliminar la propiedad recién creada si no se guardó ninguna imagen.
      }


      toast({
        title: "Propiedad creada",
        description: "La propiedad y sus imágenes han sido creadas exitosamente.",
      })

      // Redirigir al dashboard
      router.push("/admin/dashboard")

    } catch (error) {
      console.error("Error al guardar la propiedad:", error)
      // Mejorar el mensaje de error si es un error de Supabase
      const errorMessage = (error as any)?.message || "Ocurrió un error al guardar la propiedad. Inténtalo de nuevo.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl py-8 mx-auto md:max-w-full md:mx-12 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Crear Nueva Propiedad</h1>
      <Link href="/admin/dashboard" className="px-4 w-full justify-end inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Formulario alta de propiedad</CardTitle>
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

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">                
                <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                  <div className="flex flex-col gap-3 md:col-span-1">
                    <Label htmlFor="currency">Moneda</Label>
                    {/* Select para moneda */}
                    <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Selecciona la moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ARS">ARS</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3 md:col-span-2">
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
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="type">Operacion</Label>
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

                <div className="grid gap-3">
                  <Label htmlFor="category">Tipo</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                     {
                      categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))
                     }
                    </SelectContent>
                  </Select> 
                </div>
                {/* <div className="grid gap-3">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Ej: Tres Arroyos, Lavalle 155"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>      */}         
              </div>
              <AddressAutocompleteGoogle onAddressSelect={handleAddressSelect} defaultAddress="" />
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="contact_name">Nombre Propietario</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    placeholder="Ej: Juan"
                    required
                    value={formData.contact_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="contact_last_name">Apellido del Propietario</Label>
                  <Input
                    id="contact_last_name"
                    name="contact_last_name"
                    placeholder="Ej: Pérez"
                    required
                    value={formData.contact_last_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="contact_phone">Teléfono del Propietario</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    placeholder="Ej: 1234567890"
                    required
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                  />

                </div>
                <div className="grid gap-3">
                  <Label htmlFor="contact_location">Domicilio del Propietario</Label>
                  <Input
                    id="contact_location"
                    name="contact_location"
                    placeholder="Ej: Tres Arroyos, Lavalle 155"
                    required
                    value={formData.contact_location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {/* Sección para las características */}
              <div className="grid gap-3">
                <Label>Características</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  { caracteristicas.map(
                    (caracteristica) => (
                      <div key={caracteristica} className="flex items-center space-x-2">
                        <Checkbox
                          id={caracteristica}
                          checked={formData.features[caracteristica]}
                          onCheckedChange={(checked) => handleCheckboxChange(caracteristica, checked as boolean)}
                        />
                        <label
                          htmlFor={caracteristica}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {caracteristica}
                        </label>
                      </div>
                    )
                  ) }
                  {/* <div className="flex items-center space-x-2">
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
                  </div> */}
                </div>
              </div>

              {/* Sección para indicar si va a estar visible o no */}
              <div className="grid gap-3">
                <Label>Estado de publicación</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visible"
                    checked={formData.visible}
                    onCheckedChange={(checked) => handleCheckboxChangeVisible(checked as boolean)}
                  />
                  <label
                    htmlFor="visible"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Visible en el sitio web
                  </label>
                </div>
              </div>

              <div className="grid gap-3">
                <Label>Imágenes</Label>
                {/* Input para seleccionar archivos */}
                <div>
                    <input type="file" title="imagenes" multiple onChange={handleFileSelect} accept="image/*" />
                </div>
                {/* Previsualización de imágenes subidas y selección de principal */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className={`relative border ${image.main_image ? 'border-blue-500' : 'border-gray-200'} rounded-md overflow-hidden`}>
                            <img src={image.url} alt={`Propiedad ${index + 1}`} className="w-full h-32 object-cover" />
                            <div className="absolute top-1 right-1 flex space-x-1">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleSetMainImage(index)}
                                    disabled={image.main_image}
                                >
                                    {image.main_image ? 'Principal' : 'Establecer Principal'}
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => router.push("/admin/dashboard")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || images.length === 0}>
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
