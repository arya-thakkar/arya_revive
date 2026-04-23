import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader, Card, StatCard, LoadingScreen } from '@/components/ui'
import { dashboardAPI, checkinAPI } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { format, subDays, parseISO } from 'date-fns'
import { TrendingUp, Calendar, Shield, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

function HeatmapCalendar({ checkins }) {
  const days = Array.from({ length: 35 }, (_, i) => {
    const date = subDays(new Date(), 34 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const checkin = checkins.find((c) => c.date === dateStr)
    return { date, dateStr, checkin }
  })

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days.map(({ date, dateStr, checkin }) => (
          <div
            key={dateStr}
            title={`${format(date, 'MMM d')}${checkin ? ` — Mood: ${checkin.mood}/10` : ' — No check-in'}`}
            className={cn(
              'aspect-square rounded-lg sm:rounded-xl transition-all duration-300',
              checkin
                ? checkin.mood >= 8
                  ? 'bg-primary-500 shadow-md shadow-primary-500/20'
                  : checkin.mood >= 5
                  ? 'bg-primary-300 dark:bg-primary-700'
                  : 'bg-primary-100 dark:bg-primary-900/40'
                : 'bg-slate-100 dark:bg-slate-800'
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-8 justify-end">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Less</span>
        {['bg-slate-100 dark:bg-slate-800', 'bg-primary-100 dark:bg-primary-900/40', 'bg-primary-300 dark:bg-primary-700', 'bg-primary-500'].map((c, i) => (
          <div key={i} className={cn('w-4 h-4 rounded-md', c)} />
        ))}
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">More</span>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((p) => (
            <div key={p.dataKey} className="flex justify-between gap-6 text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">{p.name}</span>
              <span className="font-black text-slate-900 dark:text-white" style={{ color: p.color }}>{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function Progress() {
  const [data, setData] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const { activeAddictionId, getActiveAddiction } = useAppStore()
  const addiction = getActiveAddiction()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [dashRes, checkinRes] = await Promise.all([
          dashboardAPI.get(activeAddictionId),
          checkinAPI.getAll(activeAddictionId),
        ])
        setData(dashRes.data)
        setCheckins(checkinRes.data.checkins || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [activeAddictionId])

  if (loading) return <LoadingScreen message="Loading your progress..." />

  const stats = data?.stats || {}
  const chartData = checkins.slice(0, 14).reverse().map((c) => ({
    date: format(parseISO(c.date), 'MMM d'),
    mood: c.mood,
    energy: c.energy || 0,
    urge: c.urge_level,
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="Your Progress" subtitle="Track your recovery journey over time in detail." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard color="primary" label="Current Streak" value={`${stats.streak_days || 0}d`} icon={TrendingUp} />
        <StatCard color="amber" label="Best Streak" value={`${stats.longest_streak || 0}d`} icon={Award} />
        <StatCard label="Resistance" value={`${stats.urge_resistance_rate ?? 100}%`} icon={Shield} />
        <StatCard label="Total Check-ins" value={checkins.length} icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="p-8 xl:col-span-1 border-t-8 border-t-primary-500 pt-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide mb-8">Check-in Calendar</h3>
          <HeatmapCalendar checkins={checkins} />
        </Card>

        {chartData.length > 0 && (
          <Card className="p-8 xl:col-span-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide mb-8">Mood & Energy (Last 14 Days)</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
                    dy={16} 
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.5 }} />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#4f46e5" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                    name="Mood" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#f59e0b" 
                    strokeWidth={4} 
                    strokeDasharray="8 8" 
                    dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} 
                    name="Energy" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {addiction?.daily_spend > 0 && (
        <Card className="p-8 border-t-8 border-t-emerald-500 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">Financial Impact</h3>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">Based on your daily spend of ₹{addiction.daily_spend}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { period: '7 days', days: 7 },
              { period: '30 days', days: 30 },
              { period: 'All time', days: stats.streak_days || 0 },
            ].map(({ period, days }) => (
              <div key={period} className="text-center p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md rounded-2xl transition-shadow">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{period}</p>
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  ₹{((addiction.daily_spend || 0) * days).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
