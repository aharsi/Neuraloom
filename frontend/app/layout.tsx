import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import { SupabaseProvider } from "./contexts/SupabaseProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuraLoom - Discover, Analyze, Reconstruct Web Content",
  description:
    "NeuraLoom helps you scan, embed, and reconstruct web content intelligently with AI-powered insights.",
  keywords:
    "NeuraLoom, web content, AI, embeddings, reconstruction, scan, decay, SEO, research",
  authors: [{ name: "Aharsi Dey", url: "https://neuraloom.vercel.app" }],
  creator: "NeuraLoom Team",
  publisher: "NeuraLoom",
  openGraph: {
    type: "website",
    title: "NeuraLoom - Discover & Reconstruct Web Content",
    description:
      "Scan and reconstruct web pages using AI-powered embeddings and insights.",
    url: "https://neuraloom.vercel.app",
    siteName: "NeuraLoom",
    images: [
      {
        url: "https://neuraloom.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "NeuraLoom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuraLoom - Discover & Reconstruct Web Content",
    description:
      "Scan and reconstruct web pages using AI-powered embeddings and insights.",
    site: "@NeuraLoom",
    creator: "@NeuraLoom",
    images: ["https://neuraloom.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  metadataBase: new URL("https://neuraloom.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>{/* Additional head tags can go here if needed */}</head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          <Navbar />
          <br />
          <main className="mt-4 bg-linear-to-br from-blue-50 via-white to-gray-100">
            {children}
          </main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
