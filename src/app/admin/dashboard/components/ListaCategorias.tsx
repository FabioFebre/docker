'use client';

import { useEffect, useState } from 'react';

type Categoria = {
  id: number;
  nombre: string;
};

export default function ListaCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

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
          key={categoria.id}
          className="bg-gray-100 p-3 rounded shadow-sm hover:shadow transition"
        >
          <span className="font-bold">{categoria.nombre}</span>
        </li>
      ))}
    </ul>
  );
}
