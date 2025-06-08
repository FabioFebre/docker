'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function WomanPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [precioMax, setPrecioMax] = useState(100)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProductos = await fetch('https://sg-studio-backend.onrender.com/productos')
        const dataProductos = await resProductos.json()
        setProductos(dataProductos)

        const resCategorias = await fetch('https://sg-studio-backend.onrender.com/categorias')
        const dataCategorias = await resCategorias.json()
        setCategorias(dataCategorias)
      } catch (err) {
        console.error('Error cargando datos', err)
      }
    }
    fetchData()
  }, [])

  const productosFiltrados = productos.filter((p: any) =>
    (!categoriaSeleccionada || p.categoria?.nombre?.toLowerCase() === categoriaSeleccionada.toLowerCase()) &&
    p.precio <= precioMax &&
    Array.isArray(p.imagen) && p.imagen.length > 0
  )

  return (
    <main className="bg-white min-h-screen p-4 pt-24 flex">
      {/* Filtros a la izquierda */}
      <aside className="w-64 pr-6 border-r border-gray-300">
        <h2 className="text-lg font-bold mb-4 text-black">Categorías</h2>
        <ul className="space-y-2 mb-6">
          <li>
            <button
              onClick={() => setCategoriaSeleccionada('')}
              className={`text-left w-full ${!categoriaSeleccionada ? 'font-bold text-black' : 'text-gray-600'}`}
            >
              Todas
            </button>
          </li>
          {categorias.map((cat: any) => (
            <li key={cat.id}>
              <button
                onClick={() => setCategoriaSeleccionada(cat.nombre)}
                className={`text-left w-full ${categoriaSeleccionada === cat.nombre ? 'font-bold text-black' : 'text-gray-600'}`}
              >
                {cat.nombre}
              </button>
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-bold mb-2 text-black">Precio Máximo: ${precioMax}</h2>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={precioMax}
          onChange={(e) => setPrecioMax(Number(e.target.value))}
          className="w-full"
        />
      </aside>

      {/* Productos a la derecha */}
      <section className="flex-1 pl-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Prendas</h2>
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
                      className={`object-cover transition-opacity duration-300 ${producto.imagen[1] ? 'group-hover:opacity-0' : ''}`}
                    />
                    {producto.imagen[1] && (
                      <Image
                        src={producto.imagen[1]}
                        alt={`${producto.nombre} alternativa`}
                        fill
                        className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-sm font-medium text-gray-700 truncate">{producto.nombre}</p>
                    <p className="text-lg font-bold text-black">${producto.precio}</p>
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
