'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function WomanContent() {
  const searchParams = useSearchParams()
  const categoriaSeleccionada = searchParams.get('categoria') || ''

  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [vista, setVista] = useState<'grande' | 'compacta' | 'lista'>('grande')
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(false)

  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]) // nuevo

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

  const productosFiltrados = productos.filter(
     (p: any) =>
    (categoriasSeleccionadas.length === 0 ||
      categoriasSeleccionadas.includes(p.categoria?.nombre)) &&
    Array.isArray(p.imagen) &&
    p.imagen.length > 0
  )

  const toggleCategoria = (nombre: string) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(nombre)
        ? prev.filter((cat) => cat !== nombre)
        : [...prev, nombre]
    )
  }

  const renderVista = () => {
    let columnas = ''
    if (vista === 'lista') {
      columnas = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
    } else if (vista === 'compacta') {
      columnas = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    } else {
      columnas = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }

    return (
      <div className={`grid ${columnas} gap-6`}>
        {productosFiltrados.map((producto: any) => (
          <Link key={producto.id} href={`/producto/${producto.id}`} className="group block">
            <div className="bg-white border rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <div className="relative w-full h-150">
                <Image
                  src={producto.imagen[0]}
                  alt={producto.nombre}
                  fill
                  unoptimized
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    producto.imagen[1] ? 'group-hover:opacity-0' : ''
                  }`}
                />
                {producto.imagen[1] && (
                  <Image
                    src={producto.imagen[1]}
                    alt={`${producto.nombre} alternativa`}
                    fill
                    unoptimized
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}
                {producto.seleccionado && (
                   <div className="absolute top-2 left-2 z-10">
                     <span className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                       New Arrivals
                     </span>
                   </div>
                 )}

                 <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:rotate-90 transform transition-transform duration-300 ease-in-out">
                     <span className="text-2xl font-bold text-gray-800">+</span>
                   </div>
                 </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:rotate-90 transform transition-transform duration-300 ease-in-out">
                    <span className="text-2xl font-bold text-gray-800">+</span>
                  </div>
                </div>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm font-medium text-gray-700 truncate">{producto.nombre}</p>
                <p className="text-lg font-normal text-black">S/ {producto.precio}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <main className="bg-white min-h-screen p-4 pt-24 flex">
      <aside className="w-64 pr-6 border-r border-gray-300">
        <h2 className="font-[Montserrat] text-2xl font-bold mb-4 text-black">Categorías</h2>
        <div className="border-t border-b py-2 cursor-pointer flex justify-between items-center" onClick={() => setCategoriasAbiertas(!categoriasAbiertas)}>
          <span className="font-semibold text-gray-700">Filtrar por categoría</span>
          <span className="text-lg font-bold">{categoriasAbiertas ? '−' : '+'}</span>
        </div>
        {categoriasAbiertas && (
          <ul className="space-y-2 mt-3">
            {categorias.map((cat: any) => {
              const cantidad = productos.filter((p: any) => p.categoria?.nombre === cat.nombre).length
              const isChecked = categoriasSeleccionadas.includes(cat.nombre)

              return (
                <li key={cat.id}>
                  <label className="flex justify-between items-center text-sm font-[Montserrat] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategoria(cat.nombre)}
                        className="accent-black w-4 h-4"
                      />
                      <span className={isChecked ? 'text-black font-bold' : 'text-gray-600'}>
                        {cat.nombre}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">({cantidad})</span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </aside>

      <section className="flex-1 pl-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-[Montserrat] text-2xl font-bold text-gray-800">Prendas</h2>
          <div className="flex items-center space-x-4">
            {/* Vista grande */}
            <button onClick={() => setVista('grande')} className="focus:outline-none" title="Vista grande">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: vista === 'grande' ? '#000' : '#9ca3af' }}>
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
            </button>

            {/* Vista compacta */}
            <button onClick={() => setVista('compacta')} className="focus:outline-none" title="Vista compacta">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: vista === 'compacta' ? '#000' : '#9ca3af' }}>
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
              </svg>
            </button>

            {/* Vista lista */}
            <button onClick={() => setVista('lista')} className="focus:outline-none" title="Vista lista">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: vista === 'lista' ? '#000' : '#9ca3af' }}>
                <path d="M3 4h18v2H3V4zm0 4h18v2H3V8zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {productosFiltrados.length === 0 ? (
          <p className="text-gray-500">No hay productos que coincidan con los filtros.</p>
        ) : (
          renderVista()
        )}
      </section>
    </main>
  )
}
