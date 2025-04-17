"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import siteConfig from "@/config/siteConfig.json"

export default function StickyWhatsAppButton() {
  const pathname = usePathname()
  const [message, setMessage] = useState("Hola, me gustaría obtener más información.")

  useEffect(() => {
    // Si estamos en una propiedad específica, personalizar el mensaje
    if (pathname.startsWith("/propiedades/")) {
      const propertyId = pathname.split("/").pop()
      setMessage(`Hola, me interesa la propiedad con ID: ${propertyId}. ¿Podrías darme más información?`)
    }
  }, [pathname])

  // Normalizar el número de teléfono
  const normalizePhoneNumber = (phone: string) => {
    return phone.replace(/[^0-9]/g, "") // Eliminar caracteres no numéricos
  }

  const whatsappNumber = normalizePhoneNumber(siteConfig.telefono)

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all"
      title="Chatea con nosotros en WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </a>
  )
}