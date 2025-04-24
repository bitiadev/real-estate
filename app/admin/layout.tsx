"use client"

import type React from "react"
import AdminSidebar from "@/components/admin-sidebar"
import AdminHeader from "@/components/admin-header"
import { Menu } from "lucide-react"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <AdminHeader /> */}
      <AdminSidebar />
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
      <div className="lg:pl-64">
        <div className="flex flex-col min-h-screen">{children}</div>
      </div>
    </div>
  )
}
