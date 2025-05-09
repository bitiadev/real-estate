"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createLead } from "@/lib/lead-service"
import AdminHeader from "@/components/admin-header"

export default function NuevoLead() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    property_type: "venta",
    budget: "",
    notes: "",
    status: "pendiente",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const leadData = {
        name: formData.name,
        phone: formData.phone,
        property_type: formData.property_type,
        budget: Number(formData.budget),
        notes: formData.notes,
        status: formData.status,
        request_date: new Date().toISOString(),
      }

      const leadId = await createLead(leadData)

      if (!leadId) {
        throw new Error("No se pudo crear el lead")
      }

      toast({
        title: "Lead creado",
        description: "El lead ha sido creado exitosamente.",
      })

      // Redirigir a la lista de leads
      router.push("/admin/leads")
    } catch (error) {
      console.error("Error al guardar el lead:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el lead. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="px-4 md:px-8 w-full py-8">
        <Link href="/admin/leads" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a leads
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Lead</CardTitle>
            <CardDescription>Registra un nuevo cliente potencial interesado en propiedades</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Juan Pérez"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Ej: +54 11 1234-5678"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="property_type">Tipo de operacion</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={(value) => handleSelectChange("property_type", value)}
                    >
                      <SelectTrigger id="property_type">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="venta">Venta</SelectItem>
                        <SelectItem value="alquiler">Alquiler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="budget">Presupuesto</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      placeholder="Ej: 250000"
                      required
                      value={formData.budget}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_proceso">En proceso</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Detalles adicionales sobre el interés del cliente..."
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={() => router.push("/admin/leads")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    "Guardar lead"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
