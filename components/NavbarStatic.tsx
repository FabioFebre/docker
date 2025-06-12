'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaSearch, FaShoppingBag, FaTimes } from 'react-icons/fa';

type Categoria = { id: number; nombre: string; slug?: string };
type Producto = { id: number; nombre: string; imagen: string[]; precio: number };
type ProductoCarrito = { id: number; talla: string; color: string; cantidad: number; producto: Producto };

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [allProducts, setAllProducts] = useState<Producto[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cargar categorías
  useEffect(() => {
    fetch('https://sg-studio-backend.onrender.com/categorias')
      .then(res => res.json())
      .then(setCategorias)
      .catch(err => console.error('Error al cargar categorías:', err));
  }, []);

  // Cargar todos los productos para filtrar
  useEffect(() => {
    fetch('https://sg-studio-backend.onrender.com/productos')
      .then(res => res.json())
      .then((data: Producto[]) => setAllProducts(data))
      .catch(err => console.error('Error al cargar productos:', err));
  }, []);

  // Filtrar sugerencias localmente
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term.length < 3) {
      setSugerencias([]);
    } else {
      setSugerencias(
        allProducts.filter(p => p.nombre.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, allProducts]);

  // Cerrar búsqueda al click fuera
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        showSearch &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showSearch]);

  // Cargar carrito
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('usuario');
    if (isLoggedIn && storedUser) {
      const user = JSON.parse(storedUser);
      fetch(`https://sg-studio-backend.onrender.com/carrito/${user.id}`)
        .then(res => res.json())
        .then(data => setCarrito(data.items))
        .catch(err => console.error('Error al obtener carrito:', err));
    } else {
      const saved = localStorage.getItem('carrito');
      if (saved) setCarrito(JSON.parse(saved));
    }
  }, []);

  // Guardar carrito local si no hay sesión
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
  }, [carrito]);

  const clearSearch = () => setSearchTerm('');
  const handleUserClick = () => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('role');
    if (logged) router.push(role === 'admin' ? '/admin/dashboard' : '/usuario/perfil');
    else router.push('/login');
  };

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim().length > 2) {
      router.push(`/buscar?query=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
    }
  };

  const calcularTotal = () =>
    carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);

  const removeItem = (id: number) => {
    const updated = carrito.filter(i => i.id !== id);
    setCarrito(updated);
    if (localStorage.getItem('isLoggedIn') === 'true') {
      const user = JSON.parse(localStorage.getItem('usuario')!);
      fetch(`https://sg-studio-backend.onrender.com/carrito/${user.id}/eliminar/${id}`, { method: 'DELETE' });
    }
  };

  const aumentarCantidad = (id: number) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  };

  const disminuirCantidad = (id: number) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id && item.cantidad > 1
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      )
    );
  };


  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-4 bg-white text-black shadow-md border-b border-gray-300">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            SG STUDIO
          </Link>
          <ul className="flex gap-6 text-sm font-medium">
            <li className="relative group">
              <Link href="/woman" className="underline-hover">WOMAN</Link>
              <div className="absolute left-0 top-full mt-0 w-64 bg-white shadow-lg p-4 hidden group-hover:block border text-sm z-30">
                <ul className="space-y-1 text-black">
                  {categorias.length > 0 ? (
                    categorias.map(cat => (
                      <li key={cat.id}>
                        <Link href={`/woman?categoria=${encodeURIComponent(cat.nombre)}`}>{cat.nombre}</Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">Cargando...</li>
                  )}
                </ul>
              </div>
            </li>
          </ul>
          <div className="flex gap-4 text-xl">
            <button onClick={handleUserClick} aria-label="Perfil" className="hover:text-pink-500">
              <FaUser />
            </button>
            <button ref={buttonRef} onClick={() => setShowSearch(!showSearch)} aria-label="Buscar" className="hover:text-pink-500">
              <FaSearch />
            </button>
            <button onClick={() => setShowCart(true)} aria-label="Carrito" className="hover:text-pink-500 relative">
              <FaShoppingBag />
<<<<<<< HEAD
              {Array.isArray(carrito) && carrito.length > 0 && (
                <span className="absolute top-0 right-0 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {carrito.reduce((total, item) => total + item.cantidad, 0)}
=======
              {carrito.length > 0 && (
                <span className="absolute top-0 right-0 bg-pink-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {carrito.length}
>>>>>>> 64550de81daa5283aac3c904c3a233796e4b3d70
                </span>
              )}
              
            </button>
<<<<<<< HEAD


           
=======
>>>>>>> 64550de81daa5283aac3c904c3a233796e4b3d70
          </div>
        </div>
      </nav>

      {showSearch && (
        <div ref={searchRef} className="fixed top-[64px] left-0 w-full bg-white z-40 shadow-md border-b px-8 py-3">
          <div className="relative flex items-center">
            <FaSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={onSearchKey}
              className="flex-grow px-2 py-2 text-black placeholder-gray-400 focus:outline-none"
              autoFocus
            />
            {searchTerm && (
              <button onClick={clearSearch} className="text-gray-500 hover:text-gray-700 ml-3">
                <FaTimes size={20} />
              </button>
            )}
          </div>
          {sugerencias.length > 0 && (
            <ul className="mt-2 max-h-60 overflow-y-auto border-t pt-2 space-y-2 bg-white">
              {sugerencias.slice(0, 8).map(p => (
                <li
                  key={p.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                  onClick={() => {
                    setShowSearch(false);
                    router.push(`/producto/${p.id}`);
                  }}
                >
                  {p.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div ref={cartRef} className={`fixed top-0 right-0 h-full max-w-sm w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-bold text-black">Tu carrito</h2>
          <button onClick={() => setShowCart(false)} className="text-black" aria-label="Cerrar">
            <FaTimes />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
          {carrito.length === 0 ? (
            <p className="text-black">Tu carrito está vacío.</p>
          ) : (
            carrito.map(item => (
              <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                <img src={item.producto.imagen[0]} alt={item.producto.nombre} className="w-16 h-16 object-cover rounded" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-black">{item.producto.nombre}</span>
                  <span className="text-xs text-gray-600">Talla: {item.talla} | Color: {item.color}</span>
                  <span className="text-xs text-gray-600">Cantidad: {item.cantidad}</span>
                  <span className="text-sm text-gray-800 font-bold">PEN {item.producto.precio}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
