import React from 'react'

interface WedgeCardProps {
  title: string
  description: string
  icon: string
  onClick: () => void
}

const WedgeCard: React.FC<WedgeCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <div
      className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 text-2xl">
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {description}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WedgeCard