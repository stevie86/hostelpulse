import React from 'react';
import Sidebar from '@/components/ui/sidebar';
import PageTransition from '@/components/ui/page-transition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-base-200 overflow-hidden font-geist">
      {/* Sidebar - Property ID will be handled inside via pathname extraction if needed */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navbar Placeholder */}
        <header className="h-16 border-b border-base-300 bg-base-100 flex items-center px-8 z-20">
          <div className="flex-1">
            {/* Search or Breadcrumbs would go here */}
          </div>
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-8">
                <span>AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
