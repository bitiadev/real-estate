"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Loader2 } from "lucide-react"
import { Property } from "@/lib/property-service"

interface PropertyMapProps {
  properties: Property[]
  selectedPropertyId: number
  onMarkerClick: (propertyId: number) => void
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function PropertyMap({ properties, selectedPropertyId, onMarkerClick }: PropertyMapProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({})
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Inicializar el mapa
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current) return

    try {
      // Calcular el centro del mapa basado en las propiedades
      let centerLat = -34.6037
      let centerLng = -58.3816

      if (properties.length > 0) {
        const totalLat = properties.reduce((sum, prop) => sum + prop.lat, 0)
        const totalLng = properties.reduce((sum, prop) => sum + prop.lon, 0)
        centerLat = totalLat / properties.length
        centerLng = totalLng / properties.length
      }

      // Crear el mapa
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      })

      // Crear una ventana de información
      infoWindowRef.current = new window.google.maps.InfoWindow()

      // Añadir marcadores para cada propiedad
      properties.forEach((property) => {
        const marker = new window.google.maps.Marker({
          position: { lat: property.lat, lng: property.lon },
          map: mapRef.current,
          title: property.title,
          animation: window.google.maps.Animation.DROP,
        })

        // Guardar referencia al marcador
        markersRef.current[property.id] = marker

        // Añadir evento de clic al marcador
        marker.addListener("click", () => {
          onMarkerClick(property.id)

          // Mostrar ventana de información
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`
              <div style="max-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 5px;">${property.title}</h3>
                <p style="font-size: 0.9rem; margin-bottom: 5px;">${property.location}</p>
                <div style="display: flex; align-items: center; margin-bottom: 5px; justify-content: space-between;">
                <p style="font-weight: bold; color: #2563eb;">$${property.price.toLocaleString()}</p>
                <a href="/propiedades/${property.id}" target="_blank" style="margin-left: 5px; text-decoration: none; color: #2563eb;">Ver más</a>
                </div>
              </div>
            `)
            infoWindowRef.current.open(mapRef.current, marker)
          }
        })
      })

      setLoading(false)
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Error al inicializar el mapa")
      setLoading(false)
    }
  }, [properties, onMarkerClick])

  // Cargar la API de Google Maps
  useEffect(() => {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!googleMapsApiKey) {
      setError("La clave de API de Google Maps no está configurada")
      setLoading(false)
      return
    }

    if (typeof window.google !== "undefined" && window.google.maps) {
      initializeMap()
      return
    }

    window.initMap = initializeMap

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`
    script.async = true
    script.defer = true

    script.onerror = () => {
      setError("Error al cargar la API de Google Maps")
      setLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      window.initMap = null
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [initializeMap])

  // Actualizar el mapa cuando cambia la propiedad seleccionada
  useEffect(() => {
    if (!mapRef.current || !selectedPropertyId) return

    // Centrar el mapa en la propiedad seleccionada
    const selectedProperty = properties.find((p) => p.id === selectedPropertyId)
    if (selectedProperty) {
      mapRef.current.panTo({ lat: selectedProperty.lat, lng: selectedProperty.lon })
      mapRef.current.setZoom(15)

      // Abrir la ventana de información para el marcador seleccionado
      const marker = markersRef.current[selectedPropertyId]
      if (marker && infoWindowRef.current) {
        infoWindowRef.current.setContent(`
          <div style="max-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 5px;">${selectedProperty.title}</h3>
            <p style="font-size: 0.9rem; margin-bottom: 5px;">${selectedProperty.location}</p>
            <div style="display: flex; align-items: center; margin-bottom: 5px; justify-content: space-between;">
              <p style="font-weight: bold; color: #2563eb;">$${selectedProperty.price.toLocaleString()}</p>
              <a href="/propiedades/${selectedProperty.id}" target="_blank" style="margin-left: 5px; text-decoration: none; color: #2563eb;">Ver más</a>
            </div>
          </div>
        `)
        infoWindowRef.current.open(mapRef.current, marker)
      }
    }
  }, [selectedPropertyId, properties])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center p-4">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
          <span className="ml-2 text-gray-700">Cargando mapa...</span>
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full" aria-label="Mapa de propiedades" />
    </div>
  )
}
