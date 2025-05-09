"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Building, Menu, X } from "lucide-react"
import siteConfig from "@/config/siteConfig.json"
import Image from "next/image"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="px-4 md:px-8 sticky top-0 z-50 w-full border-b bg-white flex justify-center text-naranja">
      <div className="w-full flex h-16 md:h-24  items-center justify-between">
        <div className="flex items-center gap-2 md:ml-[20%]">
          <Link href="/" className="flex items-center gap-2">
            {/* <Building className="h-6 w-6" /> */}
            <Image
              src="/logo.svg"
              alt="Logo"
              width={90}
              height={70}
              className="block h-12 w-16 md:ml-4 md:h-20 md:w-28"
            />
            {/* <span className="text-lg font-bold">{siteConfig.empresa}</span> */}
          </Link>
        </div>

        <nav className="hidden md:flex gap-6 mr-[20%]">
          <div className="align-center flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:underline">
              Inicio
            </Link>
            <Link href="/propiedades" className="text-sm font-medium hover:underline">
              Propiedades
            </Link>
            {/* <Link href="#" className="text-sm font-medium hover:underline">
              Servicios
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              Nosotros
            </Link> */}
            <Link href="#footer" className="text-sm font-medium hover:underline">
              Contacto
            </Link>
            <Link
              href="https://wa.me/542983526754?text=Hola%20!%20necesito%20tasar%20una%20propiedad"
              className="text-sm font-medium p-2 bg-naranja text-white rounded-md hover:bg-naranja/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pedi tu tasación
            </Link>
          </div>
        </nav>

     {/*    <div className="hidden md:flex gap-4">
          <Link href="/admin/login">
            <Button variant="outline">Acceso Admin</Button>
          </Link>
        </div> */}

        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>          
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-8 w-8" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b py-4">                
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                  {/* <Building className="h-6 w-6" /> */}
                  <Image
                    src="/logo.svg"
                    alt="Logo"
                    width={70}
                    height={70}
                    className="block md:hidden ml-4"
                  />                 
                </Link>
               {/*  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close menu</span>
                </Button> */}
              </div>
              <nav className="flex flex-col items-center gap-12 py-8 text-naranja">
                <Link href="/" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Inicio
                </Link>
                <Link href="/propiedades" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Propiedades
                </Link>
               {/*  <Link href="#" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Servicios
                </Link>
                <Link href="#" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Nosotros
                </Link> */}
                <Link href="#footer" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Contacto
                </Link>
                <Link
                  href="https://wa.me/542983526754?text=Hola%20!%20necesito%20tasar%20una%20propiedad"
                  className="text-lg font-medium p-2 border-naranja border rounded-md bg-blanco"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pedi tu tasación
                </Link>
              </nav>
              {/* <div className="mt-auto border-t py-6">
                <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-slate-100 text-slate-600">Acceso</Button>
                </Link>
              </div> */}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
