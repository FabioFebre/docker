'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`);
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
  }, []);

  if (loading) return <div className="p-6">Cargando productos...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Todos los productos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
          <Link
            href={`/producto/${producto.id}`}
            key={producto.id}
            className="border p-4 rounded hover:shadow-lg transition block"
          >
            <Image
              src={producto.imagen[0]}
              alt={producto.nombre}
              width={400}
              height={300}
              className="w-full h-48 object-cover rounded"
            />
            <h2 className="font-bold mt-2">{producto.nombre}</h2>
            <p className="text-sm text-gray-600">{producto.descripcion}</p>
            <p className="text-pink-600 font-semibold mt-2">
              ${producto.precio !== null ? producto.precio : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Categoría: {producto.categoria?.nombre || 'Sin categoría'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
