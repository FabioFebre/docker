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

  const handleImagenChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    nuevaImagenesURLs.current.forEach((url) => URL.revokeObjectURL(url));
    nuevaImagenesURLs.current = files.map((file) => URL.createObjectURL(file));
    setNuevaImagenes(files);
  };

  const handleGuardar = async () => {
    try {
      const formData = new FormData();
      Object.entries(productoEditando).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      nuevaImagenes.forEach((file) => {
        formData.append('imagenes', file);
      });
      const res = await fetch(`https://sg-studio-backend.onrender.com/productos/${productoEditando.id}`, {
        method: 'PUT',
        body: formData,
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

  if (loading)
    return <p className="text-center text-lg text-gray-600">Cargando productos...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Gestión de Productos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((producto) => (
          <div key={producto.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex flex-col">
            <div className="w-full h-40 mb-4 overflow-hidden rounded-md bg-gray-100">
              <img
                src={Array.isArray(producto.imagen) && producto.imagen.length > 0 ? producto.imagen[0] : '/placeholder.jpg'}
                alt="Imagen producto"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">{producto.nombre}</h3>
              <p className="text-sm font-bold text-gray-800 mb-2">${producto.precio}</p>
              {producto.descripcion && (
                <p className="text-sm text-gray-600 mb-2 truncate">{producto.descripcion}</p>
              )}
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                {producto.categoria?.nombre && <li><strong>Categoría:</strong> {producto.categoria.nombre}</li>}
                {producto.color && <li><strong>Color:</strong> {producto.color}</li>}
                {producto.talla && <li><strong>Talla:</strong> {producto.talla}</li>}
                {producto.cantidad !== undefined && <li><strong>Cantidad:</strong> {producto.cantidad}</li>}
                {producto.composicion && <li><strong>Composición:</strong> {producto.composicion}</li>}
                {producto.info && <li><strong>Info:</strong> {producto.info}</li>}
                {producto.cuidados && <li><strong>Cuidados:</strong> {producto.cuidados}</li>}
                {producto.seleccionado && <li><strong>Seleccionado:</strong> Sí</li>}
              </ul>
            </div>
            <div className="flex justify-center gap-4 mt-auto">
              <button
                onClick={() => abrirModalEditar(producto)}
                className="px-2 py-1 border border-black text-black hover:bg-black hover:text-white rounded text-xs w-1/2"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminar(producto.id)}
                disabled={eliminando === producto.id}
                className="px-2 py-1 border border-black text-black hover:bg-black hover:text-white rounded text-xs w-1/2 disabled:opacity-50"
              >
                {eliminando === producto.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && productoEditando && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl divide-y divide-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Editar Producto</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar();
              }}
              className="space-y-4 pt-4"
            >
              <div className="grid grid-cols-1 gap-4">
                <label>
                  <span className="text-gray-700">Nombre:</span>
                  <input
                    name="nombre"
                    value={productoEditando.nombre}
                    onChange={handleCambio}
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </label>
                <label>
                  <span className="text-gray-700">Precio:</span>
                  <input
                    type="number"
                    name="precio"
                    value={productoEditando.precio}
                    onChange={handleCambio}
                    step="0.01"
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </label>
                <label>
                  <span className="text-gray-700">Descripción:</span>
                  <textarea
                    name="descripcion"
                    value={productoEditando.descripcion}
                    onChange={handleCambio}
                    className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    rows={3}
                  />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label>
                    <span className="text-gray-700">Color:</span>
                    <input
                      name="color"
                      value={productoEditando.color || ''}
                      onChange={handleCambio}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </label>
                  <label>
                    <span className="text-gray-700">Talla:</span>
                    <input
                      name="talla"
                      value={productoEditando.talla || ''}
                      onChange={handleCambio}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label>
                    <span className="text-gray-700">Cantidad:</span>
                    <input
                      type="number"
                      name="cantidad"
                      value={productoEditando.cantidad || ''}
                      onChange={handleCambio}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </label>
                  <label>
                    <span className="text-gray-700">Composición:</span>
                    <input
                      name="composicion"
                      value={productoEditando.composicion || ''}
                      onChange={handleCambio}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label>
                    <span className="text-gray-700">Info:</span>
                    <input
                      name="info"
                      value={productoEditando.info || ''}
                      onChange={handleCambio}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </label>
                  <label>
                    <span className="text-gray-700">Cuidados:</span>
                    <input
                      name="cuidados"
                      value={productoEditando.cuidados || ''}
                      onChange={handleCambio}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="seleccionado"
                    checked={productoEditando.seleccionado || false}
                    onChange={handleCambio}
                    className="h-4 w-4 text-black"
                  />
                  <span className="text-gray-700">Seleccionado</span>
                </label>
                <label>
                  <span className="text-gray-700">Imágenes nuevas:</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagenChange}
                    className="block w-full text-sm mt-1 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-black file:text-white hover:file:bg-gray-800"
                  />
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
                </label>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-2 py-1 border border-black text-black hover:bg-black hover:text-white rounded text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-1 border border-black text-black hover:bg-black hover:text-white rounded text-xs"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
