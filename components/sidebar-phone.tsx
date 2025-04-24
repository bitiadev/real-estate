"use client"
import { Building, Home, LogOut, Settings, User, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function SidebarPhone() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
  }

  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden ${
        sidebarOpen ? "block" : "hidden"
      }`}
    >
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-xl">
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-gray-700" />
            <span className="ml-2 font-semibold">Inmobiliaria Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} title="Close sidebar">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center px-3 py-2 text-gray-700 rounded-md bg-gray-100"
            >
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/admin/propiedades"
              className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
            >
              <Building className="h-5 w-5 mr-2" />
              Propiedades
            </Link>
            <Link
              href="/admin/leads"
              className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
            >
              <Users className="h-5 w-5 mr-2" />
              Leads
            </Link>
            <Link
              href="/admin/usuarios"
              className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
            >
              <User className="h-5 w-5 mr-2" />
              Usuarios
            </Link>
            <Link
              href="/admin/configuracion"
              className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50"
            >
              <Settings className="h-5 w-5 mr-2" />
              Configuración
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-600"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
