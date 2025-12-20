import React from 'react';
import Sidebar from '@/components/ui/sidebar';
import PageTransition from '@/components/ui/page-transition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-geist">
      {/* Sidebar - Property ID will be handled inside via pathname extraction if needed */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 bg-white/50 backdrop-blur-md flex items-center px-8 z-20">
          <div className="flex-1">
            {/* Search or Breadcrumbs would go here */}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-gray-900">Admin User</span>
              <span className="text-[10px] text-gray-500">HostelPulse Lisbon</span>
            </div>
            <div className="avatar placeholder">
              <div className="bg-primary/10 text-primary rounded-xl w-9 shadow-sm flex items-center justify-center font-bold text-sm">
                <span>AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
