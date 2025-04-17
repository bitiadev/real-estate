import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
/* import { ThemeProvider } from "@/components/theme-provider" */
import { AuthProvider } from "@/contexts/auth-context"
import AuthGuard from "@/components/auth-guard"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import StickyWhatsAppButton from "@/components/sticky-whatsapp-button"

const inter = Inter({ subsets: ["latin"], preload: false })

export const metadata = {
  title: "Inmobiliaria - Propiedades en venta y alquiler",
  description: "Encuentra las mejores propiedades en venta y alquiler",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light">
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange> */}
          <AuthProvider>
            <AuthGuard>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <StickyWhatsAppButton />
              </div>
            </AuthGuard>
          </AuthProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}