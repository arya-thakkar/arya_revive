import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, ClipboardList, CheckSquare,
  AlertTriangle, BookOpen, Sparkles, MessageSquare, Settings,
  Moon, Sun
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { authAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Progress', path: '/dashboard/progress', icon: TrendingUp },
      { label: '21-Day Plan', path: '/dashboard/plan', icon: ClipboardList },
    ]
  },
  {
    label: 'Daily Actions',
    items: [
      { label: 'Check-in', path: '/checkin', icon: CheckSquare },
      { label: 'Log Urge', path: '/urge', icon: AlertTriangle },
      { label: 'Journal', path: '/journal', icon: BookOpen },
    ]
  },
  {
    label: 'AI Support',
    items: [
      { label: 'AI Coach', path: '/chat', icon: MessageSquare },
    ]
  }
]

// Mobile main nav items
const mobileNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Check-in', path: '/checkin', icon: CheckSquare },
  { label: 'Log Urge', path: '/urge', icon: AlertTriangle },
  { label: 'Chat', path: '/chat', icon: MessageSquare },
  { label: 'Settings', path: '/settings', icon: Settings },
]

function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard'}
      className={({ isActive }) =>
        cn(
          'flex items-center px-4 py-3 text-[15px] rounded-xl transition-all duration-200 mb-1 font-semibold group',
          isActive
            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
        )
      }
    >
      <item.icon size={20} className={cn('mr-4 transition-transform group-hover:scale-110')} strokeWidth={2.2} />
      {item.label}
    </NavLink>
  )
}

function AddictionSwitcher() {
  const addictions = useAppStore((s) => s.addictions)
  const activeId = useAppStore((s) => s.activeAddictionId)
  const setActive = useAppStore((s) => s.setActiveAddiction)

  if (addictions.length <= 1) return null

  return (
    <div className="px-4 mt-8 mb-6">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-4 mb-3">Active Goal</p>
      <div className="flex flex-col gap-2">
        {addictions.map((a) => (
          <button
            key={a.id}
            onClick={() => setActive(a.id)}
            className={cn(
              'text-sm px-4 py-3 rounded-xl capitalize transition-all font-bold text-left',
              a.id === activeId
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'text-slate-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {a.addiction_type}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDarkMode, activeAddictionId, addictions } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch {}
    logout()
    navigate('/login')
  }

  const activeAddiction = addictions.find(a => a.id === activeAddictionId)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[300px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shadow-sm">
        <div className="px-8 pt-10 pb-8">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">REVIVE</div>
          <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 capitalize mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            {activeAddiction?.addiction_type || 'Platform'}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 mt-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-8">
              <div className="px-4 mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </div>
            </div>
          ))}
          <AddictionSwitcher />
        </nav>

        <div className="p-6 m-4 mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg font-black text-primary-700 dark:text-primary-400 text-shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-base font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</div>
              <div className="text-sm font-medium text-slate-500 truncate">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50">
            <Link to="/settings" className="flex-1 text-center py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
              Settings
            </Link>
            <button onClick={handleLogout} className="flex-1 text-center py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[300px] flex flex-col min-h-screen pb-20 lg:pb-0 relative">
        
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-slate-50/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 sm:px-10 flex items-center justify-end">
          {/* Theme Toggle Removed - Permanently Dark */}
        </header>

        {/* Main View */}
        <main className="flex-1 p-6 sm:p-10 lg:p-12 w-full mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-20 px-2 safe-area-pb shadow-[-0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[11px] font-bold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
