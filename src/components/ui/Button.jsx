import clsx from 'clsx'

const variants = {
  primary: 'bg-green-500 hover:bg-green-400 text-white shadow-sm',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
  outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700',
  danger: 'bg-red-500 hover:bg-red-400 text-white',
  ghost: 'hover:bg-slate-100 text-slate-600',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading,
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {children}
    </button>
  )
}
