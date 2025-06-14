'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
};

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  imagen: string[];
};

type ItemCarrito = {
  id: number;
  cantidad: number;
  talla: string;
  color: string;
  producto: Producto;
};

export default function PerfilUsuario() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loadingCarrito, setLoadingCarrito] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (storedUser && isLoggedIn === 'true') {
      setUsuario(JSON.parse(storedUser));
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    async function fetchCarrito() {
      if (!usuario?.id) return;
      try {
        const res = await fetch(`https://sg-studio-backend.onrender.com/carrito/${usuario.id}`);
        const data = await res.json();
        setCarrito(data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCarrito(false);
      }
    }

    fetchCarrito();
  }, [usuario]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    router.push('/');
  };

  if (!usuario) {
    return <p className="text-center mt-10 text-gray-600">Cargando datos del usuario...</p>;
  }

  return (
    <section className="min-h-screen pt-24 px-4 md:px-8 bg-white text-black">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b border-gray-300 pb-6">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Mi cuenta</h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium border border-black px-4 py-1.5 rounded hover:bg-black hover:text-white transition"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Bienvenida */}
        <div>
          <p className="text-gray-700 text-lg">
            ¡Hola <span className="font-semibold">{usuario.nombre}</span>! Aquí puedes gestionar tu
            cuenta y ver tus productos en el carrito.
          </p>
        </div>

        {/* Carrito */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold uppercase">Carrito de compras</h2>
          {loadingCarrito ? (
            <p className="text-gray-500">Cargando productos...</p>
          ) : carrito.length === 0 ? (
            <>
              <p className="text-gray-600">Tu carrito está vacío.</p>
              <a
                href="/"
                className="inline-block mt-2 px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition text-sm"
              >
                Seguir comprando
              </a>
            </>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {carrito.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={item.producto.imagen[0]}
                    alt={item.producto.nombre}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-semibold">{item.producto.nombre}</h3>
                    <p className="text-sm text-gray-700">PEN {item.producto.precio}</p>
                    <p className="text-sm text-gray-500">
                      Talla: {item.talla} | Color: {item.color}
                    </p>
                    <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información del usuario */}
        <div className="border-t border-gray-300 pt-6">
          <h2 className="text-xl font-semibold uppercase mb-4">Información de la cuenta</h2>
          <div className="space-y-2 text-sm text-gray-800">
            <p><strong>Nombre:</strong> {usuario.nombre}</p>
            <p><strong>Email:</strong> {usuario.email}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
