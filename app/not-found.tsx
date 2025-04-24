// app/not-found.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen flex-col text-center">
      <h1 className="text-5xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
      <button
        onClick={() => router.back()}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Volver atras
      </button>
    </div>
  );
}
