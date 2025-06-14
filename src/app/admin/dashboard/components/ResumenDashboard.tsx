'use client';

import { useEffect, useState } from 'react';
import { Package, Layers3, Users } from 'lucide-react';
import GraficoOrdenes from './GraficoOrdenes'; // 👈 Importa el gráfico

export default function ResumenDashboard() {
  const [productos, setProductos] = useState(0);
  const [categorias, setCategorias] = useState(0);
  const [cantidadUsuarios, setCantidadUsuarios] = useState(0);

  useEffect(() => {
    fetch('https://sg-studio-backend.onrender.com/productos')
      .then(res => res.json())
      .then(data => setProductos(data.length));

    fetch('https://sg-studio-backend.onrender.com/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data.length));

    fetch('https://sg-studio-backend.onrender.com/usuarios')
      .then(res => res.json())
      .then(data => setCantidadUsuarios(data.length))
      .catch(err => console.error('Error al obtener usuarios:', err));
  }, []);

  return (
    <section className="mb-8 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-extrabold mb-4 font-bold">¡Bienvenido, Administrador!</h2>
      <p className="text-gray-600 mb-6 font-bold">
        Gestiona productos, categorías y usuarios de tu tienda.
      </p>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card titulo="Productos" valor={productos} Icon={Package} />
        <Card titulo="Categorías" valor={categorias} Icon={Layers3} />
        <Card titulo="Usuarios" valor={cantidadUsuarios} Icon={Users} />
      </div>

      {/* Gráfico de ordenes */}
      <GraficoOrdenes />
    </section>
  );
}

function Card({ titulo, valor, Icon }) {
  return (
    <div className="bg-gray-100 rounded-lg p-5 flex items-center shadow-sm hover:shadow-md transition">
      <Icon className="text-gray-800 w-8 h-8 mr-4" />
      <div>
        <p className="text-sm text-gray-700 font-bold">{titulo}</p>
        <p className="text-2xl font-extrabold text-gray-900">{valor}</p>
      </div>
    </div>
  );
}
