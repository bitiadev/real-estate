'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import Link from 'next/link'
import cities from '@/data/cities.json' 
import categories from '@/data/categories.json' 

// Componente de carrusel de imágenes
interface HeroCarouselProps {
  images: {
    mobile?: string[];
    tablet?: string[];
    desktop?: string[];
  };
}

const HeroCarousel = ({ images }: HeroCarouselProps) => {
  // Estado para el índice de la imagen actual y el tipo de dispositivo
  const [currentIndex, setCurrentIndex] = useState(0)
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [city, setCity] = useState('all')
  const [category, setCategory] = useState('all')
  const [operation, setOperation] = useState('all')

  // Efecto para detectar el tipo de dispositivo basado en el ancho de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setDeviceType('desktop')
      } else if (window.innerWidth >= 768) {
        setDeviceType('tablet')
      } else {
        setDeviceType('mobile')
      }
    }

    handleResize() // Llamada inicial
    window.addEventListener('resize', handleResize)

    // Limpieza del event listener
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Efecto para cambiar la imagen cada 5 segundos
  useEffect(() => {
    if (images && images[deviceType]) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % (images[deviceType]?.length ?? 1))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [images, deviceType])

  // Si no hay imágenes disponibles, muestra un mensaje
  if (!images || !images[deviceType] || images[deviceType].length === 0) {
    return <div className="text-[var(--color-text)]">No images available</div>
  }

  // Renderiza el carrusel de imágenes
  return (
    <div className="sticky top-24 w-full h-2/4 bg-[var(--color-background)]">
      {/* Imágenes del carrusel como fondo */}
      <div className="absolute inset-0">
        {images[deviceType].map((image, index) => (
          <Image
            key={image}
            src={image}
            alt={`Hero image ${index + 1}`}
            fill
            priority
            style={{ objectFit: 'cover' }}
            className={`transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Contenido superpuesto */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 md:flex justify-center">
        <div className="px-4 md:px-6 md:w-[60%]">
        <div className="flex flex-col items-center space-y-4 text-center rounded-lg shadow-lg p-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <div className="space-y-2 ">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl z-10 text-orange-600 drop-shadow-xl">
                Encuentra tu hogar ideal
              </h1>
              <p className="mx-auto max-w-[700px] md:text-xl z-10 text-orange-600">
                Las mejores propiedades en venta y alquiler en un solo lugar
              </p>
            </div>

            {/* Barra de búsqueda */}
            
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <Select onValueChange={(value) => setCity(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ciudad"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {
                        cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Select onValueChange={(value) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {
                        categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select onValueChange={(value) => setOperation(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Operacion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="alquiler">Alquiler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button className="w-full" asChild>
                    <Link href={`/propiedades?location=${city}&category=${category}&type=${operation}`}>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Componente de video de fondo
interface HeroVideoProps {
  videoSrc: string;
}

const HeroVideo = ({ videoSrc }: HeroVideoProps) => {
  return (
    <div className="relative w-full h-screen bg-[var(--color-background)]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

// Componente de texto con imagen
interface HeroTextImageProps {
  title: string;
  ctaText: string;
  imageSrc: string;
}

const HeroTextImage = ({ title, ctaText, imageSrc }: HeroTextImageProps) => {
  return (
    <div className="relative w-full h-screen flex items-center bg-[var(--color-background)]">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[var(--color-text)]">{title}</h1>
          <button className="btn-primary">
            {ctaText}
          </button>
        </div>
        <div className="md:w-1/2 relative h-64 md:h-96">
          <Image
            src={imageSrc}
            alt="Hero image"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}

// Componente Hero principal que selecciona el tipo de hero a mostrar
interface HeroProps {
  type: 'carousel' | 'video' | 'textImage';
  images?: {
    mobile?: string[];
    tablet?: string[];
    desktop?: string[];
  };
  videoSrc?: string;
  title?: string;
  ctaText?: string;
  imageSrc?: string;
}

export default function Hero({ type, images, videoSrc, title, ctaText, imageSrc }: HeroProps) {
  if (type === 'carousel') {
    return <HeroCarousel images={images ?? { mobile: [], tablet: [], desktop: [] }} />
  }

  if (type === 'video') {
    return <HeroVideo videoSrc={videoSrc ?? ''} />
  }

  if (type === 'textImage') {
    return <HeroTextImage 
      title={title ?? 'Default Title'} 
      ctaText={ctaText ?? 'Default CTA'} 
      imageSrc={imageSrc ?? '/default-image.jpg'} 
    />
  }

  return null
}