'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isHub = pathname?.startsWith('/hub');

  return (
    <>
      {!isHub && <Navbar />}
      {children}
      {!isHub && <Footer />}
    </>
  );
}
