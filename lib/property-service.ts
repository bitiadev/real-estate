import { supabase } from "./supabase"
import { getPropertyImages } from "./storage-service"

export type Property = {
  id: number
  title: string
  description: string
  price: number
  type: string
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  features: Record<string, boolean>
  status: string
  created_at: string
  updated_at: string
  images?: Array<{
    id: number
    url: string
    main_image: boolean
  }>
}

/**
 * Obtiene todas las propiedades
 */
export async function getAllProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Obtener las imágenes para cada propiedad
    const propertiesWithImages = await Promise.all(
      data.map(async (property) => {
        const images = await getPropertyImages(property.id)
        return {
          ...property,
          images: images.map((img) => ({
            id: img.id,
            url: img.url,
            main_image: img.main_image,
          })),
        }
      }),
    )

    return propertiesWithImages
  } catch (error) {
    console.error("Error al obtener las propiedades:", error)
    return []
  }
}

/**
 * Obtiene una propiedad por su ID
 */
export async function getPropertyById(id: number): Promise<Property | null> {
  try {
    const { data, error } = await supabase.from("properties").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    // Obtener las imágenes de la propiedad
    const images = await getPropertyImages(data.id)

    return {
      ...data,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        main_image: img.main_image,
      })),
    }
  } catch (error) {
    console.error(`Error al obtener la propiedad con ID ${id}:`, error)
    return null
  }
}

/**
 * Actualiza el estado de una propiedad
 */
export async function updatePropertyStatus(id: number, status: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("properties").update({ status }).eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error al actualizar el estado de la propiedad con ID ${id}:`, error)
    return false
  }
}

/**
 * Elimina una propiedad
 */
export async function deleteProperty(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("properties").delete().eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error al eliminar la propiedad con ID ${id}:`, error)
    return false
  }
}
