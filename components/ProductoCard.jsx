'use client'

import React from 'react'

export default function ProductoCard({ producto, onAgregar }) {
  const { id, nombre, precio, descripcion, imagen } = producto
  const imagenPrincipal = imagen?.[0]
  const imagenHover = imagen?.[1]

  return (
    <div key={id} className="text-center group relative">
      <div className="relative overflow-hidden rounded shadow">
        <img
          src={imagenPrincipal}
          alt={nombre}
          srcSet={`
            ${imagenPrincipal}?w=200 200w,
            ${imagenPrincipal}?w=400 400w,
            ${imagenPrincipal}?w=800 800w,
            ${imagenPrincipal}?w=1200 1200w
          `}
          sizes="(max-width: 699px) 74vw, (max-width: 999px) 38vw, calc((100vw - 96px) / 4 - (24px / 4 * 3))"
          width={400}
          height={600}
          className="w-full h-auto transition-opacity duration-300 group-hover:opacity-0"
          loading="lazy"
          fetchPriority="low"
        />

        {imagenHover && (
          <img
            src={imagenHover}
            alt={`${nombre} alternativa`}
            className="absolute top-0 left-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
            fetchPriority="low"
          />
        )}

        <button
          onClick={() => onAgregar({ id, nombre, precio })}
          className="absolute bottom-2 right-2 bg-white rounded-full p-2 text-black hover:bg-gray-100 shadow transition"
          aria-label="Agregar al carrito"
        >
          <svg aria-hidden="true" fill="none" width="16" height="16" viewBox="0 0 12 12">
            <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-gray-600 text-sm">{nombre}</p>
      <p className="font-semibold text-sm text-black">${precio}</p>
      <p className="font-semibold text-sm text-black">{descripcion}</p>
    </div>
  )
}
