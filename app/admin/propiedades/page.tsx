"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Search, Plus, Edit, Trash2, Eye, Filter, ArrowUpDown, Loader2, Home, MapPin } from "lucide-react"
import { getAllProperties, updatePropertyStatus, deleteProperty } from "@/lib/property-service"
import type { Property } from "@/lib/property-service"
import { useToast } from "@/hooks/use-toast"

export default function PropertiesAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTab, setCurrentTab] = useState("todas")
  const [sortBy, setSortBy] = useState("newest")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [propertyToUpdateStatus, setPropertyToUpdateStatus] = useState<{
    property: Property
    newStatus: string
  } | null>(null)
  const [filterOptions, setFilterOptions] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    status: "all",
  })

  // Cargar propiedades al montar el componente
  useEffect(() => {
    loadProperties()
  }, [])

  // Filtrar propiedades cuando cambia el término de búsqueda, la pestaña o los filtros
  useEffect(() => {
    filterProperties()
  }, [searchTerm, currentTab, properties, sortBy, filterOptions])

  const loadProperties = async () => {
    setIsLoading(true)
    try {
      const data = await getAllProperties()
      setProperties(data)
    } catch (error) {
      console.error("Error al cargar propiedades:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las propiedades. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterProperties = () => {
    let filtered = [...properties]

    // Filtrar por tipo (pestaña)
    if (currentTab !== "todas") {
      filtered = filtered.filter((property) => property.type === currentTab)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(term) ||
          property.location.toLowerCase().includes(term) ||
          property.id.toString().includes(term),
      )
    }

    // Filtrar por ubicación
    if (filterOptions.location) {
      filtered = filtered.filter((property) =>
        property.location.toLowerCase().includes(filterOptions.location.toLowerCase()),
      )
    }

    // Filtrar por precio mínimo
    if (filterOptions.minPrice) {
      const minPrice = Number.parseFloat(filterOptions.minPrice)
      filtered = filtered.filter((property) => property.price >= minPrice)
    }

    // Filtrar por precio máximo
    if (filterOptions.maxPrice) {
      const maxPrice = Number.parseFloat(filterOptions.maxPrice)
      filtered = filtered.filter((property) => property.price <= maxPrice)
    }

    // Filtrar por estado
    if (filterOptions.status !== "all") {
      filtered = filtered.filter((property) => property.status === filterOptions.status)
    }

    // Ordenar propiedades
    filtered = sortProperties(filtered, sortBy)

    setFilteredProperties(filtered)
  }

  const sortProperties = (propertiesList: Property[], option: string) => {
    const sorted = [...propertiesList]

    switch (option) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price)
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      case "location-asc":
        return sorted.sort((a, b) => a.location.localeCompare(b.location))
      case "location-desc":
        return sorted.sort((a, b) => b.location.localeCompare(a.location))
      case "newest":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      default:
        return sorted
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilterOptions((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilterOptions({
      location: "",
      minPrice: "",
      maxPrice: "",
      status: "all",
    })
    setSearchTerm("")
    setSortBy("newest")
  }

  const confirmDeleteProperty = (property: Property) => {
    setPropertyToDelete(property)
    setDeleteDialogOpen(true)
  }

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return

    try {
      const success = await deleteProperty(propertyToDelete.id)
      if (success) {
        toast({
          title: "Propiedad eliminada",
          description: "La propiedad ha sido eliminada correctamente.",
        })
        // Actualizar la lista de propiedades
        setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id))
      } else {
        throw new Error("No se pudo eliminar la propiedad")
      }
    } catch (error) {
      console.error("Error al eliminar la propiedad:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la propiedad. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
    }
  }

  const confirmUpdateStatus = (property: Property, newStatus: string) => {
    setPropertyToUpdateStatus({ property, newStatus })
    setStatusDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!propertyToUpdateStatus) return

    try {
      const { property, newStatus } = propertyToUpdateStatus
      const success = await updatePropertyStatus(property.id, newStatus)

      if (success) {
        toast({
          title: "Estado actualizado",
          description: `La propiedad ahora está ${getStatusText(newStatus)}.`,
        })

        // Actualizar la lista de propiedades
        setProperties((prev) => prev.map((p) => (p.id === property.id ? { ...p, status: newStatus } : p)))
      } else {
        throw new Error("No se pudo actualizar el estado")
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setStatusDialogOpen(false)
      setPropertyToUpdateStatus(null)
    }
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "activa":
        return "activa"
      case "vendida":
        return "vendida"
      case "alquilada":
        return "alquilada"
      case "borrador":
        return "en borrador"
      default:
        return status
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "activa":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Activa
          </Badge>
        )
      case "vendida":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Vendida
          </Badge>
        )
      case "alquilada":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
            Alquilada
          </Badge>
        )
      case "borrador":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            Borrador
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Gestión de Propiedades</h1>
          <p className="text-gray-500">Administra todas las propiedades de tu inmobiliaria</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/admin/propiedades/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva propiedad
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Buscar por título, ubicación o ID..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div>
              <Select value={filterOptions.location} onValueChange={(value) => handleFilterChange("location", value)}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Ubicación" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_locations">Todas las ubicaciones</SelectItem>
                  <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                  <SelectItem value="Córdoba">Córdoba</SelectItem>
                  <SelectItem value="Rosario">Rosario</SelectItem>
                  <SelectItem value="Mendoza">Mendoza</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterOptions.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="vendida">Vendida</SelectItem>
                  <SelectItem value="alquilada">Alquilada</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Ordenar por" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="title-asc">Título: A-Z</SelectItem>
                  <SelectItem value="title-desc">Título: Z-A</SelectItem>
                  <SelectItem value="location-asc">Ubicación: A-Z</SelectItem>
                  <SelectItem value="location-desc">Ubicación: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                type="number"
                placeholder="Precio mínimo"
                value={filterOptions.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Precio máximo"
                value={filterOptions.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              />
            </div>
            <div className="lg:col-span-2 flex justify-end">
              <Button variant="outline" onClick={resetFilters} className="mr-2">
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de contenido */}
      <Tabs defaultValue="todas" value={currentTab} onValueChange={handleTabChange}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="venta">En Venta</TabsTrigger>
            <TabsTrigger value="alquiler">En Alquiler</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="todas" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Propiedades</CardTitle>
              <CardDescription>
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Building className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay propiedades</h3>
                  <p className="text-gray-500">
                    {searchTerm || Object.values(filterOptions).some((val) => val !== "" && val !== "all")
                      ? "No se encontraron propiedades que coincidan con tu búsqueda."
                      : "Aún no hay propiedades registradas."}
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/admin/propiedades/nueva">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar propiedad
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => {
                        // Obtener la imagen principal
                        const mainImage = property.images?.find((img) => img.main_image) || property.images?.[0]

                        return (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.id}</TableCell>
                            <TableCell>
                              <div className="relative h-10 w-14 rounded overflow-hidden">
                                <Image
                                  src={mainImage?.url || "/placeholder.svg?height=40&width=60"}
                                  alt={property.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{property.title}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{property.location}</TableCell>
                            <TableCell>{formatPrice(property.price, property.type)}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  property.type === "venta" ? "bg-gray-50" : "bg-blue-50 text-blue-600 border-blue-200"
                                }
                              >
                                {property.type === "venta" ? "Venta" : "Alquiler"}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(property.status)}</TableCell>
                            <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="12" cy="5" r="1" />
                                      <circle cx="12" cy="19" r="1" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/propiedades/${property.id}`} target="_blank">
                                      <Eye className="mr-2 h-4 w-4" />
                                      <span>Ver</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/propiedades/editar/${property.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Editar</span>
                                    </Link>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  {/* Opciones de cambio de estado */}
                                  {property.status !== "activa" && (
                                    <DropdownMenuItem onClick={() => confirmUpdateStatus(property, "activa")}>
                                      <span className="mr-2 h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-green-600"></span>
                                      </span>
                                      <span>Marcar como activa</span>
                                    </DropdownMenuItem>
                                  )}

                                  {property.type === "venta" && property.status !== "vendida" && (
                                    <DropdownMenuItem onClick={() => confirmUpdateStatus(property, "vendida")}>
                                      <span className="mr-2 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                      </span>
                                      <span>Marcar como vendida</span>
                                    </DropdownMenuItem>
                                  )}

                                  {property.type === "alquiler" && property.status !== "alquilada" && (
                                    <DropdownMenuItem onClick={() => confirmUpdateStatus(property, "alquilada")}>
                                      <span className="mr-2 h-4 w-4 rounded-full bg-purple-100 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                                      </span>
                                      <span>Marcar como alquilada</span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => confirmDeleteProperty(property)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Eliminar</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venta" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Propiedades en Venta</CardTitle>
              <CardDescription>
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Home className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay propiedades en venta</h3>
                  <p className="text-gray-500">
                    {searchTerm || Object.values(filterOptions).some((val) => val !== "" && val !== "all")
                      ? "No se encontraron propiedades que coincidan con tu búsqueda."
                      : "Aún no hay propiedades en venta registradas."}
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/admin/propiedades/nueva">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar propiedad
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => {
                        // Obtener la imagen principal
                        const mainImage = property.images?.find((img) => img.main_image) || property.images?.[0]

                        return (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.id}</TableCell>
                            <TableCell>
                              <div className="relative h-10 w-14 rounded overflow-hidden">
                                <Image
                                  src={mainImage?.url || "/placeholder.svg?height=40&width=60"}
                                  alt={property.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{property.title}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{property.location}</TableCell>
                            <TableCell>{formatPrice(property.price, property.type)}</TableCell>
                            <TableCell>{getStatusBadge(property.status)}</TableCell>
                            <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="12" cy="5" r="1" />
                                      <circle cx="12" cy="19" r="1" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/propiedades/${property.id}`} target="_blank">
                                      <Eye className="mr-2 h-4 w-4" />
                                      <span>Ver</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/propiedades/editar/${property.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Editar</span>
                                    </Link>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  {/* Opciones de cambio de estado */}
                                  {property.status !== "activa" && (
                                    <DropdownMenuItem onClick={() => confirmUpdateStatus(property, "activa")}>
                                      <span className="mr-2 h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-green-600"></span>
                                      </span>
                                      <span>Marcar como activa</span>
                                    </DropdownMenuItem>
                                  )}

                                  {property.status !== "vendida" && (
                                    <DropdownMenuItem onClick={() => confirmUpdateStatus(property, "vendida")}>
                                      <span className="mr-2 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                      </span>
                                      <span>Marcar como vendida</span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => confirmDeleteProperty(property)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Eliminar</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alquiler" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Propiedades en Alquiler</CardTitle>
              <CardDescription>
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Building className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No hay propiedades en alquiler</h3>
                  <p className="text-gray-500">
                    {searchTerm || Object.values(filterOptions).some((val) => val !== "" && val !== "all")
                      ? "No se encontraron propiedades que coincidan con tu búsqueda."
                      : "Aún no hay propiedades en alquiler registradas."}
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/admin/propiedades/nueva">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar propiedad
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => {
                        // Obtener la imagen principal
                        const mainImage = property.images?.find((img) => img.main_image) || property.images?.[0]

                        return (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.id}</TableCell>
                            <TableCell>
                              <div className="relative h-10 w-14 rounded overflow-hidden">
                                <Image
                                  src={mainImage?.url || "/placeholder.svg?height=40&width=60"}
                                  alt={property.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{property.title}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{property.location}</TableCell>
                            <TableCell>{formatPrice(property.price, property.type)}</TableCell>
                            <TableCell>{getStatusBadge(property.status)}</TableCell>
                            <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="12" cy="5" r="1" />
                                      <circle cx="12" cy="19" r="1" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/propiedades/${property.id}`} target="_blank">
                                      <Eye className="mr-2 h-4 w-4" />
                                      <span>Ver</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/propiedades/editar/${property.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Editar</span>
                                    </Link>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  {/* Opciones de cambio de estado */}
                                  {property.status !== "activa" && (
                                    <DropdownMenuItem onClick={() => confirmUpdateStatus(property, "activa")}>
                                      <span className="mr-2 h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-green-600"></span>
                                      </span>
                                      <span>Marcar como activa</span>
                                    </DropdownMenuItem>
                                  )}

                                  {property.status !== "alquilada" && (
                                    <DropdownMenuItem onClick={() => confirmUpdateStatus(property, "alquilada")}>
                                      <span className="mr-2 h-4 w-4 rounded-full bg-purple-100 flex items-center justify-center">
                                        <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                                      </span>
                                      <span>Marcar como alquilada</span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => confirmDeleteProperty(property)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Eliminar</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación para eliminar propiedad */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la propiedad "{propertyToDelete?.title}" y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProperty} className="bg-red-600 text-white hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para cambiar estado */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar estado de la propiedad</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas marcar la propiedad "{propertyToUpdateStatus?.property.title}" como{" "}
              {getStatusText(propertyToUpdateStatus?.newStatus || "")}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
