'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bed,
  CalendarDays,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  collapsed: boolean;
}

const SidebarItem = ({
  icon,
  label,
  href,
  active,
  collapsed,
}: SidebarItemProps) => {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer group ${
          active
            ? 'bg-primary text-primary-content shadow-lg'
            : 'hover:bg-base-200 text-base-content/70 hover:text-base-content'
        }`}
      >
        <div className="flex-shrink-0">{icon}</div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="absolute left-14 scale-0 group-hover:scale-100 transition-transform bg-neutral text-neutral-content px-2 py-1 rounded text-xs z-50 whitespace-nowrap ml-2">
            {label}
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Dynamic extraction of propertyId from /properties/[id]/...
  const propertyMatch = pathname.match(/\/properties\/([^/]+)/);
  const pid = propertyMatch ? propertyMatch[1] : 'default';

  const menuItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      href: `/properties/${pid}/dashboard`,
    },
    {
      icon: <Bed size={20} />,
      label: 'Rooms',
      href: `/properties/${pid}/rooms`,
    },
    {
      icon: <CalendarDays size={20} />,
      label: 'Bookings',
      href: `/properties/${pid}/bookings`,
    },
    {
      icon: <Users size={20} />,
      label: 'Guests',
      href: `/properties/${pid}/guests`,
    },
    {
      icon: <Settings size={20} />,
      label: 'Data Hub',
      href: `/properties/${pid}/data`,
    },
  ];

  return (
    <>
      {/* Mobile Toggle - Only visible on small screens */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <motion.aside
        animate={{ 
          width: collapsed ? (typeof window !== 'undefined' && window.innerWidth < 1024 ? 0 : 80) : 260,
          x: collapsed && typeof window !== 'undefined' && window.innerWidth < 1024 ? -260 : 0
        }}
        className="fixed lg:relative flex flex-col h-screen bg-white/80 backdrop-blur-md border-r border-gray-200 transition-all duration-300 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      >
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
          <span className="text-primary-content font-bold text-xl">H</span>
        </div>
        {!collapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold tracking-tight text-gray-900"
          >
            Hostel<span className="text-primary">Pulse</span>
          </motion.h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 py-4 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 space-y-1.5">
        <SidebarItem
          icon={<Settings size={20} />}
          label="Settings"
          href="/settings"
          active={pathname === '/settings'}
          collapsed={collapsed}
        />
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors group">
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md hover:bg-gray-50 z-40 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} className="text-gray-400" /> : <ChevronLeft size={14} className="text-gray-400" />}
      </button>
    </motion.aside>
    </>
  );
}
