'use client'

import { useEffect, useState, FormEvent } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

export default function CheckoutPage() {
  const [carrito, setCarrito] = useState<any>(null)
  const [usuario, setUsuario] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [ubigeos, setUbigeos] = useState<any[]>([])
  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [provincias, setProvincias] = useState<string[]>([])
  const [distritos, setDistritos] = useState<string[]>([])
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const [form, setForm] = useState({
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
    fetch('https://free.e-api.net.pe/ubigeos.json', { cache: 'no-store' })
      .then(res => res.json())
      .then(raw => {
        const lista: any[] = []

        Object.entries(raw).forEach(([departamento, provincias]) => {
          Object.entries(provincias as object).forEach(([provincia, distritos]) => {
            Object.keys(distritos as object).forEach((distrito) => {
              lista.push({
                departamento,
                provincia,
                distrito
              })
            })
          })
        })

        setUbigeos(lista)
        const deps = Array.from(new Set(lista.map(u => u.departamento))).filter(Boolean)
        setDepartamentos(deps)
      })
  }, [])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (name === 'departamento') {
      const provs = ubigeos
        .filter(u => u.departamento === value)
        .map(u => u.provincia)
      setProvincias(Array.from(new Set(provs)))
      setDistritos([])
      setForm(prev => ({ ...prev, provincia: '', distrito: '', departamento: value }))
    }

    if (name === 'provincia') {
      const dists = ubigeos
        .filter(u => u.departamento === form.departamento && u.provincia === value)
        .map(u => u.distrito)
      setDistritos(Array.from(new Set(dists)))
      setForm(prev => ({ ...prev, distrito: '', provincia: value }))
    }

    if (name === 'distrito') {
      setForm(prev => ({ ...prev, distrito: value }))
    }
  }

  useEffect(() => {
    const fetchCarrito = async () => {
      const storedUser = localStorage.getItem('usuario')
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

      if (isLoggedIn && storedUser) {
        const user = JSON.parse(storedUser)
        setUsuario(user)

        try {
          const response = await fetch(`https://sg-studio-backend.onrender.com/carrito/${user.id}`)
          if (!response.ok) throw new Error('No se pudo obtener el carrito')
          const data = await response.json()
          setCarrito(data)
        } catch (error) {
          console.error('Error al obtener carrito del backend:', error)
        }
      } else {
        const savedCart = localStorage.getItem('carrito')
        if (savedCart) {
          const items = JSON.parse(savedCart)
          setCarrito({ items })
        }
      }

      setLoading(false)
    }

    fetchCarrito()
  }, [])

  const crearOrden = async (e: FormEvent) => {
    e.preventDefault()

    if (!carrito?.items?.length) {
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
      usuarioId: usuario?.id || null,
      nombre: usuario?.nombre || 'Invitado',
      apellido: usuario?.apellido || '',
      email: usuario?.email || '',
      ...form,
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

      alert('¡Gracias por tu compra! 🛍️\n\nUna asesora comercial se pondrá en contacto contigo en breve para coordinar la entrega. 📞✨')

      const numeroWsp = '51913537327'
      const mensaje = encodeURIComponent(
        ` *NUEVA ORDEN SG STUDIO* 🛍️\n\n` +
        ` *Cliente:* ${orden.nombre} ${orden.apellido}\n *Email:* ${orden.email}\n *Teléfono:* ${orden.telefono}\n\n` +
        ` *Envío a:* ${orden.direccion}, ${orden.distrito}, ${orden.provincia}, ${orden.departamento}, ${orden.pais}\n *Referencia:* ${orden.referencia}\n *Método de Envío:* ${orden.metodoEnvio}\n\n` +
        ` *Productos:*\n` +
        orden.items.map((item: any, i: number) =>
          `${i + 1}. Producto ID: ${item.productoId}\n   - Cantidad: ${item.cantidad}\n   - Precio unitario: S/. ${item.precio}`
        ).join('\n\n') +
        `\n\n *Subtotal:* S/. ${orden.subtotal}\n *Envío:* S/. ${orden.envio}\n *Total:* S/. ${orden.total}`
      )

      window.open(`https://wa.me/${numeroWsp}?text=${mensaje}`, '_blank')

      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      if (isLoggedIn && usuario?.id) {
        await fetch(`https://sg-studio-backend.onrender.com/carrito/clear/${usuario.id}`, {
          method: 'DELETE'
        })
      } else {
        localStorage.removeItem('carrito')
      }

      setCarrito(null)
      router.push('/usuario/perfil')
    } catch (err: any) {
      alert('Error al crear la orden: ' + JSON.stringify(err.response?.data || err.message))
    }
  }

  if (loading) return <p className="text-center mt-10">Cargando...</p>

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <form onSubmit={crearOrden} className="bg-white p-8 rounded-lg shadow space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Datos de Envío</h2>

          <PhoneInput
            country={'pe'}
            onlyCountries={['pe']}
            value={`51${form.telefono}`}
            onChange={(value) => {
              const phoneWithoutPrefix = value.startsWith('51') ? value.slice(2) : value
              if (/^\d{0,9}$/.test(phoneWithoutPrefix)) {
                setForm(prev => ({ ...prev, telefono: phoneWithoutPrefix }))
              }
            }}
            enableSearch={false}
            countryCodeEditable={false}
            disableDropdown={true}
            inputProps={{
              name: 'telefono',
              required: true,
              autoFocus: true,
            }}
            inputStyle={{
              width: '100%',
              height: '48px',
              fontSize: '16px',
              borderRadius: '6px',
              paddingLeft: '48px',
              color: 'black',
            }}
            containerStyle={{
              width: '100%',
            }}
            specialLabel=""
          />

          <select name="departamento" value={form.departamento} onChange={handleChange} required className="w-full p-3 text-black border rounded">
            <option value="">Departamento</option>
            {departamentos.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>

          <select name="provincia" value={form.provincia} onChange={handleChange} required disabled={!form.departamento} className="w-full p-3 text-black border rounded">
            <option value="">Provincia</option>
            {provincias.map(prov => <option key={prov} value={prov}>{prov}</option>)}
          </select>

          <select name="distrito" value={form.distrito} onChange={handleChange} required disabled={!form.provincia} className="w-full p-3 text-black border rounded">
            <option value="">Distrito</option>
            {distritos.map(dist => <option key={dist} value={dist}>{dist}</option>)}
          </select>

          <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" required className="w-full p-3 text-black border rounded" />
          <select
            name="referencia"
            value={form.referencia}
            onChange={handleChange}
            required
            className="w-full p-3 text-black border rounded"
          >
            <option value="">Selecciona una Talla</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="Estándar">Estándar</option>
          </select>

          <select name="metodoEnvio" value={form.metodoEnvio} onChange={handleChange} className="w-full p-3 text-black border rounded">
            <option value="delivery">Delivery</option>
            <option value="retiro">Retiro en tienda</option>
          </select>
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terminos"
              checked={aceptaTerminos}
              onChange={() => setAceptaTerminos(!aceptaTerminos)}
              className="mt-1"
              required
            />
            <label htmlFor="terminos" className="text-sm text-gray-700">
              Acepto los{' '}
              <a
                href="/terminos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Términos y condiciones
              </a>{' '}
              de la tienda
            </label>
          </div>

          <button
            type="submit"
            disabled={!aceptaTerminos}
            className={`w-full py-3 rounded text-white transition ${
              aceptaTerminos ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Confirmar Orden
          </button>

        </form>

        <div className="bg-white p-8 rounded-lg shadow space-y-4 h-fit">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resumen del Pedido</h2>
          {(!carrito?.items || carrito.items.length === 0) ? (
            <p className="text-gray-600">Tu carrito está vacío.</p>
          ) : (
            carrito.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4 border-b pb-4">
                <img src={item.producto.imagen[0]} alt={item.producto.nombre} className="w-16 h-16 object-cover rounded" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.producto.nombre}</p>
                  <p className="text-xs text-gray-500">Color: {item.color}</p>
                  <p className="text-sm font-semibold text-gray-700">S/. {item.cantidad * item.producto.precio}</p>
                </div>
              </div>
            ))
          )}

          {carrito?.items?.length > 0 && (
            <div className="mt-4 text-right">
              <p className="text-lg text-black font-semibold">Total: S/. {carrito.items.reduce((total: number, item: any) => total + item.cantidad * item.producto.precio, 0) + 10}</p>
              <p className="text-sm text-gray-500">Incluye envío: S/. 10</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
