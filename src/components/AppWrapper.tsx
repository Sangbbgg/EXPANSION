"use client";

import React, { useState } from 'react';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white shadow-lg flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64 p-4' : 'w-0'}`}>
        <div className={isSidebarOpen ? 'block' : 'hidden'}>
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header with sidebar toggle */}
        <header className="bg-white shadow-md p-4">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
