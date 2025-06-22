'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function NewArrivalsPage() {
  const searchParams = useSearchParams()
  const categoriaSeleccionada = searchParams.get('categoria') || ''
  const [productos, setProductos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])

  useEffect(() => {
    const fetchSeleccionados = async () => {
      try {
        const res = await fetch('https://sg-studio-backend.onrender.com/productos/seleccionados')
        const data = await res.json()
        setProductos(data)

        const categoriasUnicas = Array.from(
          new Map(
            data
              .filter((p: any) => p.categoria)
              .map((p: any) => [p.categoria.id, p.categoria])
          ).values()
        )
        setCategorias(categoriasUnicas)
      } catch (err) {
        console.error('Error cargando productos seleccionados', err)
      }
    }

    fetchSeleccionados()
  }, [])

  const productosFiltrados = productos.filter((p: any) =>
    (!categoriaSeleccionada || p.categoria?.nombre?.toLowerCase() === categoriaSeleccionada.toLowerCase()) &&
    Array.isArray(p.imagen) && p.imagen.length > 0
  )

  return (
    <main className="bg-white min-h-screen p-4 pt-24 flex">
      <aside className="w-64 pr-6 border-r border-gray-300">
        <h2 className="font-[Beige] text-2xl font-bold mb-4 text-black">Categorías</h2>
        <ul className="space-y-2 mb-6">
          <li>
            <Link
              href={`/newarrivals`}
              className={`font-[Beige] block text-left w-full ${!categoriaSeleccionada ? 'font-bold text-black' : 'text-gray-600'}`}
            >
              Todas
            </Link>
          </li>
          {categorias.map((cat: any) => (
            <li key={cat.id}>
              <Link
                href={`/newarrivals?categoria=${encodeURIComponent(cat.nombre)}`}
                className={`font-[Montserrat] block text-sm text-left w-full ${categoriaSeleccionada === cat.nombre ? 'font-bold text-black' : 'text-gray-600'}`}
              >
                {cat.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1 pl-6">
        <h2 className="font-[Beige] text-2xl font-bold mb-4 text-gray-800">NEW ARRIVALS</h2>
        {productosFiltrados.length === 0 ? (
          <p className="text-gray-500">No hay productos que coincidan con los filtros.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((producto: any) => (
              <Link key={producto.id} href={`/producto/${producto.id}`} className="group block">
                <div className="bg-white border rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  <div className="relative w-full h-72">
                    <Image
                      src={producto.imagen[0]}
                      alt={producto.nombre}
                      fill
                      unoptimized
                      className={`object-cover transition-opacity duration-300 ${producto.imagen[1] ? 'group-hover:opacity-0' : ''}`}
                    />
                    {producto.imagen[1] && (
                      <Image
                        src={producto.imagen[1]}
                        alt={`${producto.nombre} alternativa`}
                        fill
                        unoptimized
                        className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    )}
                    {/* Etiqueta "New Arrivals" */}
                    {producto.seleccionado && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                          New Arrivals
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-sm font-medium text-gray-700 truncate">{producto.nombre}</p>
                    <p className="text-lg text-black">S/ {producto.precio}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
