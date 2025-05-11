"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { de } from "date-fns/locale"

// Definir interfaces para los tipos
interface PlaceResult {
  address_components: google.maps.GeocoderAddressComponent[]
  formatted_address: string
  geometry: {
    location: google.maps.LatLng
  }
  place_id: string
}

interface AddressDetails {
  street?: string
  streetNumber?: string
  neighborhood?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  formattedAddress: string
  lat: number
  lng: number
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressDetails) => void,
  defaultAddress: string
}

declare global {
  interface Window {
    google: any
    initAutocomplete: () => void
  }
}

export default function AddressAutocompleteGoogle({ onAddressSelect, defaultAddress }: AddressAutocompleteProps) {
  const [apiLoaded, setApiLoaded] = useState(false)
  const [inputValue, setInputValue] = useState(defaultAddress ||"")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cargar la API de Google Maps
  useEffect(() => {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!googleMapsApiKey) {
      setError("La clave de API de Google Maps no está configurada")
      return
    }

    if (window.google && window.google.maps) {
      initAutocomplete()
      return
    }

    setLoading(true)

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initAutocomplete`
    script.async = true
    script.defer = true

    window.initAutocomplete = () => {
      setApiLoaded(true)
      setLoading(false)
    }

    script.onerror = () => {
      setError("Error al cargar la API de Google Maps")
      setLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      window.initAutocomplete = null
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Inicializar el autocompletado cuando la API está cargada
  useEffect(() => {
    if (apiLoaded && inputRef.current) {
      initAutocomplete()
    }
  }, [apiLoaded])

  const initAutocomplete = () => {
    if (!inputRef.current) return

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "ar" }, // Restringir a Argentina
      fields: ["address_components", "formatted_address", "geometry", "place_id"],
      types: ["address"],
    })

    autocompleteRef.current.addListener("place_changed", handlePlaceSelect)
  }

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return

    const place = autocompleteRef.current.getPlace() as PlaceResult

    if (!place.geometry) {
      setError("No se encontraron detalles para esta dirección")
      return
    }

    const addressDetails: AddressDetails = {
      formattedAddress: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    }

    setInputValue(place.formatted_address)
    onAddressSelect(addressDetails)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Ubicación
        </label>
        <div className="relative">
          <Input
            id="address"
            ref={inputRef}
            value={inputValue}
            onChange={() => setInputValue(inputRef.current?.value || "")}
            placeholder="Buscar dirección..."
            className="w-full"
            disabled={loading || !!error}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

    </div>
  )
}
