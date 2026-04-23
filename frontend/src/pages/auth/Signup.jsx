import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, LayoutDashboard } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.signup(data)
      setAuth(res.data.user, res.data.session)
      navigate('/onboarding/choose')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-slate-900 dark:bg-[#080B13] p-12 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none -mb-64 -ml-64 mix-blend-screen" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <Link to="/" className="text-xl font-black text-white tracking-widest uppercase">
            REVIVE
          </Link>
        </div>
        <div className="flex-1 flex flex-col justify-center relative z-10 pl-8">
          <h1 className="text-6xl font-black text-white leading-tight mb-6">
            Begin your journey. <br/> <span className="text-primary-400">Precision recovery starts here.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed shadow-sm">
            Create an account to gain access to AI tools, dynamic 21-day planning, and constant support.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0A] p-8 sm:p-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 text-center lg:text-left">
            <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase">REVIVE</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
            <p className="mt-2 text-lg font-medium text-slate-500">Join anonymously. Your data is encrypted.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name or Nickname
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full border-2 ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-[#0B0F19] rounded-xl px-4 py-3.5 text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all`}
              />
              {errors.name && <p className="mt-1 text-sm font-semibold text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email address
              </label>
              <input
                type="email"
                {...register('email')}
                className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-[#0B0F19] rounded-xl px-4 py-3.5 text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all`}
              />
              {errors.email && <p className="mt-1 text-sm font-semibold text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full border-2 ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-[#0B0F19] rounded-xl px-4 py-3.5 text-base focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none pr-12 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm font-semibold text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-xl px-4 py-4 text-lg font-bold disabled:opacity-50 transition-colors flex justify-center items-center shadow-lg shadow-primary-500/30"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : 'Start Recovery Tracking'}
            </button>
          </form>

          <p className="mt-8 text-center text-base font-medium text-slate-500">
            Already tracking?{' '}
            <Link to="/login" className="text-slate-900 dark:text-white font-black hover:underline uppercase tracking-wider">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
