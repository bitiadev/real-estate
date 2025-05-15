"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import PropertyCard from "@/components/property-card"
import { Search, Loader2, Building, Filter, X, SlidersHorizontal, Check } from "lucide-react"
import { getAllProperties } from "@/lib/property-service"
import type { Property } from "@/lib/property-service"
import { Badge } from "@/components/ui/badge"
import cities from '@/data/cities.json' 
import categories from '@/data/categories.json' 

export default function PropertiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOption, setSortOption] = useState("newest")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [isClearingFilters, setIsClearingFilters] = useState(false)

  // Estado para los filtros
  const [filters, setFilters] = useState({
    location: "all",
    type: "all",
    category: "all",
    minPrice: 0,
    maxPrice: 5000000,
    bedrooms: "any",
    bathrooms: "any",
    minArea: 0,
    maxArea: 5000,
  })

  // Cargar propiedades al montar el componente
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      try {
        const data = await getAllProperties()
        // Filtrar solo propiedades activas
        const activeProperties = data.filter((p) => p.status === "activa" && p.visible)
        setProperties(activeProperties)
        setFilteredProperties(activeProperties)

        // Actualizar el rango de precios basado en los datos reales
        if (activeProperties.length > 0) {
          const prices = activeProperties.map((p) => p.price)
          const areas = activeProperties.map((p) => p.area)
          const maxPrice = Math.max(...prices)
          const maxArea = Math.max(...areas)
          setFilters((prev) => ({
            ...prev,
            maxPrice: Math.ceil(maxPrice / 1000) * 1000, // Redondear hacia arriba al millar más cercano
            maxArea: Math.ceil(maxArea / 10) * 10, // Redondear hacia arriba a la decena más cercana
          }))
        }

        // Cargar filtros desde URL
        loadFiltersFromUrl()
      } catch (error) {
        console.error("Error al cargar propiedades:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [])

  // Aplicar filtros al cargar la página 
useEffect(() => {
  // Solo aplicar si hay propiedades cargadas y la URL tiene algún filtro distinto de los valores por defecto
  if (properties.length > 0) {
    const hasInitialFilters =
      (filters.location && filters.location !== "all") ||
      (filters.type && filters.type !== "all") ||
      (filters.category && filters.category !== "all") ||
      filters.minPrice > 0 ||
      filters.maxPrice < 5000000 ||
      filters.bedrooms !== "any" ||
      filters.bathrooms !== "any" ||
      filters.minArea > 0 ||
      filters.maxArea < 5000

    if (hasInitialFilters) {
      applyFilters()
    }
  }
  // Solo debe ejecutarse cuando cambian las propiedades o los filtros iniciales  
}, [properties])


  // Cargar filtros desde URL
  const loadFiltersFromUrl = useCallback(() => {
    const location = searchParams.get("location") || "all" 
    const type = searchParams.get("type") || "all"
    const category = searchParams.get("category") || "all"
    const minPrice = Number(searchParams.get("minPrice") || 0)
    const maxPrice = Number(searchParams.get("maxPrice") || filters.maxPrice)
    const bedrooms = searchParams.get("bedrooms") || "any"
    const bathrooms = searchParams.get("bathrooms") || "any"
    const minArea = Number(searchParams.get("minArea") || 0)
    const maxArea = Number(searchParams.get("maxArea") || filters.maxArea)

    setFilters({
      location,
      type,
      category,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
    })

    // Ordenamiento
    const sort = searchParams.get("sort") || "newest"
    setSortOption(sort)
  }, [searchParams, filters.maxPrice, filters.maxArea])

  // Función para actualizar filtros
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => {
      if (key.includes(".")) {
        const [parent, child] = key.split(".")
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as unknown as Record<string, boolean>),
            [child]: value,
          },
        }
      }
      return { ...prev, [key]: value }
    })
  }

  // Actualizar URL con filtros
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams()

    if (filters.location !== "all") params.set("location", filters.location)
    if (filters.type !== "all") params.set("type", filters.type)
    if (filters.category !== "all") params.set("category", filters.category)
    if (filters.minPrice > 0) params.set("minPrice", filters.minPrice.toString())
    if (filters.maxPrice < 5000000) params.set("maxPrice", filters.maxPrice.toString())
    if (filters.bedrooms !== "any") params.set("bedrooms", filters.bedrooms)
    if (filters.bathrooms !== "any") params.set("bathrooms", filters.bathrooms)
    if (filters.minArea > 0) params.set("minArea", filters.minArea.toString())
    if (filters.maxArea < 5000) params.set("maxArea", filters.maxArea.toString())

    // Ordenamiento
    if (sortOption !== "newest") params.set("sort", sortOption)

    router.push(`/propiedades?${params.toString()}`)
  }

  // Aplicar filtros cuando cambian
  const applyFilters = () => {
    let filtered = [...properties]

    // Filtro por ubicación
    if (filters.location !== "all") {
      filtered = filtered.filter((property) => property.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    // Filtro por tipo
    if (filters.type !== "all") {
      filtered = filtered.filter((property) => property.type === filters.type)
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((property) => property.category === filters.category)
    }

    // Filtro por precio
    filtered = filtered.filter((property) => property.price >= filters.minPrice && property.price <= filters.maxPrice)

    // Filtro por dormitorios
    if (filters.bedrooms !== "any") {
      if (filters.bedrooms === "4+") {
        filtered = filtered.filter((property) => property.bedrooms >= 4)
      } else {
        const bedroomsValue = Number.parseInt(filters.bedrooms)
        filtered = filtered.filter((property) => property.bedrooms === bedroomsValue)
      }
    }

    // Filtro por baños
    if (filters.bathrooms !== "any") {
      if (filters.bathrooms === "3+") {
        filtered = filtered.filter((property) => property.bathrooms >= 3)
      } else {
        const bathroomsValue = Number.parseInt(filters.bathrooms)
        filtered = filtered.filter((property) => property.bathrooms === bathroomsValue)
      }
    }

    // Filtro por área
    filtered = filtered.filter((property) => property.area >= filters.minArea && property.area <= filters.maxArea)

    /* // Filtro por características
    Object.entries(filters.features).forEach(([feature, isSelected]) => {
      if (isSelected) {
        filtered = filtered.filter(
          (property) => property.features && property.features[feature as keyof typeof property.features],
        )
      }
    }) */

    // Ordenar propiedades
    filtered = sortProperties(filtered, sortOption)

    setFilteredProperties(filtered)

    // Contar filtros activos
    let count = 0
    if (filters.location !== "all") count++
    if (filters.type !== "all") count++
    if (filters.category !== "all") count++
    if (filters.bedrooms !== "any") count++
    if (filters.bathrooms !== "any") count++
    if (filters.minPrice > 0) count++
    if (filters.maxPrice < 5000000) count++
    if (filters.minArea > 0) count++
    if (filters.maxArea < 5000) count++
    /* Object.values(filters.features).forEach((value) => {
      if (value) count++
    }) */

    setActiveFiltersCount(count)
  }

  // Ordenar propiedades
  const sortProperties = (propertiesList: Property[], option: string) => {
    const sorted = [...propertiesList]

    switch (option) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price)
      case "area-asc":
        return sorted.sort((a, b) => a.area - b.area)
      case "area-desc":
        return sorted.sort((a, b) => b.area - a.area)
      case "newest":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      default:
        return sorted
    }
  }

/*   // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters()
  }, [applyFilters]) */

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({
      location: "all",
      type: "all",
      category: "all",
      minPrice: 0,
      maxPrice: filters.maxPrice,
      bedrooms: "any",
      bathrooms: "any",
      minArea: 0,
      maxArea: filters.maxArea,
    })
    setSortOption("newest")
    setIsClearingFilters(true)
  } 

  // Aplicar filtros y actualizar URL
  const handleApplyFilters = () => {
    applyFilters()
    updateUrlWithFilters()
    setShowMobileFilters(false)
  }

  useEffect(() => {
    if (isClearingFilters) {
      applyFilters()
      updateUrlWithFilters()
      setShowMobileFilters(false)
      setIsClearingFilters(false)
    }
  }, [filters])

  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-4">Buscar Propiedades</h1>

      {/* Barra de búsqueda y filtros móviles */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            placeholder="Buscar..."
            className="pl-10"
            onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase()
                setFilteredProperties(
                  properties.filter((property) =>
                    property.location.toLowerCase().includes(searchTerm) || property.title.toLowerCase().includes(searchTerm),
                  ),
                )
            }}
          />
        </div>

        <div className="flex gap-2">
          {/* Botón de filtros para móvil */}
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden relative">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>Ajusta los filtros para encontrar la propiedad perfecta</SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tipo de operacion</h3>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de operacion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="alquiler">Alquiler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Ciudad</h3>
                <Select value={filters.location} onValueChange={(value => handleFilterChange("location", value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ciudad"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {
                      cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                </div>
              </div>

              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tipo</h3>
                  <Select value={filters.category} onValueChange={(value => handleFilterChange("category", value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
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

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Precio</h3>
                  <div className="px-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="minPrice">Mínimo</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          placeholder="0"                          
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange("minPrice", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxPrice">Máximo</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          placeholder={filters.maxPrice.toString()}
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="px-2">
                    <h3 className="text-sm font-medium">Superficie</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minArea">Mínimo</Label>
                        <Input
                          id="minArea"
                          type="number"
                          placeholder="0"
                          value={filters.minArea}
                          onChange={(e) => handleFilterChange("minArea", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxArea">Máximo</Label>
                        <Input
                          id="maxArea"
                          type="number"
                          placeholder={filters.maxArea.toString()}
                          value={filters.maxArea}
                          onChange={(e) => handleFilterChange("maxArea", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Dormitorios</h3>
                    <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange("bedrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dormitorios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Cantidad</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4+">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Baños</h3>
                    <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange("bathrooms", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Baños" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Cantidad</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3+">3+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <h3 className="text-sm font-medium">Características</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-pool"
                        checked={filters.features.pool}
                        onCheckedChange={(checked) => handleFilterChange("features.pool", checked === true)}
                      />
                      <label htmlFor="mobile-pool" className="text-sm">
                        Piscina
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-garden"
                        checked={filters.features.garden}
                        onCheckedChange={(checked) => handleFilterChange("features.garden", checked === true)}
                      />
                      <label htmlFor="mobile-garden" className="text-sm">
                        Jardín
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-garage"
                        checked={filters.features.garage}
                        onCheckedChange={(checked) => handleFilterChange("features.garage", checked === true)}
                      />
                      <label htmlFor="mobile-garage" className="text-sm">
                        Garage
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-security"
                        checked={filters.features.security}
                        onCheckedChange={(checked) => handleFilterChange("features.security", checked === true)}
                      />
                      <label htmlFor="mobile-security" className="text-sm">
                        Seguridad 24hs
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-airConditioning"
                        checked={filters.features.airConditioning}
                        onCheckedChange={(checked) => handleFilterChange("features.airConditioning", checked === true)}
                      />
                      <label htmlFor="mobile-airConditioning" className="text-sm">
                        Aire acondicionado
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-heating"
                        checked={filters.features.heating}
                        onCheckedChange={(checked) => handleFilterChange("features.heating", checked === true)}
                      />
                      <label htmlFor="mobile-heating" className="text-sm">
                        Calefacción
                      </label>
                    </div>
                  </div>
                </div> */}
              </div>

              <SheetFooter className="flex-col sm:flex-row gap-2 pt-2 border-t">
                <Button variant="outline" onClick={clearAllFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
                <SheetClose asChild>
                  <Button onClick={handleApplyFilters} className="w-full">
                    <Check className="h-4 w-4 mr-2" />
                    Aplicar filtros
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Selector de ordenamiento */}
          <Select
            value={sortOption}
            onValueChange={(value) => {
              setSortOption(value)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="oldest">Más antiguos</SelectItem>
              <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="area-asc">Superficie: menor a mayor</SelectItem>
              <SelectItem value="area-desc">Superficie: mayor a menor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.type !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tipo: {filters.type === "venta" ? "Venta" : "Alquiler"}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  handleFilterChange("type", "all")
                }}
              />
            </Badge>
          )}

          {filters.bedrooms !== "any" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Dormitorios: {filters.bedrooms}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  handleFilterChange("bedrooms", "any")
                }}
              />
            </Badge>
          )}

          {filters.bathrooms !== "any" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Baños: {filters.bathrooms}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  handleFilterChange("bathrooms", "any")
                }}
              />
            </Badge>
          )}

          {/* {Object.entries(filters.features)
            .filter(([_, value]) => value)
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
                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  {featureLabels[key]}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => {
                      handleFilterChange(`features.${key}`, false)
                      setTimeout(() => handleApplyFilters(), 100)
                    }}
                  />
                </Badge>
              )
            })} */}

        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filtros de escritorio */}
        <div className="hidden md:block w-72 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Filtros</h2>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-xs">
                  Limpiar todos
                </Button>
              )}
            </div>

            <Accordion type="multiple" defaultValue={["type", "location", "price", "rooms"/* , "features" */]} className="space-y-2">
              <AccordionItem value="type" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">Tipo de Operacion</AccordionTrigger>
                <AccordionContent>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => {
                      handleFilterChange("type", value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de operacion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="alquiler">Alquiler</SelectItem>
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="location" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">Localidad</AccordionTrigger>
                <AccordionContent>
                  <Select value={filters.location} onValueChange={(value => handleFilterChange("location", value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ciudad"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {
                        cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="category" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">Tipo</AccordionTrigger>
                <AccordionContent>
                  <Select value={filters.category} onValueChange={(value => handleFilterChange("category", value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {
                        categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">Precio</AccordionTrigger>
                <AccordionContent>
                  <div className="px-2 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minPrice">Mínimo</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          placeholder="0"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange("minPrice", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxPrice">Máximo</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          placeholder={filters.maxPrice.toString()}
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="area" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">Superficie</AccordionTrigger>
                <AccordionContent>
                  <div className="px-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minArea">Mínimo</Label>
                        <Input
                          id="minArea"
                          type="number"
                          placeholder="0"
                          value={filters.minArea}
                          onChange={(e) => handleFilterChange("minArea", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxArea">Máximo</Label>
                        <Input
                          id="maxArea"
                          type="number"
                          placeholder={filters.maxArea.toString()}
                          value={filters.maxArea}
                          onChange={(e) => handleFilterChange("maxArea", Number(e.target.value))}
                        />
                      </div>
                  </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rooms" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">Habitaciones</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs">Dormitorios</label>
                      <Select
                        value={filters.bedrooms}
                        onValueChange={(value) => {
                          handleFilterChange("bedrooms", value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Dormitorios" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Cantidad</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4+">4+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs">Baños</label>
                      <Select
                        value={filters.bathrooms}
                        onValueChange={(value) => {
                          handleFilterChange("bathrooms", value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Baños" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Cantidad</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3+">3+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* <AccordionItem value="features" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">Características</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pool"
                        checked={filters.features.pool}
                        onCheckedChange={(checked) => {
                          handleFilterChange("features.pool", checked === true)
                          setTimeout(() => handleApplyFilters(), 100)
                        }}
                      />
                      <label htmlFor="pool" className="text-sm">
                        Piscina
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="garden"
                        checked={filters.features.garden}
                        onCheckedChange={(checked) => {
                          handleFilterChange("features.garden", checked === true)
                          setTimeout(() => handleApplyFilters(), 100)
                        }}
                      />
                      <label htmlFor="garden" className="text-sm">
                        Jardín
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="garage"
                        checked={filters.features.garage}
                        onCheckedChange={(checked) => {
                          handleFilterChange("features.garage", checked === true)
                          setTimeout(() => handleApplyFilters(), 100)
                        }}
                      />
                      <label htmlFor="garage" className="text-sm">
                        Garage
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="security"
                        checked={filters.features.security}
                        onCheckedChange={(checked) => {
                          handleFilterChange("features.security", checked === true)
                          setTimeout(() => handleApplyFilters(), 100)
                        }}
                      />
                      <label htmlFor="security" className="text-sm">
                        Seguridad 24hs
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="airConditioning"
                        checked={filters.features.airConditioning}
                        onCheckedChange={(checked) => {
                          handleFilterChange("features.airConditioning", checked === true)
                          setTimeout(() => handleApplyFilters(), 100)
                        }}
                      />
                      <label htmlFor="airConditioning" className="text-sm">
                        Aire acondicionado
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="heating"
                        checked={filters.features.heating}
                        onCheckedChange={(checked) => {
                          handleFilterChange("features.heating", checked === true)
                          setTimeout(() => handleApplyFilters(), 100)
                        }}
                      />
                      <label htmlFor="heating" className="text-sm">
                        Calefacción
                      </label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem> */}
            </Accordion>

            <div className="mt-4">
              <Button onClick={handleApplyFilters} className="w-full">
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
              <span className="text-gray-500 ml-2">Cargando propiedades...</span>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">{filteredProperties.length} propiedades encontradas</h2>

              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Building className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No se encontraron propiedades con los filtros seleccionados.</p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
