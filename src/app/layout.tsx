'use client';

import './globals.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbarFooter = pathname.startsWith('/admin');

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        {!hideNavbarFooter && <Navbar />}
        <main className="flex-grow">{children}</main>
        {!hideNavbarFooter && <Footer />}
      </body>
    </html>
  );
}
