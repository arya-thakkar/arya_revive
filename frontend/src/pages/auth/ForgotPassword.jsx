import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Check, LayoutDashboard } from 'lucide-react'
import { authAPI } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authAPI.forgotPassword(data.email)
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0A0A0A]">
      <div className="w-full max-w-[460px] bg-white dark:bg-[#0B0F19] p-8 sm:p-12 rounded-3xl shadow-xl shadow-primary-500/5 border border-slate-200 dark:border-slate-800">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Check size={32} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Check your email</h1>
            <p className="text-base font-medium text-slate-500 leading-relaxed mb-10">
              We sent a reset link to <span className="font-bold text-slate-700 dark:text-slate-300">{getValues('email')}</span>. The link expires in 1 hour.
            </p>
            <a 
              href="https://mail.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center w-full bg-primary-600 text-white hover:bg-primary-700 rounded-xl px-4 py-4 text-lg font-bold transition-colors text-center shadow-lg shadow-primary-500/30 mb-6"
            >
              Open Email App
            </a>
            <button 
              onClick={() => setSent(false)}
              className="mt-4 text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase">REVIVE</span>
            </div>

            <div className="mb-10 text-center sm:text-left">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reset password</h1>
              <p className="mt-2 text-base font-medium text-slate-500">
                Enter your email and we will send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-[#0B0F19] rounded-xl px-4 py-3.5 text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium`}
                />
                {errors.email && <p className="mt-1 text-sm font-semibold text-red-500">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-xl px-4 py-4 text-lg font-bold disabled:opacity-50 transition-colors flex justify-center items-center shadow-lg shadow-primary-500/30"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                ) : 'Send Reset Link'}
              </button>
            </form>

            <p className="mt-8 text-center text-base font-medium">
              <Link to="/login" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-bold tracking-wide">
                Back to sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
