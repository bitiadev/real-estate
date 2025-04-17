"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Check,
  XIcon,
  Home,
  Building,
  Ruler,
  Clock,
} from "lucide-react"
import { getPropertyById, getAllProperties } from "@/lib/property-service"
import type { Property } from "@/lib/property-service"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSending, setIsSending] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const loadProperty = async () => {
      setIsLoading(true)
      try {
        const propertyData = await getPropertyById(Number.parseInt(params.id))
        setProperty(propertyData)

        // Cargar propiedades similares
        if (propertyData) {
          loadSimilarProperties(propertyData)
        }
      } catch (error) {
        console.error("Error al cargar la propiedad:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperty()
  }, [params.id])

  const loadSimilarProperties = async (currentProperty: Property) => {
    try {
      const allProperties = await getAllProperties()

      // Filtrar propiedades activas y excluir la propiedad actual
      const activeProperties = allProperties.filter((p) => p.status === "activa" && p.id !== currentProperty.id)

      // Encontrar propiedades similares (mismo tipo, ubicación similar, precio similar)
      const similar = activeProperties.filter((p) => p.type === currentProperty.type)

      // Ordenar por similitud (ubicación, precio, características)
      similar.sort((a, b) => {
        // Calcular puntuación de similitud
        const scoreA = getSimilarityScore(a, currentProperty)
        const scoreB = getSimilarityScore(b, currentProperty)
        return scoreB - scoreA
      })

      // Tomar las 3 propiedades más similares
      setSimilarProperties(similar.slice(0, 3))
    } catch (error) {
      console.error("Error al cargar propiedades similares:", error)
    }
  }

  // Función para calcular puntuación de similitud entre propiedades
  const getSimilarityScore = (property: Property, reference: Property) => {
    let score = 0

    // Mismo tipo
    if (property.type === reference.type) score += 3

    // Ubicación similar
    if (property.location.includes(reference.location.split(",")[0])) score += 2

    // Precio similar (dentro del 20%)
    const priceDiff = Math.abs(property.price - reference.price) / reference.price
    if (priceDiff < 0.2) score += 2

    // Características similares
    if (Math.abs(property.bedrooms - reference.bedrooms) <= 1) score += 1
    if (Math.abs(property.bathrooms - reference.bathrooms) <= 1) score += 1

    // Área similar
    const areaDiff = Math.abs(property.area - reference.area) / reference.area
    if (areaDiff < 0.2) score += 1

    // Características adicionales
    if (property.features && reference.features) {
      Object.keys(reference.features).forEach((key) => {
        if (
          reference.features[key as keyof typeof reference.features] &&
          property.features[key as keyof typeof property.features]
        ) {
          score += 0.5
        }
      })
    }

    return score
  }

  const formatPrice = (price: number, type: string) => {
    return (
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(price) + (type === "alquiler" ? "/mes" : "")
    )
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    // Simulamos el envío del formulario
    setTimeout(() => {
      toast({
        title: "Mensaje enviado",
        description: "Te contactaremos pronto.",
      })
      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      })
      setIsSending(false)
    }, 1000)
  }

  const nextImage = () => {
    if (!property?.images) return
    setCurrentImageIndex((prev) => (prev + 1) % property.images!.length)
  }

  const prevImage = () => {
    if (!property?.images) return
    setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length)
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const nextLightboxImage = () => {
    if (!property?.images) return
    setLightboxIndex((prev) => (prev + 1) % property.images!.length)
  }

  const prevLightboxImage = () => {
    if (!property?.images) return
    setLightboxIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: property?.title || "Propiedad en inmobiliaria",
          text: `Mira esta propiedad: ${property?.title}`,
          url: window.location.href,
        })
        .catch((error) => console.log("Error compartiendo", error))
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Cargando propiedad...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <Link href="/propiedades" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a propiedades
        </Link>

        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Propiedad no encontrada</h2>
          <p className="text-gray-500 mb-6">La propiedad que estás buscando no existe o ha sido eliminada.</p>
          <Button asChild>
            <Link href="/propiedades">Ver todas las propiedades</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Información del agente (datos de ejemplo)
  const agent = {
    name: "María González",
    phone: "+54 11 1234-5678",
    email: "maria@inmobiliaria.com",
  }

  // Obtener todas las imágenes
  const images = property.images || []

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link href="/propiedades" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a propiedades
        </Link>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartir propiedad</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    toast({
                      title: "Añadido a favoritos",
                      description: "Esta propiedad ha sido añadida a tus favoritos.",
                    })
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Guardar en favoritos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Galería de imágenes */}
          <div className="mb-6">
            {images.length > 0 ? (
              <div className="space-y-4">
                <div
                  className="relative h-[400px] w-full rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(currentImageIndex)}
                >
                  <Image
                    src={images[currentImageIndex]?.url || "/placeholder.svg?height=600&width=800"}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                  <Badge
                    className="absolute top-4 right-4 text-sm px-3 py-1"
                    variant={property.type === "venta" ? "default" : "secondary"}
                  >
                    {property.type === "venta" ? "Venta" : "Alquiler"}
                  </Badge>

                  {/* Controles del carrusel */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full h-10 w-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          prevImage()
                        }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full h-10 w-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          nextImage()
                        }}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>

                      {/* Indicadores */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            title="Boton para cambiar imagen"
                            className={`h-1.5 rounded-full transition-all ${
                              index === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/60"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex(index)
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Miniaturas */}
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all ${
                          index === currentImageIndex ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <Image
                          src={image.url || "/placeholder.svg"}
                          alt={`${property.title} - imagen ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                <Building className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Detalles de la propiedad */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <MapPin className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-600">{property.location}</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <p className="text-2xl font-bold text-gray-900 mb-6">{formatPrice(property.price, property.type)}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                <Bed className="h-6 w-6 text-gray-500 mb-1" />
                <span className="text-sm text-gray-500">Dormitorios</span>
                <span className="font-semibold">{property.bedrooms}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                <Bath className="h-6 w-6 text-gray-500 mb-1" />
                <span className="text-sm text-gray-500">Baños</span>
                <span className="font-semibold">{property.bathrooms}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                <Square className="h-6 w-6 text-gray-500 mb-1" />
                <span className="text-sm text-gray-500">Superficie</span>
                <span className="font-semibold">{property.area} m²</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-500 mb-1" />
                <span className="text-sm text-gray-500">Año</span>
                <span className="font-semibold">{new Date(property.created_at).getFullYear()}</span>
              </div>
            </div>

            {/* Resumen de características */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-3">Resumen de la propiedad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex items-center">
                  <Home className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">Tipo: {property.type === "venta" ? "Venta" : "Alquiler"}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">Ubicación: {property.location}</span>
                </div>
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">Superficie total: {property.area} m²</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">Publicado: {new Date(property.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs de información */}
          <Tabs defaultValue="description" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Descripción</TabsTrigger>
              <TabsTrigger value="features">Características</TabsTrigger>
              <TabsTrigger value="location">Ubicación</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-4 bg-white rounded-b-lg border border-t-0">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
            </TabsContent>
            <TabsContent value="features" className="p-4 bg-white rounded-b-lg border border-t-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Características principales</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <Bed className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{property.bedrooms} dormitorios</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Bath className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{property.bathrooms} baños</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Square className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{property.area} m² totales</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Comodidades</h3>
                  <ul className="space-y-2">
                    {property.features &&
                      Object.entries(property.features).map(([key, value]) => {
                        if (!value) return null

                        const featureLabels: Record<string, string> = {
                          pool: "Piscina",
                          garden: "Jardín",
                          garage: "Garage",
                          security: "Seguridad 24hs",
                          airConditioning: "Aire acondicionado",
                          heating: "Calefacción",
                        }

                        return (
                          <li key={key} className="flex items-center text-gray-700">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>{featureLabels[key] || key}</span>
                          </li>
                        )
                      })}

                    {/* Mostrar características que no tiene */}
                    {property.features &&
                      Object.entries(property.features)
                        .filter(([_, value]) => !value)
                        .map(([key, _]) => {
                          const featureLabels: Record<string, string> = {
                            pool: "Piscina",
                            garden: "Jardín",
                            garage: "Garage",
                            security: "Seguridad 24hs",
                            airConditioning: "Aire acondicionado",
                            heating: "Calefacción",
                          }

                          return (
                            <li key={key} className="flex items-center text-gray-400">
                              <XIcon className="h-5 w-5 text-gray-300 mr-2" />
                              <span>{featureLabels[key] || key}</span>
                            </li>
                          )
                        })}
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="location" className="p-4 bg-white rounded-b-lg border border-t-0">
              <div className="space-y-4">
                <div className="bg-gray-200 h-[300px] flex items-center justify-center rounded-lg">
                  <p className="text-gray-500">Mapa de ubicación</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Dirección</h3>
                  <p className="text-gray-700">{property.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Información del barrio</h3>
                  <p className="text-gray-700">
                    Esta propiedad se encuentra en una zona residencial tranquila, con fácil acceso a transporte
                    público, escuelas, parques y centros comerciales. El barrio cuenta con excelente seguridad y todos
                    los servicios necesarios para una vida confortable.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div>
          {/* Agente */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contactar agente</h3>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">MG</span>
                </div>
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-gray-500">Agente inmobiliario</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <a href={`tel:${agent.phone}`} className="text-gray-700 hover:underline">
                    {agent.phone}
                  </a>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <a href={`mailto:${agent.email}`} className="text-gray-700 hover:underline">
                    {agent.email}
                  </a>
                </div>
              </div>
              <form onSubmit={handleContactSubmit}>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium">
                      Nombre
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={contactForm.name}
                      onChange={handleContactChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={contactForm.email}
                      onChange={handleContactChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-sm font-medium">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={contactForm.phone}
                      onChange={handleContactChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="text-sm font-medium">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      value={contactForm.message}
                      onChange={handleContactChange}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSending}>
                    {isSending ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      "Enviar mensaje"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Propiedades similares */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Propiedades similares</h3>
              <div className="space-y-4">
                {similarProperties.length > 0 ? (
                  similarProperties.map((prop) => {
                    // Obtener la imagen principal
                    const mainImage = prop.images?.find((img) => img.main_image) || prop.images?.[0]

                    return (
                      <Link href={`/propiedades/${prop.id}`} key={prop.id} className="block">
                        <div className="flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <div className="relative h-16 w-20 flex-shrink-0 rounded overflow-hidden">
                            <Image
                              src={mainImage?.url || "/placeholder.svg?height=100&width=120"}
                              alt={prop.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm line-clamp-1">{prop.title}</h4>
                            <p className="text-gray-500 text-xs">{prop.location}</p>
                            <p className="text-sm font-semibold mt-1">{formatPrice(prop.price, prop.type)}</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <p className="text-gray-500 text-sm">No hay propiedades similares disponibles.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lightbox para imágenes */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none">
          <div className="relative bg-black/95 rounded-lg overflow-hidden">
            <div className="relative h-[80vh] w-full">
              {images.length > 0 && (
                <Image
                  src={images[lightboxIndex]?.url || "/placeholder.svg"}
                  alt={`${property.title} - imagen ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                />
              )}

              {/* Controles del lightbox */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full h-12 w-12"
                    onClick={prevLightboxImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full h-12 w-12"
                    onClick={nextLightboxImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Contador de imágenes */}
              <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                {lightboxIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
