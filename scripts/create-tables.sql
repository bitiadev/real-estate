-- Tabla de propiedades
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('venta', 'alquiler')),
  location TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area NUMERIC NOT NULL,
  features JSONB,
  status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'vendida', 'alquilada')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de imágenes de propiedades
CREATE TABLE IF NOT EXISTS property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  main_image BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Políticas de seguridad (RLS)
-- Permitir lectura pública de propiedades activas
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Propiedades visibles públicamente" ON properties
  FOR SELECT USING (status = 'activa' OR auth.role() = 'authenticated');

-- Permitir a usuarios autenticados crear, actualizar y eliminar propiedades
CREATE POLICY "Los usuarios autenticados pueden gestionar propiedades" ON properties
  FOR ALL USING (auth.role() = 'authenticated');

-- Configurar imágenes
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Imágenes visibles públicamente" ON property_images
  FOR SELECT USING (true);
CREATE POLICY "Los usuarios autenticados pueden gestionar imágenes" ON property_images
  FOR ALL USING (auth.role() = 'authenticated');


-- Tabla de leads (clientes potenciales)
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_type TEXT NOT NULL, --CHECK (property_type IN ('venta', 'alquiler')),
  budget NUMERIC NOT NULL,
  request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'resuelto', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Políticas de seguridad (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Permitir a usuarios autenticados gestionar leads
CREATE POLICY "Los usuarios autenticados pueden gestionar leads" ON leads
  FOR ALL USING (auth.role() = 'authenticated');
