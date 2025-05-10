import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import StickyWhatsAppButton from "@/components/sticky-whatsapp-button";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <StickyWhatsAppButton />
      <Footer />
    </div>
  )
}