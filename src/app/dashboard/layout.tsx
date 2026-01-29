import React, { Suspense } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense>
      <div className="flex h-screen bg-gray-100"> {/* Main container */}
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
          {/* Add sidebar navigation items here later */}
          <nav>
            <ul>
              <li className="mb-2"><a href="#" className="block hover:text-gray-300">Home</a></li>
              <li className="mb-2"><a href="#" className="block hover:text-gray-300">Projects</a></li>
              <li className="mb-2"><a href="#" className="block hover:text-gray-300">Settings</a></li>
            </ul>
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </Suspense>
  );
}
