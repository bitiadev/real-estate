"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building, Home, LogOut, Menu, Plus, Search, Settings, User, X, Edit, Trash2, Loader2 } from "lucide-react"
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
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getAllProperties, updatePropertyStatus, deleteProperty } from "@/lib/property-service"
import type { Property } from "@/lib/property-service"

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTab, setCurrentTab] = useState("todas")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [propertyToUpdateStatus, setPropertyToUpdateStatus] = useState<{
    property: Property
    newStatus: string
  } | null>(null)

  const { user, signOut } = useAuth()
  const { toast } = useToast()

  // Cargar propiedades al montar el componente
  useEffect(() => {
    loadProperties()
  }, [])

  // Filtrar propiedades cuando cambia el término de búsqueda o la pestaña
  useEffect(() => {
    filterProperties()
  }, [searchTerm, currentTab, properties])

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
        (property) => property.title.toLowerCase().includes(term) || property.location.toLowerCase().includes(term),
      )
    }

    setFilteredProperties(filtered)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
  }

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
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

  // Calcular estadísticas
  const stats = {
    total: properties.length,
    venta: properties.filter((p) => p.type === "venta").length,
    alquiler: properties.filter((p) => p.type === "alquiler").length,
    vendidas: properties.filter((p) => p.status === "vendida" || p.status === "alquilada").length,
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-gray-700" />
              <span className="ml-2 font-semibold">Inmobiliaria Admin</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} title="Close sidebar">
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              <Link
                href="/admin/dashboard"
                className="flex items-center px-3 py-2 text-gray-700 rounded-md bg-gray-100"
              >
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
              <Link
                href="/admin/propiedades"
                className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
              >
                <Building className="h-5 w-5 mr-2" />
                Propiedades
              </Link>
              <Link
                href="/admin/usuarios"
                className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
              >
                <User className="h-5 w-5 mr-2" />
                Usuarios
              </Link>
              <Link
                href="/admin/configuracion"
                className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
              >
                <Settings className="h-5 w-5 mr-2" />
                Configuración
              </Link>
            </nav>
          </div>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start text-gray-600" onClick={handleSignOut}>
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex items-center h-16 px-6 border-b">
          <Building className="h-6 w-6 text-gray-700" />
          <span className="ml-2 font-semibold">Inmobiliaria Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            <Link href="/admin/dashboard" className="flex items-center px-3 py-2 text-gray-700 rounded-md bg-gray-100">
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/admin/propiedades"
              className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
            >
              <Building className="h-5 w-5 mr-2" />
              Propiedades
            </Link>
            <Link
              href="/admin/usuarios"
              className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
            >
              <User className="h-5 w-5 mr-2" />
              Usuarios
            </Link>
            <Link
              href="/admin/configuracion"
              className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
            >
              <Settings className="h-5 w-5 mr-2" />
              Configuración
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start text-gray-600" onClick={handleSignOut}>
            <LogOut className="h-5 w-5 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b border-gray-200 px-4 sm:px-6">
          <button type="button" className="lg:hidden mr-4 text-gray-500" onClick={() => setSidebarOpen(true)} title="Open sidebar">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full max-w-lg lg:max-w-xs">
                <label htmlFor="search" className="sr-only">
                  Buscar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="search"
                    placeholder="Buscar propiedades..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">{user?.email || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="mt-4 sm:mt-0">
              <Link href="/admin/propiedades/nueva">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva propiedad
                </Button>
              </Link>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Propiedades</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">En Venta</p>
                    <p className="text-3xl font-bold">{stats.venta}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Home className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">En Alquiler</p>
                    <p className="text-3xl font-bold">{stats.alquiler}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vendidas/Alquiladas</p>
                    <p className="text-3xl font-bold">{stats.vendidas}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  <CardDescription>Listado de todas las propiedades</CardDescription>
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
                        {searchTerm
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
                    <Table>
                      <TableHeader>
                        <TableRow>
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
                        {filteredProperties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.title}</TableCell>
                            <TableCell>{property.location}</TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="venta" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Propiedades en Venta</CardTitle>
                  <CardDescription>Listado de propiedades disponibles para venta</CardDescription>
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
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay propiedades en venta</h3>
                      <p className="text-gray-500">
                        {searchTerm
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProperties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.title}</TableCell>
                            <TableCell>{property.location}</TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alquiler" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Propiedades en Alquiler</CardTitle>
                  <CardDescription>Listado de propiedades disponibles para alquiler</CardDescription>
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
                        {searchTerm
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProperties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.title}</TableCell>
                            <TableCell>{property.location}</TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

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
