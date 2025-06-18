'use client';

import { useEffect, useState, useRef } from 'react';

export default function ListarProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [nuevaImagenes, setNuevaImagenes] = useState([]);
  const nuevaImagenesURLs = useRef([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

  useEffect(() => {
    async function fetchProductos() {
      try {
        const res = await fetch('https://sg-studio-backend.onrender.com/productos');
        if (!res.ok) throw new Error('Error al obtener productos');
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProductos();
  }, []);

  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    setEliminando(id);

    try {
      const res = await fetch(`https://sg-studio-backend.onrender.com/productos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar producto');
      setProductos((prev) => prev.filter((producto) => producto.id !== id));
    } catch (error) {
      alert(error.message);
    } finally {
      setEliminando(null);
    }
  };

  const abrirModalEditar = (producto) => {
    setProductoEditando(producto);
    nuevaImagenesURLs.current.forEach((url) => URL.revokeObjectURL(url));
    nuevaImagenesURLs.current = [];
    setNuevaImagenes([]);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);
    nuevaImagenesURLs.current.forEach((url) => URL.revokeObjectURL(url));
    nuevaImagenesURLs.current = [];
    setNuevaImagenes([]);
  };

  const handleCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setProductoEditando((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGuardar = async () => {
    try {
      let bodyData = { ...productoEditando };
      const res = await fetch(`https://sg-studio-backend.onrender.com/productos/${productoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) throw new Error('Error al guardar el producto');
      const productoActualizado = await res.json();
      setProductos((prev) =>
        prev.map((p) => (p.id === productoActualizado.id ? productoActualizado : p))
      );
      cerrarModal();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <p className="text-center text-lg text-gray-600">Cargando productos...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-4 py-2 text-left">Imagen</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Precio</th>
            <th className="px-4 py-2 text-left">Talla</th>
            <th className="px-4 py-2 text-left">Color</th>
            <th className="px-4 py-2 text-left">Cantidad</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id} className="border-t">
              <td className="px-4 py-2">
                <img
                  src={Array.isArray(producto.imagen) && producto.imagen.length > 0 ? producto.imagen[0] : '/placeholder.jpg'}
                  alt="imagen"
                  className="w-16 h-16 object-cover rounded"
                />
              </td>
              <td className="px-4 py-2">{producto.nombre}</td>
              <td className="px-4 py-2">${producto.precio}</td>
              <td className="px-4 py-2">{producto.talla}</td>
              <td className="px-4 py-2">{producto.color}</td>
              <td className="px-4 py-2">{producto.cantidad}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => abrirModalEditar(producto)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(producto.id)}
                  disabled={eliminando === producto.id}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {eliminando === producto.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición reutilizado */}
      {modalAbierto && productoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Editar Producto</h2>
           <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar();
              }}
              className="space-y-4"
            >
              {/* Campos de texto */}
              <label className="block">
                <span className="text-gray-700">Nombre:</span>
                <input
                  name="nombre"
                  value={productoEditando.nombre}
                  onChange={handleCambio}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </label>

              <label className="block">
                <span className="text-gray-700">Precio:</span>
                <input
                  type="number"
                  name="precio"
                  value={productoEditando.precio}
                  onChange={handleCambio}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  step="0.01"
                  required
                />
              </label>

              <label className="block">
                <span className="text-gray-700">Descripción:</span>
                <textarea
                  name="descripcion"
                  value={productoEditando.descripcion}
                  onChange={handleCambio}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  rows={3}
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-gray-700">Color:</span>
                  <input
                    name="color"
                    value={productoEditando.color || ''}
                    onChange={handleCambio}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Talla:</span>
                  <input
                    name="talla"
                    value={productoEditando.talla || ''}
                    onChange={handleCambio}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-gray-700">Cantidad:</span>
                  <input
                    type="number"
                    name="cantidad"
                    value={productoEditando.cantidad || ''}
                    onChange={handleCambio}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Composición:</span>
                  <input
                    name="composicion"
                    value={productoEditando.composicion || ''}
                    onChange={handleCambio}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-gray-700">Info:</span>
                  <input
                    name="info"
                    value={productoEditando.info || ''}
                    onChange={handleCambio}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Cuidados:</span>
                  <input
                    name="cuidados"
                    value={productoEditando.cuidados || ''}
                    onChange={handleCambio}
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-gray-700">Seleccionado:</span>
                <input
                  type="checkbox"
                  name="seleccionado"
                  checked={productoEditando.seleccionado || false}
                  onChange={handleCambio}
                  className="mt-1 h-5 w-5 text-green-600"
                />
              </label>


              <div>
                <label className="block mb-2 text-gray-700">Imágenes nuevas:</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagenChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                />

                {/* Vista previa de nuevas imágenes */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {nuevaImagenes.map((file, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(file)}
                      alt={`preview-${i}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                  ))}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
