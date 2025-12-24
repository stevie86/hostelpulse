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
  Database,
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
        whileHover={{ x: 4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${
          active
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25'
            : 'hover:bg-base-200/80 text-base-content/85 hover:text-base-content'
        }`}
      >
        <div className={`flex-shrink-0 ${active ? 'text-white' : ''}`}>
          {icon}
        </div>
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
          <div className="absolute left-16 scale-0 group-hover:scale-100 transition-transform origin-left bg-neutral text-neutral-content px-3 py-1.5 rounded-lg text-sm font-medium z-50 whitespace-nowrap shadow-xl">
            {label}
          </div>
        )}
        {active && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary -z-10"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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
      icon: <Database size={20} />,
      label: 'Data Hub',
      href: `/properties/${pid}/data`,
    },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
          className="p-2.5 bg-base-100 border border-base-300 rounded-xl shadow-lg text-base-content hover:bg-base-200"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </motion.button>
      </div>

      <motion.aside
        animate={{
          width: collapsed
            ? typeof window !== 'undefined' && window.innerWidth < 1024
              ? 0
              : 80
            : 280,
          x:
            collapsed &&
            typeof window !== 'undefined' &&
            window.innerWidth < 1024
              ? -280
              : 0,
        }}
        className="fixed lg:relative flex flex-col h-screen bg-base-100 border-r border-base-200 transition-all duration-300 z-30"
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-xl shadow-primary/30"
          >
            <span className="text-white font-bold text-xl">H</span>
          </motion.div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-xl font-bold tracking-tight text-base-content">
                Hostel
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Pulse
                </span>
              </h1>
              <span className="text-xs text-base-content/70">
                Property Management
              </span>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto overflow-x-hidden">
          <div className="mb-2 px-3">
            {!collapsed && (
              <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                Menu
              </span>
            )}
          </div>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              active={
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))
              }
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-base-200 space-y-1">
          <SidebarItem
            icon={<Settings size={20} />}
            label="Settings"
            href="/settings"
            active={pathname === '/settings'}
            collapsed={collapsed}
          />
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-error/80 hover:bg-error/10 hover:text-error transition-all group"
          >
            <LogOut size={20} />
            {!collapsed && <span className="font-medium">Logout</span>}
          </motion.button>
        </div>

        {/* Collapse Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-base-100 border border-base-300 flex items-center justify-center shadow-lg hover:shadow-xl z-40 transition-all hover:border-primary"
        >
          {collapsed ? (
            <ChevronRight size={14} className="text-base-content/85" />
          ) : (
            <ChevronLeft size={14} className="text-base-content/85" />
          )}
        </motion.button>
      </motion.aside>
    </>
  );
}
