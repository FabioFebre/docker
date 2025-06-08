// src/app/admin/dashboard/components/ListaCategorias.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ListaCategorias() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch('https://sg-studio-backend.onrender.com/categorias')
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error('Error al obtener categorías:', err));
  }, []);

  return (
    <ul className="space-y-2">
      {categorias.map((categoria) => (
        <li
          key={categoria._id}
          className="bg-gray-100 p-3 rounded shadow-sm hover:shadow transition"
        >
          {categoria.nombre}
        </li>
      ))}
    </ul>
  );
}
