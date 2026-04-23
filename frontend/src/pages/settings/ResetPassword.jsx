import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()
  const { token } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset link expired. Please request a new one.')
      navigate('/forgot-password')
      return
    }

    setLoading(true)
    try {
      await authAPI.resetPassword(data.new_password)
      setDone(true)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reset password'
      if (msg.includes('expired') || msg.includes('invalid')) {
        toast.error('Reset link has expired. Please request a new one.')
        navigate('/forgot-password')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white dark:bg-[#0A0A0A]">
      <div className="w-full max-w-[400px]">
        {done ? (
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Password updated.</h1>
            <p className="text-sm text-zinc-500 mb-8">
              You can now sign in with your new password.
            </p>
            <Link to="/login">
              <button className="w-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-md px-4 py-2 text-sm font-medium transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Set a new password</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Choose something strong that you have not used before.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 hidden">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="New password"
                    {...register('new_password')}
                    className={`w-full border ${errors.new_password ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-700'} bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.new_password && <p className="mt-1 text-xs text-red-500">{errors.new_password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 hidden">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    {...register('confirm_password')}
                    className={`w-full border ${errors.confirm_password ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-700'} bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white outline-none pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors flex justify-center items-center h-10"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
                  </div>
                ) : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
