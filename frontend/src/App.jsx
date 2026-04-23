import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'

import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'

import Landing from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import AuthCallback from '@/pages/auth/AuthCallback'
import ResetPassword from '@/pages/settings/ResetPassword'

import ChooseAddiction from '@/pages/onboarding/ChooseAddiction'
import AddictionDetails from '@/pages/onboarding/AddictionDetails'
import PlanGenerating from '@/pages/onboarding/PlanGenerating'

import Dashboard from '@/pages/dashboard/Dashboard'
import Progress from '@/pages/dashboard/Progress'
import Plan from '@/pages/dashboard/Plan'

import Checkin from '@/pages/daily/Checkin'
import LogUrge from '@/pages/daily/LogUrge'
import Journal from '@/pages/daily/Journal'

import Chat from '@/pages/ai/Chat'

import Settings from '@/pages/settings/Settings'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { addictions, onboardingComplete } = useAppStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // If authenticated but has no addictions and onboarding not done
  // redirect to onboarding
  if (!onboardingComplete && addictions.length === 0) {
    return <Navigate to="/onboarding/choose" replace />
  }

  return children
}

function PublicRoute({ children }) {
  return children
}

function OnboardingRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const initDarkMode = useAppStore((s) => s.initDarkMode)

  useEffect(() => {
    initDarkMode()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Auth callback for email verification and password reset links */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Onboarding routes — auth required but no onboarding check */}
        <Route path="/onboarding">
          <Route path="choose" element={<OnboardingRoute><ChooseAddiction /></OnboardingRoute>} />
          <Route path="details" element={<OnboardingRoute><AddictionDetails /></OnboardingRoute>} />
          <Route path="generating" element={<OnboardingRoute><PlanGenerating /></OnboardingRoute>} />
        </Route>

        {/* Dashboard routes — auth + onboarding required */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/progress" element={<Progress />} />
          <Route path="/dashboard/plan" element={<Plan />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/urge" element={<LogUrge />} />
          <Route path="/journal" element={<Journal />} />

          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
