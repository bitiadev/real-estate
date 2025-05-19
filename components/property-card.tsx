"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, MapPin, Heart } from "lucide-react"
import type { Property } from "@/lib/property-service"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface PropertyCardProps {
  property: Property
  showFavoriteButton?: boolean
}

export default function PropertyCard({ property, showFavoriteButton = true }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()

  const formatPrice = (price: number, type: string, currency: string) => {
    return (
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
      }).format(price) + (type === "alquiler" ? "/mes" : "")
    )
  }

  // Obtener la imagen principal o la primera disponible
  const mainImage = property.images?.find((img) => img.main_image) || property.images?.[0]

  // Función para manejar el clic en el botón de favoritos
 /*  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault() // Evitar la navegación
    e.stopPropagation() // Evitar la propagación del evento

    setIsFavorite(!isFavorite)

    toast({
      title: isFavorite ? "Eliminado de favoritos" : "Añadido a favoritos",
      description: isFavorite
        ? "Esta propiedad ha sido eliminada de tus favoritos."
        : "Esta propiedad ha sido añadida a tus favoritos.",
    })
  } */

  // Extraer características destacadas
  const carac1 = property.features?.electricidad
  const carac2 = property.features?.pavimento
  const carac3 = property.features?.['gas natural']

  // Crear un array de características para mostrar como badges
  const highlightedFeatures = []
  if (carac1) highlightedFeatures.push("electricidad")
  if (carac3) highlightedFeatures.push("gas natural")
  if (carac2) highlightedFeatures.push("pavimento")

  return (
    <Link href={`/propiedades/${property.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
        <div className="relative h-48 w-full">
          <Image
            src={mainImage?.url || "/placeholder.svg?height=300&width=400"}
            alt={property.title}
            fill
            className="object-cover"
          />
          <Badge className="absolute top-2 right-2" variant={property.type === "venta" ? "default" : "secondary"}>
            {property.type === "venta" ? "Venta" : "Alquiler"}
          </Badge>
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
            {property.category}
          </Badge>

          {/* Botón de favoritos */}
          {/* {showFavoriteButton && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 left-2 h-8 w-8 rounded-full ${
                isFavorite ? "bg-white text-red-500" : "bg-black/20 text-white hover:bg-black/30"
              }`}
              onClick={handleFavoriteClick}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          )} */}
        </div>
        <CardContent className="p-4 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold line-clamp-1">{property.title}</h3>
            {property.price > 0 && <p className="text-lg font-bold text-primary">{formatPrice(property.price, property.type, property.currency)}</p>}
          </div>
          <div className="flex items-center mt-1 text-gray-500 text-sm">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{property.description}</p>

          {/* Características destacadas */}
          {highlightedFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {highlightedFeatures.map((feature) => (
                <Badge key={feature} variant="outline" className="text-xs bg-gray-50">
                  {feature}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-sm text-gray-500 border-t mt-auto">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{property.area} m²</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
