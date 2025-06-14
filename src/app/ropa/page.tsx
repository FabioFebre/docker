'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string[];
  precio: number | null;
  categoria?: {
    nombre: string;
  };
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria');

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const url = categoria
          ? `${process.env.NEXT_PUBLIC_API_URL}/productos?categoria=${encodeURIComponent(categoria)}`
          : `${process.env.NEXT_PUBLIC_API_URL}/productos`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al obtener productos');
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [categoria]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Cargando productos...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {categoria ? `Productos en ${categoria}` : 'Todos los productos'}
      </h1>

      {productos.length === 0 ? (
        <p className="text-gray-500">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <Link
              href={`/producto/${producto.id}`}
              key={producto.id}
              className="border p-4 rounded hover:shadow-lg transition block"
            >
              <Image
                src={producto.imagen?.[0] || '/placeholder.jpg'}
                alt={`Imagen de ${producto.nombre}`}
                width={400}
                height={300}
                className="w-full h-48 object-cover rounded"
              />
              <h2 className="font-bold mt-2">{producto.nombre}</h2>
              <p className="text-sm text-gray-600">{producto.descripcion}</p>
              <p className="text-pink-600 font-semibold mt-2">
                {producto.precio !== null ? `PEN ${producto.precio}` : 'Sin precio'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Categoría: {producto.categoria?.nombre || 'Sin categoría'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
