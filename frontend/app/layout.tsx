// app/layout.tsx
import { ReactNode } from 'react';
import './globals.css';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header/>
        <Navbar/>
        <main className="flex-grow">
          {children}
        </main>
        <Footer/>
      </body>
    </html>
  );
}