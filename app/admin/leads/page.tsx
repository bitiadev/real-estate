"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Search, Plus, Edit, Trash2, ArrowUpDown, Loader2, UserPlus, Phone, Calendar } from "lucide-react"
import { getAllLeads, updateLead, deleteLead } from "@/lib/lead-service"
import type { Lead } from "@/lib/lead-service"
import { useToast } from "@/hooks/use-toast"

export default function LeadsAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [leadToUpdateStatus, setLeadToUpdateStatus] = useState<{
    lead: Lead
    newStatus: string
  } | null>(null)
  const [filterOptions, setFilterOptions] = useState({
    property_type: "all",
    status: "all",
  })

  // Cargar leads al montar el componente
  useEffect(() => {
    loadLeads()
  }, [])

  // Filtrar leads cuando cambia el término de búsqueda o los filtros
  useEffect(() => {
    filterLeads()
  }, [searchTerm, leads, sortBy, filterOptions])

  const loadLeads = async () => {
    setIsLoading(true)
    try {
      const data = await getAllLeads()
      setLeads(data)
    } catch (error) {
      console.error("Error al cargar leads:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los leads. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterLeads = () => {
    let filtered = [...leads]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(term) ||
          lead.phone.toLowerCase().includes(term) ||
          lead.notes?.toLowerCase().includes(term),
      )
    }

    // Filtrar por tipo de propiedad
    if (filterOptions.property_type !== "all") {
      filtered = filtered.filter((lead) => lead.property_type === filterOptions.property_type)
    }

    // Filtrar por estado
    if (filterOptions.status !== "all") {
      filtered = filtered.filter((lead) => lead.status === filterOptions.status)
    }

    // Ordenar leads
    filtered = sortLeads(filtered, sortBy)

    setFilteredLeads(filtered)
  }

  const sortLeads = (leadsList: Lead[], option: string) => {
    const sorted = [...leadsList]

    switch (option) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case "budget-asc":
        return sorted.sort((a, b) => a.budget - b.budget)
      case "budget-desc":
        return sorted.sort((a, b) => b.budget - a.budget)
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

  const handleFilterChange = (name: string, value: string) => {
    setFilterOptions((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilterOptions({
      property_type: "all",
      status: "all",
    })
    setSearchTerm("")
    setSortBy("newest")
  }

  const confirmDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead)
    setDeleteDialogOpen(true)
  }

  const handleDeleteLead = async () => {
    if (!leadToDelete) return

    try {
      const success = await deleteLead(leadToDelete.id)
      if (success) {
        toast({
          title: "Lead eliminado",
          description: "El lead ha sido eliminado correctamente.",
        })
        // Actualizar la lista de leads
        setLeads((prev) => prev.filter((p) => p.id !== leadToDelete.id))
      } else {
        throw new Error("No se pudo eliminar el lead")
      }
    } catch (error) {
      console.error("Error al eliminar el lead:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el lead. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setLeadToDelete(null)
    }
  }

  const confirmUpdateStatus = (lead: Lead, newStatus: string) => {
    setLeadToUpdateStatus({ lead, newStatus })
    setStatusDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!leadToUpdateStatus) return

    try {
      const { lead, newStatus } = leadToUpdateStatus
      const success = await updateLead(lead.id, { status: newStatus })

      if (success) {
        toast({
          title: "Estado actualizado",
          description: `El lead ahora está ${getStatusText(newStatus)}.`,
        })

        // Actualizar la lista de leads
        setLeads((prev) => prev.map((p) => (p.id === lead.id ? { ...p, status: newStatus } : p)))
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
      setLeadToUpdateStatus(null)
    }
  }

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(budget)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendiente":
        return "pendiente"
      case "en_proceso":
        return "en proceso"
      case "resuelto":
        return "resuelto"
      case "cancelado":
        return "cancelado"
      default:
        return status
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
            Pendiente
          </Badge>
        )
      case "en_proceso":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            En proceso
          </Badge>
        )
      case "resuelto":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Resuelto
          </Badge>
        )
      case "cancelado":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getPropertyTypeBadge = (type: string) => {
    switch (type) {
      case "venta":
        return (
          <Badge variant="outline" className="bg-gray-50">
            Compra
          </Badge>
        )
      case "alquiler":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Alquiler
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
          <h1 className="text-3xl font-bold mb-1 text-center">Gestión de Leads</h1>
          <p className="text-gray-500 text-center">Administra los clientes potenciales interesados en propiedades</p>
        </div>
        <div className="mt-4 sm:mt-0 text-end">
          <Button asChild>
            <Link href="/admin/leads/nuevo">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo lead
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Buscar por nombre, teléfono..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div>
              <Select
                value={filterOptions.property_type}
                onValueChange={(value) => handleFilterChange("property_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de operacion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="venta">Compra</SelectItem>
                  <SelectItem value="alquiler">Alquiler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterOptions.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_proceso">En proceso</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
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
                  <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                  <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
                  <SelectItem value="budget-asc">Presupuesto: menor a mayor</SelectItem>
                  <SelectItem value="budget-desc">Presupuesto: mayor a menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            {filteredLeads.length} {filteredLeads.length === 1 ? "lead encontrado" : "leads encontrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <UserPlus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No hay leads</h3>
              <p className="text-gray-500">
                {searchTerm || Object.values(filterOptions).some((val) => val !== "all")
                  ? "No se encontraron leads que coincidan con tu búsqueda."
                  : "Aún no hay leads registrados."}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/admin/leads/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar lead
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {lead.phone}
                        </div>
                      </TableCell>
                      <TableCell>{getPropertyTypeBadge(lead.property_type)}</TableCell>
                      <TableCell>{formatBudget(lead.budget)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(lead.request_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
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
                              <Link href={`/admin/leads/editar/${lead.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Opciones de cambio de estado */}
                            {lead.status !== "pendiente" && (
                              <DropdownMenuItem onClick={() => confirmUpdateStatus(lead, "pendiente")}>
                                <span className="mr-2 h-4 w-4 rounded-full bg-yellow-100 flex items-center justify-center">
                                  <span className="h-2 w-2 rounded-full bg-yellow-600"></span>
                                </span>
                                <span>Marcar como pendiente</span>
                              </DropdownMenuItem>
                            )}

                            {lead.status !== "en_proceso" && (
                              <DropdownMenuItem onClick={() => confirmUpdateStatus(lead, "en_proceso")}>
                                <span className="mr-2 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                </span>
                                <span>Marcar como en proceso</span>
                              </DropdownMenuItem>
                            )}

                            {lead.status !== "resuelto" && (
                              <DropdownMenuItem onClick={() => confirmUpdateStatus(lead, "resuelto")}>
                                <span className="mr-2 h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="h-2 w-2 rounded-full bg-green-600"></span>
                                </span>
                                <span>Marcar como resuelto</span>
                              </DropdownMenuItem>
                            )}

                            {lead.status !== "cancelado" && (
                              <DropdownMenuItem onClick={() => confirmUpdateStatus(lead, "cancelado")}>
                                <span className="mr-2 h-4 w-4 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                                </span>
                                <span>Marcar como cancelado</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem className="text-red-600" onClick={() => confirmDeleteLead(lead)}>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar lead */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el lead "{leadToDelete?.name}" y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLead} className="bg-red-600 text-white hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para cambiar estado */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar estado del lead</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas marcar el lead "{leadToUpdateStatus?.lead.name}" como{" "}
              {getStatusText(leadToUpdateStatus?.newStatus || "")}?
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
