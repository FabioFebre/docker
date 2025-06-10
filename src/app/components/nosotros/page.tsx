'use client'

import React from 'react';

const Nosotros = () => {
  return (
    <section className="bg-white min-h-screen pt-32 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Galería de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <img
            src="/images/sg1.jpg"
            alt="Foto de la tienda"
            className="w-full h-80 object-cover rounded-lg shadow-md"
          />

          <img
            src="/images/sg2.jpg" 
            alt="Foto de la tienda 2"
            className="w-full h-80 object-cover rounded-lg shadow-md"
          />
        </div>

        {/* Título y descripción */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Visítanos en Nuestra Tienda</h1>
          <p className="mt-4 text-lg text-gray-600">
            Estamos ubicados en una zona estratégica para brindarte la mejor atención.
            Conoce nuestras instalaciones y vive la experiencia completa.
          </p>
        </div>

        {/* Información + Mapa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Información de dirección */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">¿Dónde estamos?</h2>
            <p className="text-gray-700 mb-2">
              Nuestra tienda principal está ubicada en el corazón de la ciudad, con fácil acceso desde
              avenidas principales y transporte público.
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Dirección:</strong> Jr. Pizarro 818, Int. 117 - Centro Comercial Plaza Pizarro
            </p>
            <p className="text-gray-700">
              <strong>Horario:</strong> Lunes a Sábado de 10:30 am - 8:30 pm
            </p>
          </div>

          {/* Mapa */}
          <div className="w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.832214874465!2d-79.0252573!3d-8.1082803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91ad3dac7097f493%3A0x5f15557368ecd96c!2sGaler%C3%ADa%20Plaza%20Pizarro!5e0!3m2!1ses!2spe!4v1717931300000!5m2!1ses!2spe" 
              width="100%"
              height="450"
              loading="lazy"
              style={{ border: 0 }}
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación SG Studio"
              className="rounded shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;
