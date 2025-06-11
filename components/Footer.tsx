import Link from 'next/link'

export default function Footer() {
  return (
<footer className="bg-white border-t border-gray-200 py-10 px-6 md:px-16">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-sm text-gray-600">
    
    {/* Logo y título */}
    <div>
      <img src="/images/logo.png" alt="CIAO BELLA" className="w-20 mb-2" />
      <p className="font-semibold text-black">SG STUDIO</p>
    </div>

    {/* Conócenos */}
    <div>
      <p className="font-semibold text-black mb-2">Conócenos</p>
      <ul className="space-y-1">
        <li><Link href="/components/nosotros" className="hover:underline">Nosotros</Link></li>
      </ul>
    </div>

    {/* Atención al cliente */}
    <div>
      <p className="font-semibold text-black mb-2">Atención al cliente</p>
      <ul className="space-y-1">
        <li>
          <Link href="/preguntas" className="hover:underline">
            Preguntas frecuentes
          </Link>
        </li>
      </ul>
    </div>

    {/* Redes sociales y páginas de interés */}
    <div>
      <p className="text-black font-medium mb-2">Linkear nuestras<br />redes sociales para<br />que nos sigan.</p>
      <p className="text-xs uppercase font-semibold text-gray-500 mt-4 mb-2">Páginas de interés</p>
      <ul className="space-y-1">
        <a href="https://www.instagram.com/sgstudio.pe" className="link-faded hover:underline" target="_blank" rel="noopener noreferrer">
          Instagram: @sgstudio.pe
        </a>
        <li>Términos y condiciones</li>
        <li>Políticas de cambios</li>
        <li>
          <img src="/images/libro-reclamaciones.png" alt="Libro de Reclamaciones" className="w-32 mt-2" />
        </li>
      </ul>
    </div>

  </div>
</footer>

  );
}
