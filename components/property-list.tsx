"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import Image from "next/image";
import { Property } from "@/lib/property-service";
import Link from "next/link";

interface PropertyListProps {
  properties: Property[];
  selectedPropertyId: number;
  onPropertySelect: (propertyId: number) => void;
}

export default function PropertyList({
  properties,
  selectedPropertyId,
  onPropertySelect,
}: PropertyListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Propiedades Disponibles</h2>

      {properties.length === 0 ? (
        <p className="text-gray-500">No hay propiedades disponibles</p>
      ) : (
        properties.map((property) => (
          <Card
            key={property.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPropertyId === property.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onPropertySelect(property.id)}
          >
            <CardContent className="p-0">
              {/* <div className="relative h-40 w-full">
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div> */}

              <div className="p-4">
                <h3 className="font-bold text-lg">{property.title}</h3>

                <div className="flex items-center text-gray-500 mt-1 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <p className="text-sm truncate">{property.location}</p>
                </div>

                <div className="flex items-center text-gray-500 mb-2 justify-between">
                  <p className="text-xl font-bold text-primary mb-2">
                    ${property.price.toLocaleString()}
                  </p>
                  <Link
                    href={`/propiedades/${property.id}`}
                    className="text-sm text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver más
                  </Link>
                </div>

                {/*    <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center text-gray-600">
                    <Bed className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.bedrooms}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Bath className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.bathrooms}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Square className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.area} m²</span>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
