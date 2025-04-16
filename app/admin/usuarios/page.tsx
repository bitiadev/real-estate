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
import { Search, Plus, Edit, Trash2, ArrowUpDown, Loader2, User, UserPlus, Mail, Calendar, Clock } from "lucide-react"
import { getAllUsers, deleteUser } from "@/lib/user-service"
import type { User as UserType } from "@/lib/user-service"
import { useToast } from "@/hooks/use-toast"

export default function UsersAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null)

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers()
  }, [])

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    filterUsers()
  }, [searchTerm, users, sortBy])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) => user.email.toLowerCase().includes(term) || user.id.toLowerCase().includes(term),
      )
    }

    // Ordenar usuarios
    filtered = sortUsers(filtered, sortBy)

    setFilteredUsers(filtered)
  }

  const sortUsers = (usersList: UserType[], option: string) => {
    const sorted = [...usersList]

    switch (option) {
      case "email-asc":
        return sorted.sort((a, b) => a.email.localeCompare(b.email))
      case "email-desc":
        return sorted.sort((a, b) => b.email.localeCompare(a.email))
      case "newest":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "last-login":
        return sorted.sort((a, b) => {
          if (!a.last_sign_in_at) return 1
          if (!b.last_sign_in_at) return -1
          return new Date(b.last_sign_in_at).getTime() - new Date(a.last_sign_in_at).getTime()
        })
      default:
        return sorted
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSortBy("newest")
  }

  const confirmDeleteUser = (user: UserType) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const success = await deleteUser(userToDelete.id)
      if (success) {
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado correctamente.",
        })
        // Actualizar la lista de usuarios
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      } else {
        throw new Error("No se pudo eliminar el usuario")
      }
    } catch (error) {
      console.error("Error al eliminar el usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca"
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios con acceso al sistema</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/admin/usuarios/nuevo">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo usuario
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Buscar por email o ID..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
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
                  <SelectItem value="email-asc">Email: A-Z</SelectItem>
                  <SelectItem value="email-desc">Email: Z-A</SelectItem>
                  <SelectItem value="last-login">Último acceso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={resetFilters}>
                Limpiar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} {filteredUsers.length === 1 ? "usuario encontrado" : "usuarios encontrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No hay usuarios</h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "No se encontraron usuarios que coincidan con tu búsqueda."
                  : "Aún no hay usuarios registrados."}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/admin/usuarios/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar usuario
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de creación</TableHead>
                    <TableHead>Último acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-xs truncate max-w-[100px]">{user.id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                          Administrador
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatDate(user.last_sign_in_at)}
                        </div>
                      </TableCell>
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
                              <Link href={`/admin/usuarios/editar/${user.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem className="text-red-600" onClick={() => confirmDeleteUser(user)}>
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

      {/* Diálogo de confirmación para eliminar usuario */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el usuario "{userToDelete?.email}" y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 text-white hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
