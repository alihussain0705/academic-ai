import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center font-medium rounded-full transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-100 text-surface-600 border border-surface-200',
        brand: 'bg-brand-50 text-brand-700 border border-brand-200',
        success: 'bg-success-50 text-success-600 border border-success-500/20',
        warning: 'bg-warning-50 text-warning-500 border border-warning-500/20',
        danger: 'bg-danger-50 text-danger-600 border border-danger-500/20',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
)

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode
  className?: string
}

export default function Badge({ variant, size, children, className }: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, size, className })}>
      {children}
    </span>
  )
}

export { badgeVariants }
