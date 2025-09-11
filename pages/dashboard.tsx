import React, { useState } from 'react'
import Head from 'next/head'
import ProtectedRoute from '../components/ProtectedRoute'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import ContentArea from '../components/ContentArea'

const DashboardPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard - Hostelpulse</title>
        <meta name="description" content="Manage your hostel operations" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <ContentArea />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default DashboardPage