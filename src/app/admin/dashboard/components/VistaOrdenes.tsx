'use client';
import React, { useEffect, useState } from 'react';

type Orden = {
  id: number;
  usuarioId: number;
  estado: string;
  total: number;
  createdAt: string;
};

type OrdenItem = {
  id: number;
  ordenId: number;
  productoId: number;
  cantidad: number;
  precio: number;
};

type Producto = {
  id: number;
  nombre: string;
};

export default function VistaOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordenItems, setOrdenItems] = useState<OrdenItem[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordenesRes, productosRes] = await Promise.all([
          fetch('https://sg-studio-backend.onrender.com/ordenes'),
          fetch('https://sg-studio-backend.onrender.com/productos'),
        ]);

        const ordenesData = await ordenesRes.json();
        const productosData = await productosRes.json();

        setOrdenes(ordenesData);
        setProductos(productosData);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const guardarItemActualizado = async (item: OrdenItem) => {
    try {
      const res = await fetch(`https://sg-studio-backend.onrender.com/orden-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: item.cantidad }),
      });

      if (!res.ok) throw new Error('No se pudo actualizar el item');

      // Calcular nuevo subtotal
      const nuevoSubtotal = ordenItems.reduce((sum, i) => {
        const cantidad = i.id === item.id ? item.cantidad : i.cantidad;
        return sum + cantidad * i.precio;
      }, 0);

      const orden = ordenes.find((o) => o.id === editandoId);
      const envio = orden?.envio || 0;
      const nuevoTotal = nuevoSubtotal + envio;

      // Actualizar la orden con total/subtotal recalculado
      const resOrden = await fetch(`https://sg-studio-backend.onrender.com/ordenes/${item.ordenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtotal: nuevoSubtotal,
          envio,
          total: nuevoTotal,
          estado: orden?.estado || 'pendiente',
        }),
      });

      if (!resOrden.ok) throw new Error('Error al actualizar la orden');

      setOrdenes((prev) =>
        prev.map((o) =>
          o.id === item.ordenId ? { ...o, total: nuevoTotal } : o
        )
      );

      alert('Item actualizado y total recalculado');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar item');
    }
  };


  const eliminarItem = async (id: number) => {
    const confirmar = confirm('¿Deseas eliminar este producto de la orden?');
    if (!confirmar) return;

    try {
      const res = await fetch(`https://sg-studio-backend.onrender.com/orden-items/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('No se pudo eliminar el item');

      setOrdenItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert('Error al eliminar item');
    }
  };



  const fetchOrdenItems = async (ordenId: number) => {
    try {
      const res = await fetch('https://sg-studio-backend.onrender.com/orden-items');
      const data: OrdenItem[] = await res.json();
      const filtrados = data.filter((item) => item.ordenId === ordenId);
      setOrdenItems(filtrados);
    } catch (error) {
      console.error('Error al obtener los items:', error);
    }
  };

  const cambiarEstado = async (id: number, estado: string) => {
    try {
      const res = await fetch(`https://sg-studio-backend.onrender.com/ordenes/estado/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });

      if (!res.ok) throw new Error('Error al actualizar estado');

      setOrdenes((prev) =>
        prev.map((orden) => (orden.id === id ? { ...orden, estado } : orden))
      );
      setEditandoId(null);
      setOrdenItems([]);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar estado');
    }
  };

  const eliminarOrden = async (id: number) => {
    const confirmar = confirm('¿Deseas eliminar esta orden?');
    if (!confirmar) return;

    try {
      const res = await fetch(`https://sg-studio-backend.onrender.com/ordenes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar orden');

      setOrdenes((prev) => prev.filter((orden) => orden.id !== id));
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar la orden');
    }
  };

  const getNombreProducto = (id: number) => {
    const producto = productos.find((p) => p.id === id);
    return producto ? producto.nombre : `ID ${id}`;
  };

  if (loading) return <p className="text-center text-gray-600">Cargando órdenes...</p>;

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold mb-4"></h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm text-left bg-white">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Usuario ID</th>
              <th className="px-4 py-2 border">Total (PEN)</th>
              <th className="px-4 py-2 border">Estado</th>
              <th className="px-4 py-2 border">Fecha</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden.id} className="border-t">
                <td className="px-4 py-2 border">{orden.id}</td>
                <td className="px-4 py-2 border">{orden.nombre} {orden.apellido}</td>

                <td className="px-4 py-2 border">PEN {orden.total.toFixed(2)}</td>
                <td className="px-4 py-2 border">
                  {editandoId === orden.id ? (
                    <select
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="completado">Completado</option>
                    </select>
                  ) : (
                    <span className="capitalize">{orden.estado}</span>
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {new Date(orden.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 border space-x-2">
                  {editandoId === orden.id ? (
                    <>
                      <button
                        onClick={() => cambiarEstado(orden.id, nuevoEstado)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditandoId(null);
                          setOrdenItems([]);
                        }}
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditandoId(orden.id);
                          setNuevoEstado(orden.estado);
                          fetchOrdenItems(orden.id);
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarOrden(orden.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla separada de orden-items */}
      {editandoId && ordenItems.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Detalles de la Orden #{editandoId}</h3>
          <table className="min-w-full border text-sm text-left bg-white">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2 border">Producto</th>
                <th className="px-4 py-2 border">Cantidad</th>
                <th className="px-4 py-2 border">Precio Unitario (PEN)</th>
                <th className="px-4 py-2 border">Acciones</th>

              </tr>
            </thead>
            <tbody>
              {ordenItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 border">{getNombreProducto(item.productoId)}</td>
                  <td className="px-4 py-2 border">
                    <input
                      type="number"
                      min={1}
                      value={item.cantidad}
                      onChange={(e) => {
                        const nuevaCantidad = parseInt(e.target.value);
                        setOrdenItems((prev) =>
                          prev.map((i) =>
                            i.id === item.id ? { ...i, cantidad: nuevaCantidad } : i
                          )
                        );
                      }}
                      className="w-16 border rounded px-2 py-1"
                    />
                  </td>
                  
                  <td className="px-4 py-2 border">PEN {item.precio.toFixed(2)}</td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => guardarItemActualizado(item)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => eliminarItem(item.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </td>

                </tr>
                
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
