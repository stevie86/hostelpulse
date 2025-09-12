import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/auth.context'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/owner/dashboard', icon: '🏠' },
    { name: 'Bookings', href: '/owner/bookings', icon: '📅' },
    { name: 'Guests', href: '/owner/guests', icon: '👥' },
  ]
  const { logout } = useAuth()

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Hostelpulse</span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      onClick={handleLinkClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3 text-lg" aria-hidden="true">{item.icon}</span>
                      {item.name}
                    </a>
                  </Link>
                )
              })}
            </nav>
            <div className="px-2 py-4 border-t border-gray-200">
              <button
                onClick={() => { logout(); router.replace('/auth/login') }}
                className="w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
