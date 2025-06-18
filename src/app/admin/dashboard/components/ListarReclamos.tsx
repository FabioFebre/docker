'use client';

import { useEffect, useState } from 'react';

type Reclamo = {
  id: number;
  mensaje: string;
  estado: string;
  usuarioId: number;
  ordenId: number;
  createdAt: string;
};

export default function ListarReclamos() {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://sg-studio-backend.onrender.com/reclamos')
      .then((res) => res.json())
      .then((data) => setReclamos(data))
      .catch((err) => {
        console.error('Error al cargar reclamos:', err);
        alert('No se pudieron cargar los reclamos');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEliminar = async (id: number) => {
    const confirmar = confirm('¿Estás seguro de eliminar este reclamo?');
    if (!confirmar) return;

    try {
      const res = await fetch(`https://sg-studio-backend.onrender.com/reclamos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar el reclamo');

      setReclamos((prev) => prev.filter((r) => r.id !== id));
      alert('Reclamo eliminado correctamente');
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar el reclamo');
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Cargando reclamos...</p>;
  }

  if (reclamos.length === 0) {
    return <p className="text-center text-gray-600">No hay reclamos registrados.</p>;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold"></h2>
      <ul className="space-y-4">
        {reclamos.map((reclamo) => (
          <li
            key={reclamo.id}
            className="bg-white p-5 rounded shadow-md border border-gray-200 hover:shadow-lg transition relative"
          >
            <div className="space-y-1 text-sm">
              <p><strong>Reclamo ID:</strong> {reclamo.id}</p>
              <p><strong>Usuario ID:</strong> {reclamo.usuarioId}</p>
              <p><strong>Orden ID:</strong> {reclamo.ordenId}</p>
              <p><strong>Mensaje:</strong> {reclamo.mensaje}</p>
              <p><strong>Estado:</strong> <span className="text-blue-600 font-medium">{reclamo.estado}</span></p>
              <p className="text-gray-400 text-xs">
                Enviado el: {new Date(reclamo.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleEliminar(reclamo.id)}
              className="mt-3 text-sm bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 transition"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
