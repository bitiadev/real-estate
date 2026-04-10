# Real Estate Platform - Modern Inmobiliaria

Una plataforma inmobiliaria moderna construida con **Next.js**, **Supabase** y **Tailwind CSS**. Este proyecto ofrece una experiencia premium tanto para usuarios finales que buscan propiedades como para administradores que gestionan el inventario y los leads (clientes potenciales).

## 🚀 Características Principales

### Para Usuarios (Público)
- **Búsqueda Avanzada**: Filtros por tipo (venta/alquiler), ubicación, precio, habitaciones y más.
- **Detalle de Propiedad**: Galería de imágenes, descripción detallada, características y ubicación en mapa.
- **Interacción Directa**: Botón de contacto rápido vía WhatsApp y formulario de consulta.
- **Mapas Interactivos**: Visualización de la ubicación de las propiedades mediante Google Maps.

### Para Administradores (Panel de Control)
- **Dashboard en Tiempo Real**: Métricas clave sobre el estado de las propiedades y nuevos leads.
- **Gestión de Propiedades**: CRUD completo de propiedades con carga de múltiples imágenes en Supabase Storage.
- **CRM de Leads**: Gestión de consultas, seguimiento de estados (pendiente, en proceso, resuelto) y registro de notas.
- **Administración de Usuarios**: Control de acceso para el personal administrativo.

## 🛠️ Stack Tecnológico

- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), [React 18](https://reactjs.org/).
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (iconos).
- **Componentes UI**: [Radix UI](https://www.radix-ui.com/) / [Shadcn UI](https://ui.shadcn.com/).
- **Backend/Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage).
- **Formularios**: [React Hook Form](https://react-hook-form.com/) con validación [Zod](https://zod.dev/).
- **Mapas**: Google Maps JavaScript API.
- **Gráficos**: [Recharts](https://recharts.org/).

## 📁 Estructura del Proyecto

```text
├── app/                # Rutas de la aplicación (Admin y Público)
│   ├── admin/          # Panel de administración (Dashboard, Leads, Propiedades)
│   ├── propiedades/    # Listado y detalle de propiedades (Público)
│   └── layout.tsx      # Layout principal
├── components/         # Componentes React reutilizables
│   ├── ui/             # Componentes base (Botones, Inputs, etc.)
│   ├── admin-*.tsx     # Componentes específicos para el administrador
│   └── property-*.tsx  # Componentes relacionados con las propiedades
├── lib/                # Utilidades, configuración de Supabase y funciones auxiliares
├── hooks/              # Custom hooks de React
├── contexts/           # Contextos para el estado global (Auth, etc.)
├── scripts/            # Scripts SQL para inicializar la base de datos
├── public/             # Assets estáticos (imágenes, iconos)
└── styles/             # Configuración global de estilos
```

## ⚙️ Configuración y Base de Datos

El proyecto utiliza **Supabase** para la persistencia de datos y gestión de archivos.

### Requisitos Previos
1. Tener una cuenta en [Supabase](https://supabase.com/).
2. Crear un nuevo proyecto.
3. Copiar las credenciales (`URL` y `ANON_KEY`) al archivo `.env.local`.

### Inicialización de la Base de Datos
En la carpeta `scripts/` se encuentran los archivos SQL necesarios para configurar tu instancia de Supabase:

1. **Tablas y Políticas (RLS)**: Ejecuta el contenido de `scripts/create-tables.sql` en el Editor SQL de Supabase. Esto creará las tablas de `properties`, `property_images` y `leads`, además de configurar las políticas de seguridad.
2. **Almacenamiento (Storage)**: Ejecuta `scripts/setup-storage.sql` para crear el bucket `property-images` y configurar los permisos de lectura/escritura.

### Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps
```

## 🛠️ Guía de Desarrollo

Para comenzar a trabajar en el proyecto localmente:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

---
> [!IMPORTANT]
> Asegúrate de configurar correctamente las políticas de RLS en Supabase para que las imágenes y las propiedades sean visibles públicamente según el estado 'activa'.

## 📜 Historial de Cambios
Para ver los últimos cambios y mejoras realizadas en el proyecto, consulta el archivo [CHANGELOG.md].
