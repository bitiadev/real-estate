-- Crear el bucket para las imágenes de propiedades si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de seguridad para el bucket
-- Permitir a cualquier usuario ver las imágenes (lectura pública)
CREATE POLICY "Imágenes visibles públicamente" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

-- Permitir a usuarios autenticados subir imágenes
CREATE POLICY "Los usuarios autenticados pueden subir imágenes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

-- Permitir a usuarios autenticados actualizar sus propias imágenes
CREATE POLICY "Los usuarios autenticados pueden actualizar sus imágenes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

-- Permitir a usuarios autenticados eliminar sus propias imágenes
CREATE POLICY "Los usuarios autenticados pueden eliminar sus imágenes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );
