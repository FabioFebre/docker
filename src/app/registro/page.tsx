'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegistroPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://sg-studio-backend.onrender.com/usuarios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido: '', // si quieres agregar campo apellido más adelante
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje(' Registro exitoso');
        setNombre('');
        setEmail('');
        setPassword('');
        // Puedes redirigir con router.push('/login') si usas next/navigation
      } else {
        setMensaje(` ${data.error || 'Error al registrar'}`);
      }
    } catch (error) {
      console.error(error);
      setMensaje(' Error de conexión con el servidor');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white pt-24">
      <div className="w-full max-w-md bg-white shadow-lg p-8 rounded-lg border">
        <h2 className="text-2xl text-center text-black mb-6" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Crear cuenta
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-gray-700 mb-1" htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1" htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1" htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-animated w-full"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Registrarse
          </button>
        </form>

        {mensaje && <p className="mt-4 text-center text-sm text-red-500">{mensaje}</p>}

        <div className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-black hover:underline">Inicia sesión</Link>
        </div>
      </div>
    </main>
  );
}
