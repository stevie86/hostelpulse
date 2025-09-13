import React from 'react'

interface AuthButtonProps {
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  fullWidth?: boolean
}

const AuthButton: React.FC<AuthButtonProps> = ({
  type = 'button',
  children,
  loading = false,
  disabled = false,
  onClick,
  fullWidth = true,
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export default AuthButton