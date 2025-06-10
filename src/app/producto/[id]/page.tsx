'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProductoDetalle() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const router = useRouter();
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [recomendados, setRecomendados] = useState<any[]>([]);
  const [loadingRec, setLoadingRec] = useState(true);

  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPosition({ x, y });
  };

  useEffect(() => {
    async function fetchProducto() {
      try {
        const res = await fetch(`https://sg-studio-backend.onrender.com/productos/${id}`);
        if (!res.ok) throw new Error('Error al obtener el producto');
        const data = await res.json();
        setProducto(data);
        setImagenSeleccionada(data.imagen?.[0] || null);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProducto();
  }, [id]);

  useEffect(() => {
    async function fetchRecomendados() {
      try {
        const res = await fetch('https://sg-studio-backend.onrender.com/productos');
        if (!res.ok) throw new Error('Error al obtener recomendados');
        const datos = await res.json();
        const otros = datos.filter((p: any) => String(p.id) !== String(id));
        const shuffled = otros.sort(() => 0.5 - Math.random());
        setRecomendados(shuffled.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRec(false);
      }
    }
    if (!loading) fetchRecomendados();
  }, [loading, id]);

  const handleAgregarAlCarrito = async () => {
    const usuarioStr = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null;
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const userId = usuario?.id;

    if (!userId) {
      alert('Debe iniciar sesión para agregar productos al carrito');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('https://sg-studio-backend.onrender.com/carrito/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: userId,
          productoId: producto.id,
          cantidad: 1,
          talla: 'M',
          color: producto.color || 'negro',
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al agregar al carrito: ${errorText}`);
      }

      alert('Producto agregado al carrito');
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
        {/* Miniaturas */}
        <div className="flex flex-row md:flex-col gap-3 items-center md:items-start">
          {imagen.map((img: string, index: number) => (
            <button
              key={index}
              onClick={() => setImagenSeleccionada(img)}
              className={`border rounded overflow-hidden w-[60px] h-[80px] hover:opacity-80 transition ${
                imagenSeleccionada === img ? 'ring-2 ring-black' : ''
              }`}
            >
              <Image
                src={img}
                alt={`Vista ${index + 1}`}
                width={60}
                height={80}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Imagen principal con zoom */}
        <div
          className="relative w-full h-[800px] shadow-md rounded-lg overflow-hidden flex items-center justify-center bg-gray-100"
          style={{ cursor: isHovering ? 'zoom-in' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {imagenSeleccionada && (
            <Image
              src={imagenSeleccionada}
              alt="Imagen seleccionada"
              fill
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

        {/* Detalles */}
        <div className="space-y-4 text-gray-800">
          <h1 className="text-4xl mb-1">{nombre}</h1>
          <p className="text-2xl text-black-700">PEN {precio}</p>
          <hr />
          <h5 className="text-sm">{color}</h5>
          <button
            onClick={handleAgregarAlCarrito}
            className="btn-animated w-full text-sm"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Añadir al carrito
          </button>
          <p className="text-gray-600 text-sm truncate">{descripcion}</p>
        </div>
      </div>

      {/* Recomendados */}
      <div className="max-w-6xl mx-auto mt-16">
        <h5 className="text-2xl mb-4 text-black">Te puede interesar</h5>
        {loadingRec ? (
          <p>Cargando recomendaciones...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {recomendados.map((item: any) => (
              <div
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition p-4 border rounded"
                onClick={() => router.push(`/productos/${item.id}`)}
              >
                <div className="w-full h-48 relative">
                  {item.imagen?.[0] && (
                    <Image
                      src={item.imagen[0]}
                      alt={item.nombre}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded"
                    />
                  )}
                </div>
                <h3 className="mt-2 text-black font-medium truncate">{item.nombre}</h3>
                <p className="text-sm text-black">PEN {item.precio}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
