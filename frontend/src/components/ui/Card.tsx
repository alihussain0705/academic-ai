import type { ReactNode, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'bg-surface-0 rounded-xl border border-surface-200 transition-shadow',
  {
    variants: {
      variant: {
        default: 'shadow-xs',
        elevated: 'shadow-md hover:shadow-lg',
        flat: 'shadow-none',
        interactive: 'shadow-xs hover:shadow-md cursor-pointer',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

interface CardProps extends VariantProps<typeof cardVariants>, HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Card({ variant, padding, children, className, ...props }: CardProps) {
  return (
    <div className={cardVariants({ variant, padding, className })} {...props}>
      {children}
    </div>
  )
}

export { cardVariants }
