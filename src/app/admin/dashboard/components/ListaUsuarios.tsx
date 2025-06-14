'use client';

import { useEffect, useState } from 'react';

type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
};

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://sg-studio-backend.onrender.com/usuarios')
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((error) => console.error('Error al obtener usuarios:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600 font-semibold">Cargando usuarios...</p>;
  }

  if (usuarios.length === 0) {
    return <p className="text-center text-gray-600 font-semibold">No hay usuarios registrados.</p>;
  }

  return (
    <ul className="space-y-2">
      {usuarios.map((usuario) => (
        <li
          key={usuario.id}
          className="bg-white p-4 rounded shadow-sm hover:shadow transition"
        >
          <p className="text-gray-800 font-semibold">
            <span className="text-gray-600 font-semibold">Nombre:</span> {usuario.nombre} {usuario.apellido}
          </p>
          <p className="text-gray-800 font-semibold">
            <span className="text-gray-600 font-semibold">Email:</span> {usuario.email}
          </p>
          <p className="text-gray-800 font-semibold">
            <span className="text-gray-600 font-semibold">Rol:</span> {usuario.rol}
          </p>
        </li>
      ))}
    </ul>
  );
}
