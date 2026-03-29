import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * MASTER RESCUE SCRIPT
 * 
 * Este script realiza un respaldo completo y organizado de la base de datos 
 * y las imágenes de Supabase, resolviendo el problema de cuota de almacenamiento.
 * 
 * 1. Exporta las tablas properties, property_images y leads a JSON.
 * 2. Organiza las fotos en carpetas por Propiedad (Título + Ubicación).
 * 3. Identifica y descarga archivos "HUERFANOS" en una carpeta separada.
 */

// --- CONFIGURACIÓN Y CARGA DE VARIABLES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const envPath = path.join(rootDir, '.env.local');

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: No se encontró el archivo .env.local');
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env: Record<string, string> = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Faltan claves de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const BUCKET_NAME = 'property-images';
const BACKUP_DIR = path.join(rootDir, 'backup_master_' + new Date().toISOString().split('T')[0]);

// --- UTILIDADES ---

function sanitizePath(text: string) {
  return text.replace(/[<>:"/\\|?*]/g, '-').trim();
}

async function fetchAll(table: string) {
  console.log(`📦 Obteniendo datos de la tabla: ${table}...`);
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return data;
}

async function listAllFiles(bucket: string, folder = '') {
  let allFiles: any[] = [];
  let { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  });

  if (error) throw error;
  if (!data) return [];

  for (const item of data) {
    const itemPath = folder ? `${folder}/${item.name}` : item.name;
    if (item.id === null) { // Es una carpeta
      const subFiles = await listAllFiles(bucket, itemPath);
      allFiles = allFiles.concat(subFiles);
    } else {
      allFiles.push({ ...item, path: itemPath });
    }
  }
  return allFiles;
}

async function downloadFile(bucket: string, storagePath: string, localPath: string) {
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error) {
    console.error(`❌ Error descargando ${storagePath}:`, error.message);
    return false;
  }

  const arrayBuffer = await data.arrayBuffer();
  fs.writeFileSync(localPath, Buffer.from(arrayBuffer));
  return true;
}

// --- PROCESO PRINCIPAL ---

async function runRescue() {
  try {
    console.log('🚀 Iniciando Master Rescue...');
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    // 1. EXPORTACIÓN DE BASE DE DATOS
    console.log('\n--- Paso 1: Exportando Base de Datos ---');
    const properties = await fetchAll('properties');
    const images = await fetchAll('property_images');
    const leads = await fetchAll('leads');

    const dbDump = { properties, images, leads, exported_at: new Date().toISOString() };
    fs.writeFileSync(path.join(BACKUP_DIR, 'database_dump.json'), JSON.stringify(dbDump, null, 2));
    console.log('✅ Base de datos exportada a database_dump.json');

    // 2. INDEXACIÓN DE STORAGE
    console.log('\n--- Paso 2: Indexando Storage ---');
    const storageFiles = await listAllFiles(BUCKET_NAME);
    console.log(`✅ Se encontraron ${storageFiles.length} archivos en el storage.`);

    const downloadedPaths = new Set<string>();

    // 3. DESCARGA ORGANIZADA POR PROPIEDAD
    console.log('\n--- Paso 3: Descargando Imágenes Organizadas ---');
    for (const prop of properties) {
      const propFolderName = sanitizePath(`${prop.id} - ${prop.title} - ${prop.location}`);
      const propPath = path.join(BACKUP_DIR, 'PROPIEDADES', propFolderName);
      
      console.log(`📂 Procesando: ${prop.title}`);
      
      // Guardar metadata de la propiedad
      if (!fs.existsSync(propPath)) fs.mkdirSync(propPath, { recursive: true });
      fs.writeFileSync(path.join(propPath, 'propiedad.json'), JSON.stringify(prop, null, 2));

      // Filtrar imágenes de esta propiedad
      const propImages = images.filter((img: any) => img.property_id === prop.id);
      
      for (const img of propImages) {
        const fileName = path.basename(img.storage_path);
        const localFilePath = path.join(propPath, fileName);
        
        const success = await downloadFile(BUCKET_NAME, img.storage_path, localFilePath);
        if (success) {
          downloadedPaths.add(img.storage_path);
        }
      }
    }

    // 4. DESCARGA DE HUÉRFANOS
    console.log('\n--- Paso 4: Buscando Archivos Huérfanos ---');
    let orphanCount = 0;
    for (const file of storageFiles) {
      if (!downloadedPaths.has(file.path)) {
        const localFilePath = path.join(BACKUP_DIR, 'HUERFANOS', file.path);
        const success = await downloadFile(BUCKET_NAME, file.path, localFilePath);
        if (success) orphanCount++;
      }
    }
    console.log(`✅ Proceso finalizado. Se descargaron ${orphanCount} archivos huérfanos.`);

    console.log(`\n✨ RESUMEN FINAL:`);
    console.log(`- Carpeta de backup: ${BACKUP_DIR}`);
    console.log(`- Propiedades procesadas: ${properties.length}`);
    console.log(`- Archivos totales en storage: ${storageFiles.length}`);
    console.log(`- Archivos huérfanos recuperados: ${orphanCount}`);

  } catch (err) {
    console.error('\n💥 ERROR FATAL DURANTE EL RESCATE:', err);
  }
}

runRescue();
