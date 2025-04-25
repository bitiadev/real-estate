"use client"

import type React from "react"
import AdminSidebar from "@/components/admin-sidebar"
import AdminHeader from "@/components/admin-header"
import { Menu } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, isLoading } = useAuth()
  // Verificar si el usuario está cargando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <AdminHeader /> */}
      {user && <AdminSidebar />}
      <button
        type="button"
        className="fixed top-30 right-2 lg:hidden mr-4 text-gray-500 bg-white p-1 rounded-md"
        onClick={() => {
          // Buscar el elemento con el ID "mobile-sidebar-toggle" y hacer clic en él
          const toggleButton = document.getElementById("mobile-sidebar-toggle")
          if (toggleButton) {
            toggleButton.click()
          }
        }}
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className={`${user && 'lg:pl-64'}`}>
        <div className="flex flex-col min-h-screen">{children}</div>
      </div>
    </div>
  )
}
