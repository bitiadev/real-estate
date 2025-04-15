import { supabase } from "./supabase"

export type User = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  role: string
}

/**
 * Obtiene todos los usuarios administradores
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    // Obtener usuarios desde Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      throw authError
    }

    // Transformar los datos para nuestro formato
    const users: User[] = authUsers.users.map((user) => ({
      id: user.id,
      email: user.email || "",
      created_at: user.created_at || "",
      last_sign_in_at: user.last_sign_in_at || null,
      role: "admin", // Por defecto todos son admin en este sistema
    }))

    return users
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return []
  }
}

/**
 * Elimina un usuario por su ID
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error al eliminar el usuario con ID ${userId}:`, error)
    return false
  }
}

/**
 * Actualiza los datos de un usuario
 */
export async function updateUser(userId: string, userData: { email?: string; password?: string }): Promise<boolean> {
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, userData)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error al actualizar el usuario con ID ${userId}:`, error)
    return false
  }
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(email: string, password: string): Promise<{ id: string } | null> {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      throw error
    }

    return { id: data.user.id }
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return null
  }
}
