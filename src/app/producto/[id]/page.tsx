'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProductoDetalle() {
  const params = useParams();
  const router = useRouter();

  const initialId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';
  const [producto, setProducto] = useState<any>(null);
  const [idActual, setIdActual] = useState(initialId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [recomendados, setRecomendados] = useState<any[]>([]);
  const [loadingRec, setLoadingRec] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPosition({ x, y });
  };

  const fetchProducto = async (id: string | number) => {
    try {
      setLoading(true);
      const res = await fetch(`https://sg-studio-backend.onrender.com/productos/${id}`);
      if (!res.ok) throw new Error('Error al obtener el producto');

      const data = await res.json();

      const ajustarURL = (url: string) => {
        if (!url.startsWith('http')) {
          return `https://sg-studio-backend.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;
        }
        return url;
      };

      const imagenesAjustadas = Array.isArray(data.imagen)
        ? data.imagen.map(ajustarURL)
        : [];

      setProducto({ ...data, imagen: imagenesAjustadas });
      setImagenSeleccionada(imagenesAjustadas?.[0] || null);
      setCantidad(1);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idActual) fetchProducto(idActual);
  }, [idActual]);

  useEffect(() => {
    async function fetchRecomendados() {
      try {
        const res = await fetch('https://sg-studio-backend.onrender.com/productos');
        if (!res.ok) throw new Error('Error al obtener recomendados');
        const datos = await res.json();
        const otros = datos.filter((p: any) => String(p.id) !== String(idActual));
        const shuffled = otros.sort(() => 0.5 - Math.random());
        setRecomendados(shuffled.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRec(false);
      }
    }

    if (!loading) fetchRecomendados();
  }, [loading, idActual]);

  const handleAgregarAlCarrito = async () => {
    const usuarioStr = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null;
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const userId = usuario?.id;

    if (!userId) {
      alert('Debe iniciar sesión para agregar productos al carrito');
      router.push('/login');
      return;
    }

    if (cantidad < 1) {
      alert('La cantidad debe ser al menos 1');
      return;
    }

    try {
      const res = await fetch('https://sg-studio-backend.onrender.com/carrito/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: userId,
          productoId: producto.id,
          cantidad,
          talla: 'M',
          color: producto.color || 'negro',
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al agregar al carrito: ${errorText}`);
      }

      alert('Producto agregado al carrito');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al agregar al carrito');
    }
  };

  if (loading) return <p className="p-12 text-center">Cargando producto...</p>;
  if (error) return <p className="p-12 text-center text-red-600">{error}</p>;
  if (!producto) return <p className="p-12 text-center">Producto no encontrado</p>;

  const { nombre, descripcion, precio, imagen = [], color } = producto;

  return (
    <div className="bg-white min-h-screen px-6 md:px-12 pt-24 md:pt-32 pb-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[auto_500px_1fr] gap-6">
        <div className="flex flex-row md:flex-col gap-3 items-center md:items-start">
          {imagen.map((img: string, index: number) => (
            <button
              key={index}
              onClick={() => setImagenSeleccionada(img)}
              className={`border rounded overflow-hidden w-[60px] h-[80px] hover:opacity-80 transition ${imagenSeleccionada === img ? 'ring-2 ring-black' : ''}`}
            >
              <Image
                src={img}
                alt={`Vista ${index + 1}`}
                width={60}
                height={80}
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div
          className="relative w-full h-[800px] shadow-md rounded-lg overflow-hidden flex items-center justify-center bg-gray-100"
          style={{ cursor: isHovering ? 'zoom-in' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {producto.seleccionado && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-full shadow uppercase tracking-wider">
                New Arrivals
              </span>
            </div>
          )}

          {imagenSeleccionada && (
            <Image
              src={imagenSeleccionada}
              alt="Imagen seleccionada"
              fill
              unoptimized
              style={{
                objectFit: 'contain',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                transform: isHovering ? 'scale(2)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
              className="rounded-lg pointer-events-none select-none"
            />
          )}
        </div>

        <div className="space-y-4 text-gray-800">
          <h1 className="font-[Beige] text-6xl mb-1">{nombre}</h1>
          <p className="font-[Beige] text-2xl">PEN {precio}</p>
          <hr />
          <h5 className="font-[Montserrat] text-sm">{color}</h5>

          <div className="mb-4">
            <label className="block text-sm font-[Montserrat] mb-1">Cantidad:</label>
            {producto.cantidad === 0 ? (
              <p className="text-red-500 text-sm">Sin stock disponible</p>
            ) : (
              <>
                <div className="flex items-center border rounded w-fit overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="px-4 py-2 text-xl text-gray-600 hover:bg-gray-100"
                    disabled={cantidad <= 1}
                  >
                    –
                  </button>
                  <span className="px-6 py-2 text-center text-xl">{cantidad}</span>
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.min(producto.cantidad, cantidad + 1))}
                    className="px-4 py-2 text-xl text-gray-600 hover:bg-gray-100"
                    disabled={cantidad >= producto.cantidad}
                  >
                    +
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleAgregarAlCarrito}
            className="px-6 py-2 bg-black text-white rounded hover:opacity-80"
            disabled={producto.cantidad === 0}
          >
            Agregar al carrito
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16">
        <h5 className="text-2xl mb-4 text-black">Te puede interesar</h5>
        {loadingRec ? (
          <p>Cargando recomendaciones...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {recomendados.map((item: any) => (
              <div
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition p-4 border rounded relative"
                onClick={() => {
                  setIdActual(String(item.id));
                  router.push(`/producto/${item.id}`);
                }}
              >
                <div className="w-full h-48 relative">
                  {item.imagen?.[0] && (
                    <Image
                      src={item.imagen[0]}
                      alt={item.nombre}
                      fill
                      unoptimized
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                    />
                  )}

                  {item.seleccionado && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-full shadow uppercase tracking-wider">
                        New Arrivals
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="mt-2 text-black font-medium truncate">{item.nombre}</h3>
                <p className="font-['Montserrat'] text-sm text-black">PEN {item.precio}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
