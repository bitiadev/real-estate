"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Building, Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <span className="text-lg font-bold">Inmobiliaria</span>
          </Link>
        </div>

        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium hover:underline">
            Inicio
          </Link>
          <Link href="/propiedades" className="text-sm font-medium hover:underline">
            Propiedades
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Servicios
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Nosotros
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Contacto
          </Link>
        </nav>

        <div className="hidden md:flex gap-4">
          <Link href="/admin/login">
            <Button variant="outline">Acceso Admin</Button>
          </Link>
        </div>

        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b py-4">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  <Building className="h-6 w-6" />
                  <span className="text-lg font-bold">Inmobiliaria</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="flex flex-col gap-4 py-6">
                <Link href="/" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Inicio
                </Link>
                <Link href="/propiedades" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Propiedades
                </Link>
                <Link href="#" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Servicios
                </Link>
                <Link href="#" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Nosotros
                </Link>
                <Link href="#" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Contacto
                </Link>
              </nav>
              <div className="mt-auto border-t py-6">
                <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Acceso Admin</Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
