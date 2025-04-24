"use client"
import { Building, Home, LogOut, Settings, User, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function SidebarDesktop() {

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
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
      <div className="flex items-center h-16 md:h-24 px-6 border-b">
        <Building className="h-6 w-6 text-gray-700" />
        <span className="ml-2 font-semibold">Inmobiliaria Admin</span>
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
  );
}
