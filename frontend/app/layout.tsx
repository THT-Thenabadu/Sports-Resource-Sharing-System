import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AuthRefresh from "@/app/components/AuthRefresh";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sportek",
  description: "Sports Resource Sharing Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Add this */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
         <AuthRefresh />
        <Navbar />
        <main className="flex-1">{children}</main>
        
        {/* Floating Support/Chatbot Icon */}
        <Link 
          href="/hub/tickets/new" 
          className="fixed bottom-6 right-6 bg-[#64FFDA] text-[#112240] p-4 rounded-full shadow-2xl hover:bg-white hover:scale-110 transition-all z-50 flex items-center justify-center cursor-pointer group"
          title="Support Chat & Tickets"
        >
          <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">support_agent</span>
        </Link>

        <Footer />
      </body>
    </html>
  );
}
