"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Menu, Search, User } from "lucide-react"
import { useState } from "react"

interface AdminHeaderProps {
  searchTerm?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
}

export default function AdminHeader({ searchTerm = "", onSearchChange, showSearch = true }: AdminHeaderProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex items-center h-16 bg-white border-b border-gray-200 px-4 sm:px-6 lg:pl-64">
      <button
        type="button"
        className="lg:hidden mr-4 text-gray-500"
        title="Toggle sidebar"
        onClick={() => {
          // Buscar el elemento con el ID "mobile-sidebar-toggle" y hacer clic en él
          const toggleButton = document.getElementById("mobile-sidebar-toggle")
          if (toggleButton) {
            toggleButton.click()
          }
        }}
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex-1 flex justify-between">
        <div className="flex-1 flex">
          {onSearchChange && (
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Buscar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="search"
                  placeholder="Buscar..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          )}
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">{user?.email || "Admin"}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
