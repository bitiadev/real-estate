import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
/* import { ThemeProvider } from "@/components/theme-provider" */
import { AuthProvider } from "@/contexts/auth-context"
import AuthGuard from "@/components/auth-guard"
import Script from "next/script"


const inter = Inter({ subsets: ["latin"], preload: false })

export const metadata = {
  title: "Inmobiliaria - Propiedades en venta y alquiler",
  description: "Encuentra las mejores propiedades en venta y alquiler en Tres Arroyos, Buenos Aires y zona",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="light">
      <head>
        <link rel="icon" href="/smallLogo3.png" type="image/png" />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCicHfcmOSeaWlTIEIbV3gR2XkCeYn76bo&libraries=places`}
          strategy="beforeInteractive"
        />
        <script async
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCicHfcmOSeaWlTIEIbV3gR2XkCeYn76bo&loading=async&libraries=places&callback=initMap">
        </script>
      </head>
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange> */}
          <AuthProvider>
            <AuthGuard>
              <div className="flex flex-col min-h-screen">
                <main className="flex-1">{children}</main>
              </div>
            </AuthGuard>
          </AuthProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}