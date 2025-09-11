import React from 'react'
import Head from 'next/head'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  heading: string
  subheading: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
  heading,
  subheading,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              {heading}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {subheading}
            </p>
          </div>

          {children}
        </div>
      </div>
    </>
  )
}

export default AuthLayout