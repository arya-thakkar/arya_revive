import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export function Button({ children, variant = 'primary', size = 'md', loading, className, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600 shadow-primary-500/20',
    secondary: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200',
    outline: 'border-2 border-primary-100 dark:border-primary-900/50 text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
    ghost: 'shadow-none hover:shadow-none text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20',
  }
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
    xl: 'px-8 py-4 text-xl',
  }
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  )
}

export const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none dark:text-white transition-all shadow-sm',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ label, error, className, ...props }, ref) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none resize-none dark:text-white transition-all shadow-sm',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  )
})

export function Card({ children, className, hover, ...props }) {
  return (
    <div className={cn(
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-card dark:shadow-none transition-all duration-300',
      hover && 'hover:shadow-lg dark:hover:border-slate-700 hover:-translate-y-1',
      className
    )} {...props}>
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'primary', className }) {
  const variants = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-100 dark:border-primary-800',
    accent: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50',
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50',
  }
  return <span className={cn('px-3 py-1 rounded-full text-[13px] font-bold uppercase tracking-wider', variants[variant], className)}>{children}</span>
}

export function Spinner({ size = 24, className }) {
  return <Loader2 size={size} className={cn('animate-spin text-primary-600 dark:text-primary-400', className)} />
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
      <div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, icon: Icon, color = 'primary' }) {
  const colors = {
    primary: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    slate: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
  }
  const colorClass = colors[color] || colors.primary

  return (
    <Card className="p-6 md:p-8 relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-white/0 to-slate-50/50 dark:to-slate-800/20 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-3">{value}</p>
          {sub && <p className="text-sm font-medium text-slate-500 mt-2">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110', colorClass)}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
        )}
      </div>
    </Card>
  )
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-lg font-medium text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      {description && <p className="text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-4 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          'w-14 h-8 rounded-full transition-colors duration-300 relative shadow-inner',
          checked ? 'bg-primary-600 dark:bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
        )}
      >
        <div className={cn(
          'absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300',
          checked && 'translate-x-6'
        )} />
      </div>
      {label && <span className="text-base font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>}
    </label>
  )
}

export function Slider({ value, onChange, min = 0, max = 10, step = 1, label, showValue = true }) {
  const percentage = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-5">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-base font-bold text-slate-900 dark:text-white mb-0">{label}</label>
          {showValue && (
            <span className="text-2xl font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-xl">
              {value}
            </span>
          )}
        </div>
      )}
      <div className="relative h-4 w-full">
        <div className="absolute inset-y-1 left-0 right-0 bg-slate-100 dark:bg-slate-800 rounded-full shadow-inner"></div>
        <div 
          className="absolute inset-y-1 left-0 bg-primary-500 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div 
          className="absolute top-1/2 -ml-3.5 -mt-3.5 w-7 h-7 bg-white border-[3px] border-primary-600 rounded-full shadow-md pointer-events-none transition-transform"
          style={{ left: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs uppercase font-bold text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export function ProgressBar({ value, max = 100, className }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className={cn('h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-primary-500 to-indigo-400 rounded-full"
      />
    </div>
  )
}
