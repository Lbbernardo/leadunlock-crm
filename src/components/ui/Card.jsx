import clsx from 'clsx'

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx('bg-white rounded-2xl border border-slate-200 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}
