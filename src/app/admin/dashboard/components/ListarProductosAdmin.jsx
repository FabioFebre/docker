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

    // Limpiar URLs de imágenes previas
    nuevaImagenesURLs.current.forEach((url) => URL.revokeObjectURL(url));
    nuevaImagenesURLs.current = [];

    setNuevaImagenes([]);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);

    // Liberar URLs creadas
    nuevaImagenesURLs.current.forEach((url) => URL.revokeObjectURL(url));
    nuevaImagenesURLs.current = [];
    setNuevaImagenes([]);
  };

  const handleCambio = (e) => {
    const { name, value } = e.target;
    setProductoEditando((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagenChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);

    nuevaImagenesURLs.current.forEach((url) => URL.revokeObjectURL(url));
    nuevaImagenesURLs.current = files.map((file) => URL.createObjectURL(file));

    setNuevaImagenes(files);
  };

  const handleGuardar = async () => {
    try {
      let bodyData = { ...productoEditando };

     
      const res = await fetch(`https://sg-studio-backend.onrender.com/productos/${productoEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        throw new Error('Error al guardar el producto');
      }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {productos.map(
          ({
            id,
            imagen,
            nombre,
            precio,
            descripcion,
            color,
            talla,
            cantidad,
            composicion,
            info,
            cuidados,
            seleccionado,
            categoria,
          }) => (
            <div
              key={id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="w-full h-48 bg-gray-100">
                <img
                  src={Array.isArray(imagen) && imagen.length > 0 ? imagen[0] : '/placeholder.jpg'}
                  alt="Imagen producto"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 text-left">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{nombre}</h4>
                <p className="text-gray-700 font-bold mb-2">${precio}</p>
                {descripcion && (
                  <p className="text-gray-600 text-sm mb-1 truncate">{descripcion}</p>
                )}
                <div className="text-gray-600 text-sm space-y-0.5 mb-3">
                  {categoria?.nombre && <p>Categoría: {categoria.nombre}</p>}
                  {color && <p>Color: {color}</p>}
                  {talla && <p>Talla: {talla}</p>}
                  {cantidad !== undefined && <p>Cantidad: {cantidad}</p>}
                  {composicion && <p>Composición: {composicion}</p>}
                  {info && <p>Info: {info}</p>}
                  {cuidados && <p>Cuidados: {cuidados}</p>}
                  {seleccionado && <p>Seleccionado: {seleccionado}</p>}

                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() =>
                      abrirModalEditar({
                        id,
                        imagen,
                        nombre,
                        precio,
                        descripcion,
                        color,
                        talla,
                        cantidad,
                        composicion,
                        info,
                        cuidados,
                        seleccionado,
                      })
                    }
                    className="px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition text-sm w-1/2 mr-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(id)}
                    disabled={eliminando === id}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm w-1/2 ml-1 disabled:opacity-50"
                  >
                    {eliminando === id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      {modalAbierto && productoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Editar Producto</h2>

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

    </>
  );
}
