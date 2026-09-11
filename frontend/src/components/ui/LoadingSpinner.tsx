import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const spinnerVariants = cva('animate-spin text-brand-500', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  loading?: boolean
  label?: string
  className?: string
}

export default function LoadingSpinner({ loading = true, size, label, className }: LoadingSpinnerProps) {
  if (!loading) return null
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={spinnerVariants({ size, className })} />
      {label && <p className="text-sm text-surface-500">{label}</p>}
    </div>
  )
}

export { spinnerVariants }
