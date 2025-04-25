"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { updateUser } from "@/lib/user-service"

export default function EditarUsuario({ params }: { params: { id: string } }) {
  const userId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  // Cargar datos del usuario
  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true)
      try {
        const { data, error } = await supabase.auth.admin.getUserById(userId)

        if (error) {
          throw error
        }

        if (data && data.user) {
          setFormData({
            email: data.user.email || "",
            password: "",
            confirmPassword: "",
          })
        } else {
          toast({
            title: "Error",
            description: "No se pudo encontrar el usuario.",
            variant: "destructive",
          })
          router.push("/admin/usuarios")
        }
      } catch (error) {
        console.error("Error al cargar el usuario:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el usuario. Inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUser(false)
      }
    }

    loadUser()
  }, [userId, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validar que las contraseñas coincidan si se está cambiando
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      const updateData: { email?: string; password?: string } = {}

      // Solo incluir email si ha cambiado
      if (formData.email) {
        updateData.email = formData.email
      }

      // Solo incluir password si se ha proporcionado uno nuevo
      if (formData.password) {
        updateData.password = formData.password
      }

      const success = await updateUser(userId, updateData)

      if (!success) {
        throw new Error("No se pudo actualizar el usuario")
      }

      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente.",
      })

      // Redirigir a la lista de usuarios
      router.push("/admin/usuarios")
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error)
      setError(error.message || "Ocurrió un error al actualizar el usuario")
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al actualizar el usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingUser) {
    return (
      <div className="container max-w-md py-8 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Cargando usuario...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-8">
      <Link href="/admin/usuarios" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a usuarios
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
          <CardDescription>Actualiza la información del usuario administrador</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva Contraseña (dejar en blanco para mantener la actual)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => router.push("/admin/usuarios")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
