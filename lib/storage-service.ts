
import { supabase } from "./supabaseClient"
import { v4 as uuidv4 } from "uuid"

// Nombre del bucket donde se almacenarán las imágenes
const BUCKET_NAME = "property-images"

export type UploadedImage = {
  path: string
  url: string
}

/**
 * Sube una imagen al almacenamiento de Supabase
 */
export async function uploadPropertyImage(file: File, propertyId: number): Promise<UploadedImage | null> {
  try {
    // Generar un nombre único para el archivo
    const fileExt = file.name.split(".").pop()
    const fileName = `${propertyId}/${uuidv4()}.${fileExt}`
    const filePath = `${fileName}`

    // Subir el archivo a Supabase Storage
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw error
    }

    // Obtener la URL pública del archivo
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error al subir la imagen:", error)
    return null
  }
}

/**
 * Elimina una imagen del almacenamiento de Supabase
 */
export async function deletePropertyImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error al eliminar la imagen:", error)
    return false
  }
}

/**
 * Obtiene la URL pública de una imagen
 */
export function getImageUrl(filePath: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Guarda la referencia de la imagen en la base de datos
 */
export async function savePropertyImageReference(
  propertyId: number,
  storagePath: string,
  isMainImage = false,
): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from("property_images")
      .insert({
        property_id: propertyId,
        storage_path: storagePath,
        main_image: isMainImage,
      })
      .select("id")
      .single()

    if (error) {
      throw error
    }

    return data.id
  } catch (error) {
    console.error("Error al guardar la referencia de la imagen:", error)
    return null
  }
}

/**
 * Establece una imagen como la imagen principal de una propiedad
 */
export async function setMainImage(imageId: number, propertyId: number): Promise<boolean> {
  try {
    // Primero, establecer todas las imágenes de la propiedad como no principales
    await supabase.from("property_images").update({ main_image: false }).eq("property_id", propertyId)

    // Luego, establecer la imagen seleccionada como principal
    const { error } = await supabase.from("property_images").update({ main_image: true }).eq("id", imageId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error al establecer la imagen principal:", error)
    return false
  }
}

/**
 * Obtiene todas las imágenes de una propiedad
 */
export async function getPropertyImages(propertyId: number) {
  try {
    const { data, error } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .order("main_image", { ascending: false })
      .order("id", { ascending: true })

    if (error) {
      throw error
    }

    return data.map((image) => ({
      ...image,
      url: getImageUrl(image.storage_path),
    }))
  } catch (error) {
    console.error("Error al obtener las imágenes de la propiedad:", error)
    return []
  }
}

/**
 * Elimina una imagen de la base de datos y del almacenamiento
 */
export async function deletePropertyImageComplete(imageId: number): Promise<boolean> {
  try {
    // Primero obtener la ruta de almacenamiento
    const { data, error: fetchError } = await supabase
      .from("property_images")
      .select("storage_path")
      .eq("id", imageId)
      .single()

    if (fetchError || !data) {
      throw fetchError || new Error("No se encontró la imagen")
    }

    // Eliminar la imagen del almacenamiento
    await deletePropertyImage(data.storage_path)

    // Eliminar la referencia de la base de datos
    const { error: deleteError } = await supabase.from("property_images").delete().eq("id", imageId)

    if (deleteError) {
      throw deleteError
    }

    return true
  } catch (error) {
    console.error("Error al eliminar la imagen:", error)
    return false
  }
}
