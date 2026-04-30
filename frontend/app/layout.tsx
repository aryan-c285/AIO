import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIO Toolkit — All-in-One File & Utility Tools",
  description:
    "Free online tools to compress, merge, split, and convert PDFs, images, and documents. Plus QR code generator, password generator, and unit converter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="bg-mesh flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} AIO Toolkit — Built with Next.js &
          FastAPI
        </footer>
      </body>
    </html>
  );
}
