import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import PropertyCard from "@/components/property-card"
import { Building, Home, Search } from "lucide-react"
import { getAllProperties } from "@/lib/property-service"
import Hero from '@/components/Hero'
import Navbar from "@/components/navbar"

// Hacer que la página sea dinámica para que se actualice con los datos más recientes
export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidar cada hora

export default async function HomePage() {
  // Obtener propiedades desde la base de datos
  const allProperties = await getAllProperties()

  // Filtrar solo propiedades activas
  const activeProperties = allProperties.filter((p) => p.status === "activa")

  // Seleccionar propiedades destacadas (las 3 más recientes)
  const featuredProperties = activeProperties
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

   // Configuración de imágenes para el carrusel del Hero
  // Estas imágenes se mostrarán según el tipo de dispositivo (desktop, tablet, mobile)
  const heroImages = {
    desktop: [
      '/images/hero/slide-1.jpg',
      '/images/hero/slide-2.jpg',
      '/images/hero/slide-3.jpg',
      '/images/hero/slide-4.jpg',      
    ],
    tablet: [
      '/images/hero/slide-1.jpg',
      '/images/hero/slide-2.jpg',
    ],
    mobile: [
      '/images/hero/slide-1.jpg',
      '/images/hero/slide-2.jpg',
      '/images/hero/slide-3.jpg',
      '/images/hero/slide-4.jpg',
    ],
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Navbar />
      <Hero 
        type="carousel" 
        images={heroImages}
      />  
     
      {/* Featured Properties */}
      <section className="w-full py-12 md:py-24 bg-white z-10">
        <div className="px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Propiedades Destacadas</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl">Descubre nuestras propiedades más exclusivas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {featuredProperties.length > 0 ? (
              featuredProperties.map((property) => <PropertyCard key={property.id} property={property} />)
            ) : (
              // Mostrar mensaje si no hay propiedades
              <div className="col-span-3 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No hay propiedades destacadas disponibles en este momento.</p>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-10">
            <Link href="/propiedades">
              <Button variant="outline" size="lg">
                Ver todas las propiedades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="w-full py-12 md:py-24 bg-gray-50 z-10">
        <div className="px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Nuestros Servicios</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl">
                Ofrecemos soluciones completas para tus necesidades inmobiliarias
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <Home className="h-12 w-12 text-gray-700" />
                <h3 className="text-xl font-bold">Compra de Propiedades</h3>
                <p className="text-gray-500">Te ayudamos a encontrar la propiedad perfecta para vos y tu familia</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <Building className="h-12 w-12 text-gray-700" />
                <h3 className="text-xl font-bold">Alquiler de Propiedades</h3>
                <p className="text-gray-500">Amplia variedad de opciones de alquiler para todos los presupuestos</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <Search className="h-12 w-12 text-gray-700" />
                <h3 className="text-xl font-bold">Asesoramiento</h3>
                <p className="text-gray-500">Asesoramiento profesional en todas las etapas de compra o alquiler</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
