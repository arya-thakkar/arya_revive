import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { userAPI, addictionAPI } from '@/lib/api'

export default function AuthCallback() {
  const [status, setStatus] = useState('Please wait...')
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { setAddictions, setOnboardingComplete } = useAppStore()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase puts tokens in the URL hash after redirect
        // e.g. /auth/callback#access_token=xxx&refresh_token=xxx&type=recovery
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)

        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')
        const errorDescription = params.get('error_description')

        // Handle error from Supabase (expired link etc.)
        if (errorDescription) {
          setStatus(`Link error: ${decodeURIComponent(errorDescription)}`)
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (!accessToken) {
          setStatus('Invalid or expired link. Redirecting to login...')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        // Save the session first so API calls work
        setAuth({}, { access_token: accessToken, refresh_token: refreshToken })

        if (type === 'recovery') {
          // Password reset link — go to reset password page
          setStatus('Redirecting to reset your password...')
          setTimeout(() => navigate('/reset-password'), 800)
          return
        }

        // For signup verification or any other type
        // Fetch user profile to get their details
        setStatus('Verifying your account...')
        try {
          const profileRes = await userAPI.getProfile()
          const profile = profileRes.data.profile
          setAuth(
            { id: profile.id, email: profile.email, name: profile.name },
            { access_token: accessToken, refresh_token: refreshToken }
          )

          // Check if they have addictions (onboarding done or not)
          const addictionsRes = await addictionAPI.getAll()
          const addictions = addictionsRes.data.addictions || []
          setAddictions(addictions)

          if (addictions.length > 0) {
            setOnboardingComplete(true)
            setStatus('Email verified! Taking you to your dashboard...')
            setTimeout(() => navigate('/dashboard'), 1000)
          } else {
            setOnboardingComplete(false)
            setStatus('Email verified! Let us finish setting up your profile...')
            setTimeout(() => navigate('/onboarding/choose'), 1000)
          }
        } catch {
          // Profile fetch failed but token is valid — go to onboarding
          setStatus('Verified! Taking you to setup...')
          setTimeout(() => navigate('/onboarding/choose'), 1000)
        }

      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('Something went wrong. Redirecting to login...')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{status}</p>
    </div>
  )
}
