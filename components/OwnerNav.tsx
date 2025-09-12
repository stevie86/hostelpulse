import Link from 'next/link'

export default function OwnerNav() {
  return (
    <nav className="mb-4 flex items-center gap-3 text-sm">
      <Link href="/owner/dashboard">
        <a className="text-blue-600 hover:text-blue-700 underline">Dashboard</a>
      </Link>
      <span className="text-gray-300">|</span>
      <Link href="/owner/bookings">
        <a className="text-blue-600 hover:text-blue-700 underline">Bookings</a>
      </Link>
      <span className="text-gray-300">|</span>
      <Link href="/owner/guests">
        <a className="text-blue-600 hover:text-blue-700 underline">Guests</a>
      </Link>
    </nav>
  )
}

