'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://sg-studio-backend.onrender.com/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', data.usuario.rol); // 👈 Guardar el rol

        setMensaje('');

        if (data.usuario.rol === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/usuario');
        }

      } else {
        setMensaje(data.error || 'Correo o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('No se pudo conectar al servidor');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white pt-24">
      <div className="w-full max-w-md bg-white shadow-lg p-8 rounded-lg border">
        <h2 className="text-2xl text-center text-black mb-6" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Iniciar sesión
        </h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm text-black mb-1" htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
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
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
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
            Iniciar sesión
          </button>
        </form>

        {mensaje && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-center text-sm">
            {mensaje}
          </div>
        )}
      </div>
    </main>
  );
}
