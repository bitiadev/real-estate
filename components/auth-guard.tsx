"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Verificar si la ruta actual es una ruta de administración
    const isAdminRoute = pathname?.startsWith("/admin") && pathname !== "/admin/login"

    if (!isLoading) {
      if (!user && isAdminRoute) {
        // Redirigir al login si no hay usuario y es una ruta protegida
        router.push("/admin/login")
      }
    }
  }, [user, isLoading, router, pathname])

  // Mostrar un estado de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Verificar si es una ruta de administración y no hay usuario
  const isAdminRoute = pathname?.startsWith("/admin") && pathname !== "/admin/login"
  if (isAdminRoute && !user) {
    return null // No renderizar nada mientras se redirige
  }

  return <>{children}</>
}
