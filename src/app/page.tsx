'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import TextWithIcons from './components/TextWithIcons'
import WhatsappBubble from '../../components/WhatsappBubble'
import SplashScreen from '../../components/SplashScreen'

const slides = ['/images/home2.jpg', '/images/home4.jpg']

function Slideshow({ slides, interval = 5000 }: { slides: string[]; interval?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, interval)
    return () => clearInterval(timer)
  }, [interval, slides.length])

  return (
    <section className="w-full h-screen relative overflow-hidden">
      <Image
        src={slides[current]}
        alt={`Slide ${current + 1}`}
        fill
        className="object-cover transition-all duration-500"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <h5 className="text-white text-4xl font-bold drop-shadow-lg"></h5>
      </div>
    </section>
  )
}

type Producto = {
  id: number
  nombre: string
  precio: number
  descripcion: string
  imagen: string[]
}

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [showSplash, setShowSplash] = useState(true)
  const [fadeSplash, setFadeSplash] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFadeSplash(true), 1000)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    async function fetchProductos() {
      try {
        const res = await fetch('https://sg-studio-backend.onrender.com/productos')
        if (!res.ok) throw new Error('Error al obtener productos')
        const data = await res.json()
        setProductos(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProductos()
  }, [])

  useEffect(() => {
    if (!loading && fadeSplash) {
      const t2 = setTimeout(() => setShowSplash(false), 500)
      return () => clearTimeout(t2)
    }
  }, [loading, fadeSplash])

  const items = productos.filter(p => Array.isArray(p.imagen) && p.imagen.length > 0)
  const perPage = 4
  const pageCount = Math.ceil(items.length / perPage)
  const start = page * perPage
  const currentItems = items.slice(start, start + perPage)
  const prevPage = () => setPage(p => (p - 1 + pageCount) % pageCount)
  const nextPage = () => setPage(p => (p + 1) % pageCount)

  return (
    <div className="relative">
      <main className={`transition-filter duration-700 ${showSplash ? 'filter blur-sm pointer-events-none' : ''}`}>
        <Slideshow slides={slides} />

        {error && <p className="p-12 text-center text-red-600">{error}</p>}
        {!error && loading && <p className="p-12 text-center text-lg">Cargando productos...</p>}

        {!loading && !error && (
          <>
            <section className="py-8 bg-white">
              <div className="flex justify-between items-center px-4 mb-4">
                <h2 className="text-lg font-bold text-gray-800">Novedades</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={prevPage}
                    className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition text-2xl leading-none"
                    aria-label="Página anterior"
                  >
                    ❮
                  </button>
                  <button
                    onClick={nextPage}
                    className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition text-2xl leading-none"
                    aria-label="Página siguiente"
                  >
                    ❯
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {currentItems.map(({ id, imagen, nombre, precio, descripcion }) => (
                  <Link key={id} href={`/producto/${id}`} className="group">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition duration-300">
                      <div className="relative w-full h-72">
                        <img
                          src={imagen[0]}
                          alt={nombre}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                            imagen[1] ? 'group-hover:opacity-0' : ''
                          }`}
                        />
                        {imagen[1] && (
                          <img
                            src={imagen[1]}
                            alt={`${nombre} alternativa`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                        )}
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-gray-700 text-sm font-semibold truncate">{nombre}</p>
                        <p className="text-black text-base font-bold mt-1">${precio}</p>
                        <p className="text-gray-500 text-xs mt-2 truncate">{descripcion}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <TextWithIcons />

            <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
              <Link href="/components/nosotros" className="block w-full h-full">
                <picture>
                  <source
                    media="(max-width: 699px)"
                    srcSet="//www.luvaro.com/cdn/shop/files/bannercel_tiendal_1.jpg?v=1748283912&width=800"
                  />
                  <img
                    src="//www.luvaro.com/cdn/shop/files/BANNER_tienda1.jpg?v=1748282952&width=1800"
                    alt="Visítanos en nuestras tiendas"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </picture>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-center">
                  <h2 className="text-2xl md:text-4xl font-bold drop-shadow-lg">
                    Visítanos en nuestras tiendas
                  </h2>
                </div>
              </Link>
            </section>

            <WhatsappBubble />
          </>
        )}
      </main>

      {/* SplashScreen: fixed full-screen y con z-50 para cubrir todo */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 bg-white flex items-center justify-center transition-opacity duration-1500 ${
            fadeSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <SplashScreen fadeOut={fadeSplash} />
        </div>
      )}
    </div>
  )
}
