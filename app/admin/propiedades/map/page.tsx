"use client";

import { useEffect, useState } from "react";
import PropertyMap from "@/components/property-map";
import PropertyList from "@/components/property-list";
import { getAllProperties, Property } from "@/lib/property-service";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function PageMap() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProperties();
      setProperties(data);
    } catch (error) {
      console.error("Error al cargar propiedades:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron cargar las propiedades. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertySelect = (propertyId: number) => {
    setSelectedProperty(propertyId);
    console.log("Propiedad seleccionada:", propertyId);
  };

  const handleMarkerClick = (propertyId: number) => {
    setSelectedProperty(propertyId);
    console.log("Marcador seleccionado:", propertyId);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ) 

  return (
    <main className="flex flex-col h-screen">
      <header className="bg-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Mapa de Propiedades</h1>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-1/4 p-4 overflow-y-auto hidden md:block">
          <PropertyList
            properties={properties}
            selectedPropertyId={selectedProperty ?? 0}
            onPropertySelect={handlePropertySelect}
          />
        </div>

        <div className="w-full md:w-3/4 h-dvh md:h-auto">
          <PropertyMap
            properties={properties}
            selectedPropertyId={selectedProperty ?? 0}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>
    </main>
  );
}
