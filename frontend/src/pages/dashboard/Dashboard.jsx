import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckSquare, AlertTriangle, BookOpen, Sparkles, MessageSquare, TrendingUp, RefreshCw, Flame } from 'lucide-react'
import { Button, Card, LoadingScreen, PageHeader, Badge, ProgressBar } from '@/components/ui'
import { dashboardAPI, aiAPI } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { formatCurrency, formatDate, getTimeOfDay, cn } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/motionVariants'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

function ResourceCard({ type, title, query, reason, icon }) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <Card className="p-6 hover:shadow-xl transition-all border-slate-200 dark:border-slate-800 hover:border-primary-500/50 group h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary-500 transition-colors">{type}</span>
          {icon}
        </div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1 italic">"{reason}"</p>
        <div className="flex items-center gap-1.5 text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">
          Explore <Sparkles size={12} />
        </div>
      </Card>
    </a>
  )
}

function StreakCounter({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value || 0
    if (end === 0) return
    const step = Math.ceil(end / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(start)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}</>
}

const quickActions = [
  { label: 'Check-in', path: '/checkin', icon: CheckSquare, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
  { label: 'Log Urge', path: '/urge', icon: AlertTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
  { label: 'Journal', path: '/journal', icon: BookOpen, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  { label: 'AI Coach', path: '/chat', icon: MessageSquare, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' },
  { label: 'Progress', path: '/dashboard/progress', icon: TrendingUp, color: 'text-sky-500 bg-sky-50 dark:bg-sky-500/10' },
]

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { activeAddictionId, getActiveAddiction } = useAppStore()
  const addiction = getActiveAddiction()
  const greeting = getTimeOfDay()

  const load = async () => {
    setLoading(true)
    try {
      const res = await dashboardAPI.get(activeAddictionId)
      setData(res.data)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load() 
  }, [activeAddictionId])

  useEffect(() => {
    const hasMotivation = data?.today_motivation
    const hasLibrary = data?.today_motivation?.library
    
    if (activeAddictionId && (!hasMotivation || !hasLibrary)) {
      const getMotivation = async () => {
        try {
          const res = await aiAPI.getDailyMotivation(activeAddictionId)
          setData(prev => ({ ...prev, today_motivation: res.data.motivation }))
        } catch (err) {
          console.error('Auto-motivation error:', err)
        }
      }
      getMotivation()
    }
  }, [data?.today_motivation, activeAddictionId])

  if (loading) return <LoadingScreen message="Loading your dashboard..." />

  const stats = data?.stats || {}
  const motivation = data?.today_motivation
  const checkins = data?.recent_checkins || []
  
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title={`Good ${greeting}`}
        subtitle={addiction ? `Tracking your ${addiction.addiction_type} recovery with precision.` : 'Welcome back'}
        action={
          <button onClick={load} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-500">
            <RefreshCw size={20} />
          </button>
        }
      />

      <Card className="p-8 sm:p-12 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[80px] pointer-events-none -mt-20 -mr-20" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-12 relative z-10">
          <div className="text-center sm:text-left min-w-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="text-primary-500 hidden sm:block" size={24} />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Current Streak</p>
            </div>
            <div className="text-7xl sm:text-[110px] font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">
              <StreakCounter value={stats.streak_days} />
            </div>
            <p className="text-xl font-bold text-slate-500">days strong</p>
          </div>
          
          <div className="w-full md:w-px h-px md:h-32 bg-slate-200 dark:bg-slate-800 hidden md:block" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 w-full">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Best Streak</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.longest_streak || 0}d</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Plan Day</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.day_in_plan || 1}/21</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Resistance</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.urge_resistance_rate ?? 100}%</p>
            </div>
            {addiction?.daily_spend > 0 && (
              <div>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Saved</p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency((addiction.daily_spend || 0) * (stats.streak_days || 0))}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {quickActions.map((action) => (
          <motion.div key={action.path} variants={staggerItem}>
            <Link to={action.path}>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-1 p-6 rounded-3xl flex flex-col items-center gap-4 text-center transition-all">
                <div className={cn('p-4 rounded-full', action.color)}>
                  <action.icon size={26} strokeWidth={2} />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{action.label}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">Today's Wisdom</h3>
          </div>
          {motivation ? (
            <div className="space-y-6">
              <div className="pl-6 border-l-4 border-primary-400 dark:border-primary-600 rounded-l-sm">
                {motivation.quote?.sanskrit && (
                  <p className="text-xl text-primary-600 dark:text-primary-400 font-black mb-4 font-serif leading-relaxed">
                    {motivation.quote.sanskrit}
                  </p>
                )}
                <p className="text-lg text-slate-700 dark:text-slate-300 italic leading-relaxed font-semibold">
                  "{motivation.quote?.text}"
                </p>
                <p className="text-sm font-bold text-slate-500 mt-3">— {motivation.quote?.author}</p>
              </div>
              {motivation.challenge && (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 pt-5 pb-6 px-6 rounded-2xl">
                  <p className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Sparkles size={14} /> Today's Challenge
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">{motivation.challenge}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                 <Sparkles size={24} className="text-primary-400" />
              </div>
              <p className="text-base text-slate-500 font-medium">Fetching Gita wisdom for you...</p>
            </div>
          )}
        </Card>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">Recent Check-ins</h3>
            <Link to="/dashboard/progress" className="text-sm font-bold text-primary-600 hover:text-primary-700 dark:hover:text-primary-400 transition-colors bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-lg">
              View all
            </Link>
          </div>
          {checkins.length > 0 ? (
            <div className="space-y-4">
              {checkins.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300">{formatDate(c.date)}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Mood</span>
                    <Badge variant={c.mood >= 7 ? 'success' : c.mood >= 4 ? 'accent' : 'neutral'} className="text-sm px-3 py-1 scale-100">
                       {c.mood} / 10
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <CheckSquare size={24} className="text-slate-400" />
              </div>
              <p className="text-base text-slate-500 mb-6 font-medium">No check-ins yet today</p>
              <Link to="/checkin">
                <Button>Check In Now</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {data?.plan && (
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">Your 21-Day Plan</h3>
            <Link to="/dashboard/plan" className="text-sm font-bold text-primary-600 hover:text-primary-700 dark:hover:text-primary-400 transition-colors bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-lg">
              View full plan
            </Link>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-4xl font-medium">{data.plan.overview}</p>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <ProgressBar value={stats.day_in_plan || 1} max={21} className="h-4" />
            </div>
            <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex-shrink-0 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">Day {stats.day_in_plan || 1} of 21</span>
          </div>
        </Card>
      )}

      {motivation?.library && (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-wide px-2">RAI Resource Library</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {motivation.library.map((item, idx) => (
              <ResourceCard 
                key={idx}
                type={item.type} 
                title={item.title} 
                query={item.query}
                reason={item.reason}
                icon={
                  item.type === 'Movie' ? <RefreshCw className="text-red-500" size={20} /> :
                  item.type === 'Book' ? <BookOpen className="text-amber-500" size={20} /> :
                  <MessageSquare className="text-emerald-500" size={20} />
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
