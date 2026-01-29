import React, { Suspense } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense>
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </Suspense>
  );
}
