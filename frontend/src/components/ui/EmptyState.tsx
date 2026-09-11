import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className || ''}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100 text-surface-400 mb-4">
        {icon || <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold text-surface-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}
