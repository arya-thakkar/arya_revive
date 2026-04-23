import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader, Card, LoadingScreen, Button } from '@/components/ui'
import { planAPI } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Sparkles, Map, AlertTriangle } from 'lucide-react'

const MILESTONES = { 7: 'One Week', 14: 'Two Weeks', 21: 'Freedom' }

export default function Plan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const { activeAddictionId, getActiveAddiction } = useAppStore()
  const addiction = getActiveAddiction()
  const currentDay = addiction
    ? Math.min(Math.floor((Date.now() - new Date(addiction.start_date).getTime()) / 86400000) + 1, 21)
    : 1

  const load = async () => {
    setLoading(true)
    try {
      const res = await planAPI.get(activeAddictionId)
      setPlan(res.data.plan)
      setSelectedDay(res.data.plan.days?.find((d) => d.day === currentDay) || res.data.plan.days?.[0])
    } catch {
      setPlan(null)
    } finally {
      setLoading(false)
    }
  }

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await planAPI.generate(activeAddictionId)
      setPlan(res.data.plan)
      toast.success('Your 21-day plan has been generated!')
    } catch {
      toast.error('Failed to generate plan. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => { load() }, [activeAddictionId])

  if (loading) return <LoadingScreen message="Loading your plan..." />

  if (!plan) {
    return (
      <div className="max-w-4xl mx-auto pt-10">
        <PageHeader title="Your 21-Day Plan" subtitle="No plan generated yet." />
        <Card className="p-12 text-center min-h-[400px] flex flex-col items-center justify-center border-dashed border-2">
          <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Map size={32} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Generate your personalized plan</h3>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-lg font-medium leading-relaxed">Our AI will create a comprehensive 21-day roadmap uniquely tailored based on your triggers and goals.</p>
          <Button size="lg" loading={generating} onClick={generate} className="px-10 py-4 text-lg">Generate My Plan</Button>
        </Card>
      </div>
    )
  }

  const days = plan.days || []
  const milestones = plan.milestones || []

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Your 21-Day Plan"
        subtitle={<span className="text-lg font-medium leading-relaxed max-w-4xl block mt-2">{plan.overview}</span>}
        action={<Button variant="secondary" size="md" onClick={generate} loading={generating} className="font-bold">Regenerate</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="p-6 bg-slate-50 dark:bg-[#080B13] border-none shadow-inner h-[800px] flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-6">Execution Roadmap</h3>
            <div className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {days.map((day) => {
                const isCurrent = day.day === currentDay
                const isPast = day.day < currentDay
                const isMilestone = MILESTONES[day.day]
                const isSelected = selectedDay?.day === day.day
                return (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      'w-full text-left px-5 py-4 rounded-2xl transition-all border outline-none relative group',
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-primary-200 dark:border-primary-800 shadow-md ring-2 ring-primary-500/20'
                        : isCurrent
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-dashed hover:border-slate-300'
                        : 'border-transparent hover:bg-white hover:border-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn('text-base font-black', isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300')}>
                        Day {day.day}
                      </span>
                      <div className="flex items-center gap-2">
                        {isMilestone && <div className="w-2 h-2 rounded-full bg-amber-500" title="Milestone" />}
                        {isPast ? (
                          <CheckCircle2 size={18} className={isSelected ? 'text-primary-600' : 'text-emerald-500'} strokeWidth={2.5} />
                        ) : (
                          <Circle size={18} className={isSelected ? 'text-primary-300' : 'text-slate-300 dark:text-slate-600'} strokeWidth={2.5} />
                        )}
                      </div>
                    </div>
                    {day.theme && (
                      <div className={cn('text-sm truncate font-medium', isSelected ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500')}>
                        {day.theme}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          {selectedDay ? (
            <motion.div
              key={selectedDay.day}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {MILESTONES[selectedDay.day] && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 rounded-3xl p-8 border border-amber-200/50 dark:border-amber-900/50 flex items-start gap-6 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 dark:bg-amber-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-amber-900 dark:text-amber-200 mb-2 tracking-tight">{MILESTONES[selectedDay.day]} Milestone</h4>
                    <p className="text-base font-medium text-amber-800 dark:text-amber-300 leading-relaxed max-w-3xl">
                      {milestones.find((m) => m.day === selectedDay.day)?.description}
                    </p>
                  </div>
                </div>
              )}

              <Card className="p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-slate-50 dark:bg-slate-800/20 rounded-full blur-[100px] pointer-events-none -mt-40 -mr-40" />

                <div className="flex items-center gap-6 mb-12 relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 flex items-center justify-center text-3xl font-black text-primary-600 dark:text-primary-400 shrink-0">
                    {selectedDay.day}
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{selectedDay.theme}</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">Day {selectedDay.day} of 21</p>
                  </div>
                </div>

                <div className="space-y-12 relative z-10">
                  {selectedDay.task && (
                    <div>
                      <p className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Today's Task
                      </p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">{selectedDay.task}</p>
                    </div>
                  )}

                  {selectedDay.affirmation && (
                    <div className="pl-6 border-l-4 border-slate-200 dark:border-slate-700 py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Affirmation</p>
                      <p className="text-xl font-bold text-slate-600 dark:text-slate-400 italic leading-relaxed">"{selectedDay.affirmation}"</p>
                    </div>
                  )}

                  {selectedDay.tip && (
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Coping Tip</p>
                      <p className="text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                        {selectedDay.tip}
                      </p>
                    </div>
                  )}

                  {selectedDay.emergency_strategy && (
                    <div>
                      <p className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} /> If You Feel an Urge
                      </p>
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-900 dark:text-red-200 p-6 sm:p-8 rounded-2xl shadow-sm">
                        <p className="text-lg font-bold leading-relaxed">{selectedDay.emergency_strategy}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card className="p-12 text-center min-h-[600px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 border-dashed">
              <p className="text-lg font-bold text-slate-400">Select a day on the left to view details.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
