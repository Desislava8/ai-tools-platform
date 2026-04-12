import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Tools Platform",
  description: "Платформа за AI инструменти",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}