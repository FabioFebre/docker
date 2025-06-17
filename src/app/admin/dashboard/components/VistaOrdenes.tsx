'use client';
import { useEffect, useState } from 'react';

type Orden = {
  id: number;
  usuarioId: number;
  estado: string;
  total: number;
  createdAt: string;
};

export default function VistaOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);

  useEffect(() => {
    async function fetchOrdenes() {
      try {
        const res = await fetch('https://sg-studio-backend.onrender.com/ordenes');
        const data = await res.json();
        setOrdenes(data);
      } catch (error) {
        console.error('Error al obtener las órdenes:', error);
      }
    }

    fetchOrdenes();
  }, []);

    const cambiarEstado = async (id: number, nuevoEstado: string) => {
        try {
            const res = await fetch(`https://sg-studio-backend.onrender.com/ordenes/estado/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ estado: nuevoEstado }),
            });

            if (!res.ok) throw new Error('Error al actualizar estado');

            setOrdenes((prev) =>
            prev.map((orden) =>
                orden.id === id ? { ...orden, estado: nuevoEstado } : orden
            )
            );
        } catch (err) {
            console.error(err);
        }
    };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6"></h2>
      {ordenes.length === 0 ? (
        <p>No hay órdenes registradas.</p>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden) => (
            <div key={orden.id} className="border p-4 rounded shadow-sm">
              <p className="text-sm text-gray-500">Orden #{orden.id}</p>
              <p className="font-semibold">Total: PEN {orden.total.toFixed(2)}</p>
              <p>Estado: <span className="font-medium">{orden.estado}</span></p>
              <p className="text-sm text-gray-400">Fecha: {new Date(orden.createdAt).toLocaleString()}</p>

              <div className="mt-2 space-x-2">
                {orden.estado !== 'completado' && (
                  <button
                    onClick={() => cambiarEstado(orden.id, 'completado')}
                    className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Marcar como completado
                  </button>
                )}
                {orden.estado !== 'pendiente' && (
                  <button
                    onClick={() => cambiarEstado(orden.id, 'pendiente')}
                    className="px-3 py-1 text-sm rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Marcar como pendiente
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
