'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FaUser, FaSearch, FaShoppingBag, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const [showCart, setShowCart] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutsideCart = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCart(false);
      }
    };
    if (showCart) {
      document.addEventListener('mousedown', handleClickOutsideCart);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideCart);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideCart);
  }, [showCart]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-4 bg-white text-black shadow-md">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            SG STUDIO
          </Link>

          <ul className="flex gap-6 text-sm font-medium">
            <li className="relative group">
              <Link href="/woman" className="underline-hover">WOMAN</Link>
              <div
                className="absolute left-0 top-full mt-0 w-64 bg-white shadow-lg p-4 border text-sm z-30 hidden group-hover:block
                           before:content-[''] before:absolute before:top-0 before:left-0 before:h-[3px] before:bg-pink-500
                           before:w-0 before:origin-left before:transition-all before:duration-500 before:ease-in-out
                           group-hover:before:w-full"
              >
                <ul className="space-y-1 text-black">
                  <li><Link href="/ropa/tops" className="block hover:text-pink-500">Tops</Link></li>
                  <li><Link href="/ropa/polos" className="block hover:text-pink-500">Polos</Link></li>
                  <li><Link href="/ropa/blusas" className="block hover:text-pink-500">Blusas</Link></li>
                  <li><Link href="/ropa/bodies" className="block hover:text-pink-500">Bodies</Link></li>
                  <li><Link href="/ropa/vestidos" className="block hover:text-pink-500">Vestidos</Link></li>
                  <li><Link href="/ropa/abrigos" className="block hover:text-pink-500">Abrigos, blazers</Link></li>
                  <li><Link href="/ropa/pantalones" className="block hover:text-pink-500">Pantalones</Link></li>
                  <li><Link href="/ropa/denim" className="block hover:text-pink-500">Denim</Link></li>
                  <li><Link href="/ropa/faldas" className="block hover:text-pink-500">Faldas</Link></li>
                  <li><Link href="/ropa/shorts" className="block hover:text-pink-500">Short</Link></li>
                </ul>
              </div>
            </li>
            <li><Link href="/new" className="underline-hover">NEW ARRIVALS</Link></li>
            <li><Link href="/top" className="underline-hover">TOP SELLERS</Link></li>
            <li><Link href="/basics" className="underline-hover">BASICS</Link></li>
            <li><Link href="/last" className="underline-hover">LAST UNITS</Link></li>
            <li><Link href="/todo" className="underline-hover">VER TODO</Link></li>
          </ul>

          <div className="flex gap-4 text-xl">
            <Link href="/registro"><FaUser className="hover:text-pink-500" /></Link>
            <Link href="/buscar"><FaSearch className="hover:text-pink-500" /></Link>
            <button
              onClick={() => setShowCart(true)}
              aria-label="Carrito"
              className="hover:text-pink-500 focus:outline-none"
              type="button"
            >
              <FaShoppingBag />
            </button>
          </div>
        </div>
      </nav>

      {/* Carrito */}
      <div
        ref={cartRef}
        className={`fixed top-0 right-0 h-full max-w-sm w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          showCart ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-bold text-black">Tu carrito</h2>
          <button onClick={() => setShowCart(false)} aria-label="Cerrar">
            <FaTimes className="text-black" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-black">Tu carrito está vacío.</p>
        </div>
      </div>
    </>
  );
}
