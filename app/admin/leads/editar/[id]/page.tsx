"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Currency, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getLeadById, updateLead } from "@/lib/lead-service"
import AdminHeader from "@/components/admin-header"
import categories from '@/data/categories.json' 

export default function EditarLead({ params }: { params: Promise<{ id: string }> }) {
  const [leadId, setLeadId] = useState<number | null>(null);
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isLoadingLead, setIsLoadingLead] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    property_type: "venta",
    property_category: "",
    budget: "",
    currency: "ARS",
    notes: "",
    status: "pendiente",
  })

  // Cargar datos del lead
  useEffect(() => {
    const loadLead = async () => {
      const leadIdParam = await params;
      const leadId = Number(leadIdParam.id)
      setLeadId(leadId)
      setIsLoadingLead(true)
      try {
        const lead = await getLeadById(leadId)

        if (!lead) {
          toast({
            title: "Error",
            description: "No se pudo encontrar el lead.",
            variant: "destructive",
          })
          router.push("/admin/leads")
          return
        }

        // Cargar datos del formulario
        setFormData({
          name: lead.name,
          phone: lead.phone,
          property_type: lead.property_type,
          property_category: lead.property_category,
          budget: lead.budget.toString(),
          currency: lead.currency,
          notes: lead.notes || "",
          status: lead.status,
        })
      } catch (error) {
        console.error("Error al cargar el lead:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el lead. Inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingLead(false)
      }
    }

    loadLead()
  }, [leadId, router, toast])

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
        property_category: formData.property_category,
        budget: Number(formData.budget),
        currency: formData.currency,
        notes: formData.notes,
        status: formData.status,
      }

      const success = leadId && await updateLead(leadId, leadData)

      if (!success) {
        throw new Error("No se pudo actualizar el lead")
      }

      toast({
        title: "Lead actualizado",
        description: "El lead ha sido actualizado exitosamente.",
      })

      // Redirigir a la lista de leads
      router.push("/admin/leads")
    } catch (error) {
      console.error("Error al actualizar el lead:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el lead. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingLead) {
    return (
      <>
        <AdminHeader showSearch={false} />
        <div className="max-w-2xl py-8 flex flex-col items-center justify-center mx-auto">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500">Cargando lead...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader showSearch={false} />
      <div className="max-w-2xl py-8 mx-auto md:max-w-full md:mx-10 px-4 md:px-6">
        <h1 className="text-2xl font-bold mb-4">Editar Lead</h1>
        <Link href="/admin/leads" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 w-full justify-end">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a leads
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Formulario edición Lead</CardTitle>
            <CardDescription>Actualiza la información del cliente potencial</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="property_type">Operacion</Label>
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
                    <Label htmlFor="property_category">Tipo</Label>
                    <Select
                      value={formData.property_category}
                      onValueChange={(value) => handleSelectChange("property_category", value)}
                    >
                      <SelectTrigger id="property_category">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
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

                  <div className="grid gap-3">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleSelectChange("currency", value)}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Selecciona la moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ARS">ARS</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
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
                    "Guardar cambios"
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
