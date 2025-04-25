import { supabase } from "./supabaseClient"

export type Lead = {
  id: number
  name: string
  phone: string
  property_type: string
  budget: number
  request_date: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
}

/**
 * Obtiene todos los leads
 */
export async function getAllLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error al obtener los leads:", error)
    return []
  }
}

/**
 * Obtiene un lead por su ID
 */
export async function getLeadById(id: number): Promise<Lead | null> {
  try {
    const { data, error } = await supabase.from("leads").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error al obtener el lead con ID ${id}:`, error)
    return null
  }
}

/**
 * Crea un nuevo lead
 */
export async function createLead(leadData: Omit<Lead, "id" | "created_at" | "updated_at">): Promise<number | null> {
  try {
    const { data, error } = await supabase.from("leads").insert(leadData).select("id").single()

    if (error) {
      throw error
    }

    return data.id
  } catch (error) {
    console.error("Error al crear el lead:", error)
    return null
  }
}

/**
 * Actualiza un lead existente
 */
export async function updateLead(id: number, leadData: Partial<Lead>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("leads")
      .update({
        ...leadData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error al actualizar el lead con ID ${id}:`, error)
    return false
  }
}

/**
 * Elimina un lead
 */
export async function deleteLead(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("leads").delete().eq("id", id)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error al eliminar el lead con ID ${id}:`, error)
    return false
  }
}
