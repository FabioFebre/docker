'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CrearProductoForm from './components/CrearProductoForm';
import CrearCategoriaForm from './components/CrearCategoriaForm';
import EditarProductoForm from './components/EditarProductoForm';
import ListarProductosAdmin from './components/ListarProductosAdmin';
import {
  Package,
  Tags,
  LogOut,
  LayoutList,
  Layers3,
  PlusCircle,
} from 'lucide-react';

function ListaCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const res = await fetch('https://sg-studio-backend.onrender.com/categorias');
        if (!res.ok) throw new Error('Error al obtener categorías');
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategorias();
  }, []);

  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar esta categoría?')) return;
    setEliminando(id);

    try {
      const res = await fetch(
        `https://sg-studio-backend.onrender.com/categorias/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Error al eliminar categoría');
      setCategorias((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      alert(error.message);
    } finally {
      setEliminando(null);
    }
  };

  if (loading)
    return <p className="text-center text-lg text-gray-600">Cargando categorías...</p>;
  if (error)
    return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      {categorias.map(({ id, nombre, descripcion }) => (
        <div
          key={id}
          className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-800">{nombre}</h3>
            <p className="text-gray-500 text-sm">{descripcion}</p>
          </div>
          <button
            onClick={() => handleEliminar(id)}
            disabled={eliminando === id}
            className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
          >
            {eliminando === id ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [showProductos, setShowProductos] = useState(true);
  const [productoEditar, setProductoEditar] = useState(null);
  const [soloListaProductos, setSoloListaProductos] = useState(false);
  const [cantidadProductos, setCantidadProductos] = useState(0);
  const [cantidadCategorias, setCantidadCategorias] = useState(0);
  const [mostrarCrearProducto, setMostrarCrearProducto] = useState(false);

  useEffect(() => {
    fetch('https://sg-studio-backend.onrender.com/productos')
      .then((res) => res.json())
      .then((data) => setCantidadProductos(data.length))
      .catch((err) => console.error('Error al obtener productos:', err));

    fetch('https://sg-studio-backend.onrender.com/categorias')
      .then((res) => res.json())
      .then((data) => setCantidadCategorias(data.length))
      .catch((err) => console.error('Error al obtener categorías:', err));
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    if (!isLoggedIn || role !== 'admin') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const handleEditarProducto = (producto) => {
    setProductoEditar(producto);
    setShowProductos(true);
    setSoloListaProductos(false);
    setMostrarCrearProducto(false);
  };

  const handleFormularioGuardado = () => {
    setProductoEditar(null);
  };

  const handleMostrarCrearProducto = () => {
    setShowProductos(true);
    setSoloListaProductos(false);
    setProductoEditar(null);
    setMostrarCrearProducto(true);
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 font-sans">
      <aside className="w-72 p-6 flex flex-col justify-between bg-white border-r border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold mb-8 text-gray-900 text-center tracking-tight">
            Panel Admin
          </h1>
          <nav className="flex flex-col gap-3 text-base">
            <button
              onClick={() => {
                setShowProductos(true);
                setSoloListaProductos(false);
                setMostrarCrearProducto(false);
                setProductoEditar(null);
              }}
              className="flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 transition"
            >
              <Package className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700">....</span>
            </button>
            <button
              onClick={() => {
                setShowProductos(false);
                setMostrarCrearProducto(false);
                setProductoEditar(null);
              }}
              className="flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 transition"
            >
              <Tags className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700">Categorías</span>
            </button>
            <button
              onClick={() => {
                setShowProductos(true);
                setSoloListaProductos(true);
                setMostrarCrearProducto(false);
                setProductoEditar(null);
              }}
              className="flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 transition"
            >
              <LayoutList className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700">Ver Productos</span>
            </button>
            <button
              onClick={handleMostrarCrearProducto}
              className="flex items-center gap-2 py-2 px-3 rounded 
                         hover:bg-gray-200 hover:scale-105 transition-transform transition-colors"
            >
              <PlusCircle className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700">Crear Producto</span>
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="mt-10 py-2 px-4 rounded bg-gray-800 hover:bg-gray-700 transition flex items-center justify-center gap-2 text-white"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <main className="flex-grow p-8 max-w-6xl mx-auto">
        <section className="mb-8 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-3xl font-extrabold mb-4 text-gray-900">
            ¡Bienvenido, Administrador!
          </h2>
          <p className="text-gray-600 mb-6 text-base">
            Aquí puedes gestionar todos los productos y categorías de tu tienda.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-100 rounded-lg p-5 flex items-center shadow-sm hover:shadow-md transition">
              <Package className="text-gray-800 w-8 h-8 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Productos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {cantidadProductos}
                </p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-5 flex items-center shadow-sm hover:shadow-md transition">
              <Layers3 className="text-gray-800 w-8 h-8 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Categorías</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {cantidadCategorias}
                </p>
              </div>
            </div>
          </div>
        </section>

        {showProductos ? (
          soloListaProductos ? (
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Lista de Productos
              </h3>
              <ListarProductosAdmin onEditarProducto={handleEditarProducto} />
            </div>
          ) : (
            <div>
              {productoEditar ? (
                <EditarProductoForm
                  producto={productoEditar}
                  onGuardado={handleFormularioGuardado}
                  onCancelar={() => setProductoEditar(null)}
                />
              ) : (
                mostrarCrearProducto && (
                  <div className="space-y-2">
                    <CrearProductoForm
                      onGuardado={() => {
                        setMostrarCrearProducto(false);
                        handleFormularioGuardado();
                      }}
                    />
                    <button
                      onClick={() => setMostrarCrearProducto(false)}
                      className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                )
              )}
            </div>
          )
        ) : (
          <div className="mt-6 flex flex-col lg:flex-row gap-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200 w-full lg:w-1/3">
              <div className="flex items-center gap-2 mb-4">
                <PlusCircle className="w-5 h-5 text-gray-800" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Crear nueva categoría
                </h2>
              </div>
              <CrearCategoriaForm />
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 flex-1 max-h-[450px] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Tags className="w-5 h-5 text-gray-800" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Lista de Categorías
                  </h2>
                </div>
              </div>
              <div className="p-4">
                <ListaCategorias />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
