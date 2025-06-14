'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function CheckoutPage() {
  const [carrito, setCarrito] = useState<any>(null)
  const [usuario, setUsuario] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    pais: 'Perú',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    referencia: '',
    metodoEnvio: 'delivery'
  })

  useEffect(() => {
    const fetchCarrito = async () => {
      const storedUser = localStorage.getItem('usuario')
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

      if (isLoggedIn && storedUser) {
        const user = JSON.parse(storedUser)
        setUsuario(user)
        setForm(prev => ({
          ...prev,
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || ''
        }))

        try {
          const res = await fetch(`https://sg-studio-backend.onrender.com/carrito/${user.id}`)
          const data = await res.json()
          setCarrito(data)
        } catch (error) {
          console.error('Error al obtener carrito:', error)
        }
      } else {
        const localCart = localStorage.getItem('carrito')
        if (localCart) {
          setCarrito({ items: JSON.parse(localCart) })
        }
      }

      setLoading(false)
    }

    fetchCarrito()
  }, [])

  const handleChange = (e: any) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const crearOrden = async () => {
    if (!carrito || !carrito.items || carrito.items.length === 0) {
      alert('El carrito está vacío.')
      return
    }

    const subtotal = carrito.items.reduce(
      (total: number, item: any) => total + item.cantidad * item.producto.precio,
      0
    )
    const envio = 10
    const total = subtotal + envio

    const orden = {
      ...form,
      usuarioId: usuario?.id || null,
      subtotal,
      envio,
      total,
      cuponCodigo: null,
      items: carrito.items.map((item: any) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precio: item.producto.precio
      }))
    }

    try {
      await axios.post('https://sg-studio-backend.onrender.com/ordenes', orden)
      alert('¡Orden creada con éxito!')

      if (usuario?.id) {
        await fetch(`https://sg-studio-backend.onrender.com/carrito/clear/${usuario.id}`, {
          method: 'DELETE'
        })
      } else {
        localStorage.removeItem('carrito')
      }

      setCarrito(null)
    } catch (err: any) {
      console.error('Error al crear la orden:', err)
      alert('Error al crear la orden')
    }
  }

  if (loading) return <p className="text-center mt-20">Cargando...</p>

  return (
    <section className="bg-white min-h-screen pt-32 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">Finaliza tu Compra</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Datos de Envío</h2>

            {[
              ['nombre', 'Nombre'],
              ['apellido', 'Apellido'],
              ['email', 'Correo Electrónico'],
              ['telefono', 'Teléfono'],
              ['pais', 'País'],
              ['departamento', 'Departamento'],
              ['provincia', 'Provincia'],
              ['distrito', 'Distrito'],
              ['direccion', 'Dirección'],
              ['referencia', 'Referencia']
            ].map(([name, label]) => (
              <div key={name} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                  name={name}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring focus:ring-black"
                />
              </div>
            ))}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Método de Envío</label>
              <select
                name="metodoEnvio"
                value={form.metodoEnvio}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm"
              >
                <option value="delivery">Delivery</option>
                <option value="retiro">Retiro en tienda</option>
              </select>
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Resumen del Pedido</h2>

            {!carrito?.items || carrito.items.length === 0 ? (
              <p className="text-gray-600">Tu carrito está vacío.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {carrito.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 items-center border-b pb-3">
                    <img
                      src={item.producto.imagen[0]}
                      alt={item.producto.nombre}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{item.producto.nombre}</span>
                      <span className="text-xs text-gray-600">
                        Talla: {item.talla} | Color: {item.color}
                      </span>
                      <span className="text-xs text-gray-600">Cantidad: {item.cantidad}</span>
                      <span className="text-sm font-bold text-gray-800">
                        S/. {item.producto.precio * item.cantidad}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {carrito?.items?.length > 0 && (
              <>
                <div className="mt-6 border-t pt-4 space-y-2">
                  <p className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>S/. {carrito.items.reduce((total: number, item: any) => total + item.cantidad * item.producto.precio, 0)}</span>
                  </p>
                  <p className="flex justify-between text-gray-700">
                    <span>Envío</span>
                    <span>S/. 10</span>
                  </p>
                  <p className="flex justify-between font-bold text-lg text-black">
                    <span>Total</span>
                    <span>
                      S/.{' '}
                      {carrito.items.reduce(
                        (total: number, item: any) => total + item.cantidad * item.producto.precio,
                        0
                      ) + 10}
                    </span>
                  </p>
                </div>
                <button
                  onClick={crearOrden}
                  className="w-full mt-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
                >
                  Confirmar Orden
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
