'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaSearch, FaShoppingBag, FaTimes } from 'react-icons/fa';

type Categoria = {
  id: number;
  nombre: string;
  slug?: string;
};

type ProductoCarrito = {
  id: number;
  talla: string;
  color: string;
  cantidad: number;
  producto: {
    nombre: string;
    imagen: string[];
    precio: number;
  };
};

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('https://sg-studio-backend.onrender.com/categorias');
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar las categorías:', error);
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchCarrito = async () => {
      const storedUser = localStorage.getItem('usuario');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      if (isLoggedIn && storedUser) {
        const user = JSON.parse(storedUser);
        try {
          const response = await fetch(`https://sg-studio-backend.onrender.com/carrito/${user.id}`);
          if (!response.ok) throw new Error('No se pudo obtener el carrito');
          const data = await response.json();
          setCarrito(data.items);
        } catch (error) {
          console.error('Error al obtener carrito del backend:', error);
        }
      } else {
        const savedCart = localStorage.getItem('carrito');
        if (savedCart) {
          setCarrito(JSON.parse(savedCart));
        }
      }
    };

    fetchCarrito();
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
  }, [carrito]);

  useEffect(() => {
    const handleClickOutsideSearch = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false);
      }
    };
    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutsideSearch);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutsideCart = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCart(false);
      }
    };
    if (showCart) {
      document.addEventListener('mousedown', handleClickOutsideCart);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideCart);
  }, [showCart]);

  const clearSearch = () => setSearchTerm('');

  const handleUserClick = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    if (isLoggedIn === 'true') {
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/usuario/perfil');
      }
    } else {
      router.push('/login');
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

  const eliminarProducto = async (itemId: number) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const storedUser = localStorage.getItem('usuario');

  const nuevoCarrito = carrito.filter((item) => item.id !== itemId);

  if (isLoggedIn && storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const response = await fetch(
        `https://sg-studio-backend.onrender.com/carritoIitem/${itemId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        console.error('Error al eliminar del backend:', await response.text());
      }
    } catch (error) {
      console.error('Error al eliminar el producto del backend:', error);
    }
  }

  localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
  setCarrito(nuevoCarrito);

  if (window.location.pathname === '/usuario/perfil') {
    window.location.reload();
  }
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
                    categorias.map((cat) => (
                      <li key={cat.id}>
                        <Link href={`/woman?categoria=${encodeURIComponent(cat.nombre)}`}>
                          {cat.nombre}
                        </Link>
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
            <button onClick={handleUserClick} aria-label="Perfil" className="hover:text-gray-400">
              <FaUser />
            </button>
            <button ref={buttonRef} onClick={() => setShowSearch(!showSearch)} aria-label="Buscar" className="hover:text-gray-400">
              <FaSearch />
            </button>
            <button onClick={() => setShowCart(true)} aria-label="Carrito" className="hover:text-gray-400 relative w-6 h-6">
              <FaShoppingBag />
              {Array.isArray(carrito) && carrito.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {carrito.reduce((total, item) => total + item.cantidad, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {showSearch && (
        <div
          ref={searchRef}
          className="fixed top-[64px] left-0 w-full bg-white z-40 shadow-md border-b px-8 py-3 flex items-center max-w-full"
        >
          <FaSearch className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (searchTerm.trim() !== '') {
                  router.push(`/buscar?query=${encodeURIComponent(searchTerm.trim())}`);
                  setShowSearch(false); // opcional: cierra la barra
                  setSearchTerm('');    // opcional: limpia el campo
                }
              }
            }}
            className="flex-grow px-2 py-2 text-black placeholder-gray-400 focus:outline-none"
            autoFocus
          />
          {searchTerm && (
            <button onClick={clearSearch} aria-label="Limpiar búsqueda" className="text-gray-500 hover:text-gray-700 ml-3">
              <FaTimes size={20} />
            </button>
          )}
        </div>
      )}

      <div
        ref={cartRef}
        className={`fixed top-0 right-0 h-full max-w-sm w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-bold text-black">Tu carrito</h2>
          <button onClick={() => setShowCart(false)} aria-label="Cerrar">
            <FaTimes className="text-black" />
          </button>
        </div>

<div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-150px)]">
  {Array.isArray(carrito) && carrito.length === 0 ? (
    <p className="text-black">Tu carrito está vacío.</p>
  ) : (
    carrito.map((item) => (
      <div key={item.id} className="flex gap-4 items-center border-b pb-4 relative">
        <img
          src={item.producto.imagen[0]}
          alt={item.producto.nombre}
          className="w-16 h-16 object-cover rounded"
        />
        <div className="flex flex-col flex-1">
          <span className="text-sm font-semibold text-black">{item.producto.nombre}</span>
          <span className="text-xs text-gray-600">Talla: {item.talla} | Color: {item.color}</span>

          <div className="flex items-center mt-2">
            <button
              onClick={() => disminuirCantidad(item.id)}
              disabled={item.cantidad <= 1}
              className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
            >
              <svg fill="none" width="14" height="14" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" className='text-black'>
                <path d="M0 6h12" />
              </svg>
            </button>
            <span className="mx-3 text-sm text-black">{item.cantidad}</span>
            <button
              onClick={() => aumentarCantidad(item.id)}
              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              <svg fill="none" width="14" height="14" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5" className='text-black'>
                <path d="M6 0v12M0 6h12" />
              </svg>
            </button>
          </div>

          <span className="mt-1 text-sm text-gray-800 font-bold">PEN {item.producto.precio}</span>
        </div>

        <button
          onClick={() => eliminarProducto(item.id)}
          className="absolute top-0 right-0 text-gray-400 hover:text-red-600 p-1"
          aria-label="Eliminar producto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M3 6h18" />
            <path d="M8 6v14c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M5 6l1-2h12l1 2" />
          </svg>
        </button>
      </div>
    ))
  )}
</div>
{carrito.length > 0 && (
  <div className="p-6 border-t bg-white shadow-md sticky bottom-0">
    <div className="flex justify-between text-sm font-semibold text-black mb-4">
      <span>Total:</span>
      <span>
        PEN{' '}
        {carrito.reduce(
          (acc, item) => acc + item.cantidad * item.producto.precio,
          0
        ).toFixed(2)}
      </span>
    </div>
    <button
      onClick={() => {
        router.push('/checkout');
        setShowCart(false);
      }}
      className="w-full py-2 text-white bg-pink-600 hover:bg-pink-700 rounded text-sm font-semibold transition"
    >
      Ir al Checkout
    </button>
  </div>
)}

      </div>
    </>
  );
}
