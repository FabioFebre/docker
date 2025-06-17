'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaSearch, FaShoppingBag, FaTimes, FaTrash } from 'react-icons/fa';

type Categoria = { id: number; nombre: string; slug?: string };
type Producto = { id: number; nombre: string; imagen: string[]; precio: number };
type ProductoCarrito = { id: number; talla: string; color: string; cantidad: number; producto: Producto };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Producto[]>([]);
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('https://sg-studio-backend.onrender.com/categorias')
      .then(res => res.json())
      .then(setCategorias)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('https://sg-studio-backend.onrender.com/productos')
      .then(res => res.json())
      .then((data: Producto[]) => setAllProducts(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    setSugerencias(term.length < 3 ? [] : allProducts.filter(p => p.nombre.toLowerCase().includes(term)));
  }, [searchTerm, allProducts]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCart && cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setShowCart(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCart]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('usuario');
    if (isLoggedIn && storedUser) {
      const user = JSON.parse(storedUser);
      fetch(`https://sg-studio-backend.onrender.com/carrito/${user.id}`)
        .then(res => res.json())
        .then(data => setCarrito(data.items))
        .catch(console.error);
    } else {
      const saved = localStorage.getItem('carrito');
      if (saved) setCarrito(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
  }, [carrito]);

  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === 'carritoActualizado' && e.newValue === 'true') {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const storedUser = localStorage.getItem('usuario');
        if (isLoggedIn && storedUser) {
          const user = JSON.parse(storedUser);
          fetch(`https://sg-studio-backend.onrender.com/carrito/${user.id}`)
            .then(res => res.json())
            .then(data => setCarrito(data.items))
            .catch(console.error);
        } else {
          setCarrito([]);
          localStorage.removeItem('carrito');
        }
        localStorage.removeItem('carritoActualizado');
      }
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim().length > 2) {
      router.push(`/buscar?query=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
    }
  };

  const clearSearch = () => setSearchTerm('');

  const handleUserClick = () => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('role');
    router.push(logged ? (role === 'admin' ? '/admin/dashboard' : '/usuario/perfil') : '/login');
  };

  const calcularTotal = () =>
    carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);

  const removeItem = async (itemId: number) => {
    try {
      const res = await fetch(`https://sg-studio-backend.onrender.com/carritoIitem/${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const storedUser = localStorage.getItem('usuario');
        if (isLoggedIn && storedUser) {
          const user = JSON.parse(storedUser);
          const updated = await fetch(`https://sg-studio-backend.onrender.com/carrito/${user.id}`);
          const data = await updated.json();
          setCarrito(data.items);
        } else {
          const updatedCarrito = carrito.filter(item => item.id !== itemId);
          setCarrito(updatedCarrito);
          localStorage.setItem('carrito', JSON.stringify(updatedCarrito));
        }
      } else {
        console.error('No se pudo eliminar el item del carrito');
      }
    } catch (error) {
      console.error('Error al eliminar item del carrito:', error);
    }
  };

  const updateCantidad = (id: number, delta: number) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = isLoggedIn ? JSON.parse(localStorage.getItem('usuario')!) : null;

    setCarrito(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
      );
      if (isLoggedIn && user) {
        const updatedItem = updated.find(i => i.id === id);
        fetch(`https://sg-studio-backend.onrender.com/carrito/${user.id}/actualizar/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cantidad: updatedItem?.cantidad }),
        });
      }
      return updated;
    });
  };

  const bgClass = scrolled || hovered || showSearch
    ? 'bg-white text-black shadow-md border-b border-gray-300'
    : 'bg-transparent text-white border-b border-transparent';
  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 px-8 py-4 transition-all duration-300 ${bgClass}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-colors duration-300">
            SG STUDIO
          </Link>
          <ul className="flex gap-6 mt-3 text-sm font-medium transition-colors duration-300">
            <li className="relative group">
              <Link href="/woman" className="font-[Beige] underline-hover">WOMAN</Link>
              <div className="absolute left-0 top-full mt-2 w-64 bg-white shadow-lg p-4 border text-sm z-10
                opacity-0 pointer-events-none transition-opacity duration-300 ease-out
                group-hover:opacity-100 group-hover:pointer-events-auto">
                <ul className="font-[Beige] space-y-5 text-black">
                  {categorias.map((c, i) => (
                    <li key={c.id} className={`transition duration-300 ease-out transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100`}
                        style={{ transitionDelay: `${i * 50}ms` }}>
                      <Link href={`/woman?categoria=${encodeURIComponent(c.nombre)}`}
                            className="block hover:text-gray-700 transition-colors">
                        {c.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
          <div className="flex gap-4 text-xl transition-colors duration-300">
            <button onClick={handleUserClick} aria-label="Perfil" className="hover:text-gray-400">
              <FaUser />
            </button>
            <button ref={buttonRef} onClick={() => setShowSearch(v => !v)} aria-label="Buscar" className="hover:text-gray-400">
              <FaSearch />
            </button>
            <button onClick={() => setShowCart(true)} aria-label="Carrito" className="hover:text-gray-400 relative w-6 h-6">
              <FaShoppingBag />
              {carrito.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gray-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {carrito.reduce((t, i) => t + i.cantidad, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {showSearch && (
        <div ref={searchRef} className="fixed top-[64px] left-0 w-full bg-white z-40 shadow-md border-b px-8 py-3">
          <div className="relative">
            <FaSearch className="text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={onSearchKey}
              className="w-full pl-10 pr-10 py-2 text-black placeholder-gray-400 border rounded"
              autoFocus
            />
            {searchTerm && (
              <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2">
                <FaTimes />
              </button>
            )}
          </div>
          {sugerencias.length > 0 && (
            <ul className="mt-2 max-h-60 overflow-y-auto border rounded shadow bg-white">
              {sugerencias.slice(0, 8).map(p => (
                <li key={p.id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                    onClick={() => {
                      setShowSearch(false);
                      router.push(`/producto/${p.id}`);
                    }}>
                  {p.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div ref={cartRef} className={`fixed top-0 right-0 h-full max-w-sm w-full bg-white shadow-lg z-[9999] transform transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className=" font-[Beige] text-lg font-bold text-black">Tu carrito</h2>
          <button onClick={() => setShowCart(false)} aria-label="Cerrar">
            <FaTimes />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
          {carrito.length === 0 ? (
            <p className="font-[Montserrat] text-black">Tu carrito está vacío.</p>
          ) : (
            carrito.map(item => (
              <div key={item.id} className="flex gap-4 items-center border-b pb-4 text-black">
                <img src={item.producto.imagen[0]} alt={item.producto.nombre} className="w-16 h-16 object-cover rounded" />
                <div className="flex flex-col flex-grow">
                  <span className="font-semibold">{item.producto.nombre}</span>
                  <span className="text-xs text-gray-600">Talla: {item.talla} | Color: {item.color}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateCantidad(item.id, -1)} className="px-2 py-1 text-sm border rounded">-</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => updateCantidad(item.id, 1)} className="px-2 py-1 text-sm border rounded">+</button>
                  </div>
                  <span className="font-bold text-black">PEN {item.producto.precio}</span>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-black-600 hover:text-gray-800 transition-colors">
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>
        {carrito.length > 0 && (
          <div className="p-6 border-t">
            <div className="flex font-semibold mb-2 text-black">
              <span>Total:</span><span className='ml-2'>PEN {calcularTotal().toFixed(2)}</span>
            </div>
            <button onClick={() => { setShowCart(false); router.push('/checkout'); }}
              className="btn-animated w-full rounded">
              Ir al pago
            </button>
          </div>
        )}
      </div>
    </>
  );
}
