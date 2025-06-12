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
  const searchRef = useRef(null);
  const buttonRef = useRef(null);
  const cartRef = useRef(null);
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
            <button onClick={handleUserClick} aria-label="Perfil" className="hover:text-pink-500">
              <FaUser />
            </button>
            <button ref={buttonRef} onClick={() => setShowSearch(!showSearch)} aria-label="Buscar" className="hover:text-pink-500">
              <FaSearch />
            </button>
            <button onClick={() => setShowCart(true)} aria-label="Carrito" className="hover:text-pink-500 relative">
              <FaShoppingBag />
              {Array.isArray(carrito) && carrito.length > 0 && (
                <span className="absolute top-0 right-0 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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

        <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
          {carrito.length === 0 ? (
            <p className="text-black">Tu carrito está vacío.</p>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                <img
                  src={item.producto.imagen[0]}
                  alt={item.producto.nombre}
                  className="w-16 h-16 object-cover rounded"
                />
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
