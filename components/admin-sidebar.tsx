"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building, Home, LogOut, Menu, Settings, User, X, UserPlus, Chrome, Globe } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <>
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-gray-700" />
              <span className="ml-2 font-semibold">Administrador</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActive("/admin/dashboard")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
              <Link
                href="/admin/propiedades"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActive("/admin/propiedades")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Building className="h-5 w-5 mr-2" />
                Propiedades
              </Link>
              <Link
                href="/admin/usuarios"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActive("/admin/usuarios")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <User className="h-5 w-5 mr-2" />
                Usuarios
              </Link>
              <Link
                href="/admin/leads"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActive("/admin/leads")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Leads
              </Link>
              {/* <Link
                href="/admin/configuracion"
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActive("/admin/configuracion")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="h-5 w-5 mr-2" />
                Configuración
              </Link> */}
              <Link
                href="/"
                className={`flex items-center px-3 py-2 rounded-md ${
                  pathname === "/"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Globe className="h-5 w-5 mr-2" />
                Web cliente
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

      {/* Botón para abrir sidebar en móvil */}
      <button
        id="mobile-sidebar-toggle"
        type="button"
        className="lg:hidden fixed z-40 top-4 left-4 p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none bg-white shadow-md"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex items-center h-16 md:h-24 px-6 border-b">
          <Building className="h-6 w-6 text-gray-700" />
          <span className="ml-2 font-semibold">Inmobiliaria Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            <Link
              href="/admin/dashboard"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/admin/dashboard")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/admin/propiedades"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/admin/propiedades")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Building className="h-5 w-5 mr-2" />
              Propiedades
            </Link>
            <Link
              href="/admin/usuarios"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/admin/usuarios")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <User className="h-5 w-5 mr-2" />
              Usuarios
            </Link>
            <Link
              href="/admin/leads"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/admin/leads")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Leads
            </Link>
            {/* <Link
              href="/admin/configuracion"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/admin/configuracion")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Configuración
            </Link> */}
            <Link
              href="/"
              className={`flex items-center px-3 py-2 rounded-md ${
                pathname === "/"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Globe className="h-5 w-5 mr-2" />
              Web cliente
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
    </>
  )
}
