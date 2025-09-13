import Link from 'next/link'

type NavLink = { href: string; label: string }

export default function PageNav({ prev, next }: { prev?: NavLink; next?: NavLink }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-2">
      <div>
        {prev ? (
          <Link href={prev.href}>
            <a className="inline-flex items-center px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200">
              <span className="mr-2">←</span>
              {prev.label}
            </a>
          </Link>
        ) : (
          <span />
        )}
      </div>
      <div>
        {next ? (
          <Link href={next.href}>
            <a className="inline-flex items-center px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">
              {next.label}
              <span className="ml-2">→</span>
            </a>
          </Link>
        ) : null}
      </div>
    </div>
  )
}
