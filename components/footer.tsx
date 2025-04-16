import Link from "next/link"
import { Building, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react"
import siteConfig from "@/config/siteConfig.json"

export default function Footer() {
  return (
    <footer className="bg-azul text-gray-300">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-6 w-6" />
              <span className="text-xl font-bold text-white">Inmobiliaria</span>
            </div>
            <p className="text-sm mb-4">
              Ofrecemos las mejores propiedades en venta y alquiler con un servicio personalizado y profesional.
            </p>
            <div className="flex space-x-4">
              <Link href={siteConfig.facebook} className="hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href={siteConfig.instagram} className="hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/propiedades" className="hover:text-white">
                  Propiedades
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Propiedades</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white">
                  Casas en venta
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Apartamentos en venta
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Casas en alquiler
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Apartamentos en alquiler
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Oficinas comerciales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <a href={siteConfig.direccionGoogleMaps} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5" />
                  <span>{siteConfig.domicilio}</span>
                </a>
              </li>
              <li className="flex items-center">
                <a href={`tel:${siteConfig.telefono}`} className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{siteConfig.telefono}</span>
                </a>
              </li>
              <li className="flex items-center">
                <a href={`mailto:${siteConfig.email}`} className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{siteConfig.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Inmobiliaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
