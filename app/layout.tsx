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
        <link rel="icon" href="/smallLogo3.png" type="image/png"/>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Yitani Propiedades" />
        <link rel="manifest" href="/site.webmanifest" />
       {/*  <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCicHfcmOSeaWlTIEIbV3gR2XkCeYn76bo&libraries=places`}
          strategy="beforeInteractive"
        /> */}
        <script async
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCicHfcmOSeaWlTIEIbV3gR2XkCeYn76bo&loading=async&libraries=places">
        </script>        
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Encuentra las mejores propiedades en venta y alquiler en Tres Arroyos, Buenos Aires y zona" />
        <meta name="keywords" content="inmobiliaria, propiedades, venta, alquiler, Tres Arroyos, Buenos Aires, casa" />
        <meta name="google-site-verification" content="YJJsRFa8lUxdpa5_uQt1jcZsU8y6wAoEqxZ-ZBVo71w" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        <meta name="author" content="Glider" />
        <meta name="copyright" content="© 2025 Glider" />
      </head>
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange> */}
        
        {/* Banner de lanzamiento */}
         {/*  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 text-gray-900 text-center">
            <img src="/smallLogo3.png" alt="Yitani Inmobiliaria" className="w-24 h-24 mb-6" />
            <h1 className="text-3xl font-bold mb-4">¡Próximamente!</h1>
            <p className="text-lg max-w-md">
              Muy pronto podrás buscar las mejores propiedades en <span className="font-semibold">Yitani Inmobiliaria</span>.<br />
              Estamos por lanzar oficialmente nuestra web.
            </p>
          </div>   */}
        {/* Fin del banner de lanzamiento */}

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