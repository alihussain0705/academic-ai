import type { ReactNode, HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Card({ children, className, ...props }: Props) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className || ''}`} {...props}>
      {children}
    </div>
  )
}