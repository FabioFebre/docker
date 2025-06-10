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
      router.push('/login'); // Redirige si no está autenticado
    }
  }, [router]);

  useEffect(() => {
    async function fetchCarrito() {
      if (!usuario?.id) return;
      try {
        const res = await fetch(`https://sg-studio-backend.onrender.com/carrito/${usuario.id}`);
        const data = await res.json();
        setCarrito(data.items); // ✅ Extrae solo los items del carrito
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
    return <p className="text-center mt-10">Cargando datos del usuario...</p>;
  }

  return (
    <section className="min-h-screen pt-24 px-6 bg-white text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Encabezado y botón de logout */}
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-bold">Cuenta</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500"
          >
            <svg
              aria-hidden="true"
              width="10"
              height="10"
              fill="none"
              viewBox="0 0 10 10"
              className="transform rotate-180"
            >
              <path
                d="M7 1L3 5l4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Cerrar sesión
          </button>
        </div>

        {/* Introducción */}
        <div className="prose max-w-none text-gray-700">
          <p>Aquí puedes ver todos tus pedidos y gestionar la información de tu cuenta.</p>
        </div>

        {/* Sección de carrito */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">Productos en tu carrito</h2>
          {loadingCarrito ? (
            <p className="text-gray-500">Cargando productos del carrito...</p>
          ) : carrito.length === 0 ? (
            <>
              <p className="text-gray-600">Aún no has agregado productos al carrito.</p>
              <a
                href="/"
                className="inline-block mt-2 px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
              >
                Seguir comprando
              </a>
            </>
          ) : (
            <div className="grid gap-4">
              {carrito.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border p-4 rounded hover:shadow-md"
                >
                  <img
                    src={item.producto.imagen[0]}
                    alt={item.producto.nombre}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{item.producto.nombre}</h3>
                    <p className="text-sm text-gray-600">PEN {item.producto.precio}</p>
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
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Información de la cuenta</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><strong>Nombre:</strong> {usuario.nombre}</li>
            <li><strong>Email:</strong> {usuario.email}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
