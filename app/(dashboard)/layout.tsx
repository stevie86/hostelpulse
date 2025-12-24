import React from 'react';
import Sidebar from '@/components/ui/sidebar';
import PageTransition from '@/components/ui/page-transition';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-base-100 overflow-hidden font-geist">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-base-200/50">
        {/* Top Header */}
        <header className="h-16 border-b border-base-300/50 bg-base-100 flex items-center px-8 z-20 shadow-sm">
          <div className="flex-1">
            {/* Search or Breadcrumbs would go here */}
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-base-content">
                Admin User
              </span>
              <span className="text-[10px] text-base-content/80">
                HostelPulse Lisbon
              </span>
            </div>
            <div className="avatar placeholder">
              <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-xl w-9 shadow-md flex items-center justify-center font-bold text-sm">
                <span>AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
