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
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch('https://sg-studio-backend.onrender.com/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Usuario,
    id: number
  ) => {
    const value = e.target.value;
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  const actualizarUsuario = async (usuario: Usuario) => {
    try {
      await fetch(`https://sg-studio-backend.onrender.com/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      });
      setEditandoId(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;

    try {
      await fetch(`https://sg-studio-backend.onrender.com/usuarios/${id}`, {
        method: 'DELETE',
      });
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Cargando usuarios...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4"></h2>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border text-sm bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Apellido</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Rol</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="border px-2 py-1">{u.id}</td>
                <td className="border px-2 py-1">
                  {editandoId === u.id ? (
                    <input
                      value={u.nombre}
                      onChange={(e) => handleInputChange(e, 'nombre', u.id)}
                      className="border px-1 rounded"
                    />
                  ) : (
                    u.nombre
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editandoId === u.id ? (
                    <input
                      value={u.apellido}
                      onChange={(e) => handleInputChange(e, 'apellido', u.id)}
                      className="border px-1 rounded"
                    />
                  ) : (
                    u.apellido
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editandoId === u.id ? (
                    <input
                      value={u.email}
                      onChange={(e) => handleInputChange(e, 'email', u.id)}
                      className="border px-1 rounded"
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editandoId === u.id ? (
                    <input
                      value={u.rol}
                      onChange={(e) => handleInputChange(e, 'rol', u.id)}
                      className="border px-1 rounded"
                    />
                  ) : (
                    u.rol
                  )}
                </td>
                <td className="border px-2 py-1 space-x-2">
                  {editandoId === u.id ? (
                    <>
                      <button
                        onClick={() => actualizarUsuario(u)}
                        className="text-green-600 hover:underline"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="text-gray-600 hover:underline"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditandoId(u.id)}
                        className="text-yellow-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarUsuario(u.id)}
                        className="text-red-600 hover:underline"
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
    </div>
  );
}
