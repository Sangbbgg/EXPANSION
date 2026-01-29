import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EXPANSION Dashboard",
  description: "AI Manager Master Design Document",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-800 text-white p-4 shadow-lg flex flex-col">
            <h1 className="text-2xl font-bold mb-6">EXPANSION</h1>
            <nav>
              <ul>
                <li className="mb-2">
                  <a href="/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</a>
                </li>
                <li className="mb-2">
                  <a href="/projects" className="block py-2 px-4 rounded hover:bg-gray-700">Projects</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700">Settings</a>
                </li>
              </ul>
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-700">
              <p className="text-sm">Logged in as Admin</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}