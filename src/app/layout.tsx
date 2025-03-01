// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Blog Generator",
  description: "Generate AI-powered blog posts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          antialiased
          bg-gray-100
          text-gray-800
          flex flex-col min-h-screen
          ${geistSans.variable}
          ${geistMono.variable}
        `}
      >
        <ErrorBoundary>
          <main className="flex-grow">
            {children}
          </main>
        </ErrorBoundary>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
