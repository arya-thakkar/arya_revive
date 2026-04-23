import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button, Slider, Textarea, Toggle, PageHeader, Card } from '@/components/ui'
import { checkinAPI } from '@/lib/api'
import { useAppStore } from '@/store/appStore'

const moodLabels = { 1: 'Very low', 3: 'Low', 5: 'Okay', 7: 'Good', 10: 'Excellent' }
const getMoodLabel = (v) => {
  const keys = Object.keys(moodLabels).map(Number).sort((a, b) => a - b)
  const nearest = keys.reduce((prev, curr) => Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev)
  return moodLabels[nearest]
}

export default function Checkin() {
  const navigate = useNavigate()
  const { activeAddictionId, updateAddiction } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [streak, setStreak] = useState(0)
  const [isMilestone, setIsMilestone] = useState(false)

  const [form, setForm] = useState({
    mood: 7,
    energy: 6,
    urge_level: 3,
    slept_well: false,
    completed_task: false,
    note: '',
  })

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }))

  const handleSubmit = async () => {
    if (!activeAddictionId) {
      toast.error('No active addiction selected')
      return
    }
    setLoading(true)
    try {
      const res = await checkinAPI.create({ addiction_id: activeAddictionId, ...form })
      setStreak(res.data.streak)
      setIsMilestone(res.data.is_milestone)
      updateAddiction(activeAddictionId, { streak_days: res.data.streak })
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center"
        >
          <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-emerald-500/20">
             <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {isMilestone ? 'Outstanding Achievement!' : 'Check-in Complete'}
            </h2>
            <p className="text-xl font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
              {isMilestone
                ? 'You reached a massive new milestone. Check your email.'
                : 'Great job staying on track today. Every day matters.'}
            </p>
          </div>
          
          <div className="mb-16">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Current Streak</p>
            <div className="text-[120px] md:text-[160px] font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
              {streak}
            </div>
            <p className="text-xl font-bold text-slate-500">days strong</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
            <Button variant="secondary" size="lg" className="flex-1 py-4 text-lg" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="primary" size="lg" className="flex-1 py-4 text-lg" onClick={() => navigate('/motivation')}>
              Get Daily Motivation
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <PageHeader title="Daily Check-in" subtitle="Honest reflection is the most critical step of recovery." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 sm:p-10 space-y-12 h-full flex flex-col justify-center">
          <Slider
            label={`Mood: ${getMoodLabel(form.mood)}`}
            value={form.mood}
            onChange={set('mood')}
            min={1}
            max={10}
            showValue={false}
          />
          <Slider
            label="Energy Level"
            value={form.energy}
            onChange={set('energy')}
            min={1}
            max={10}
            showValue={false}
          />
          <Slider
            label="Urge Intensity Today"
            value={form.urge_level}
            onChange={set('urge_level')}
            min={0}
            max={10}
            showValue={false}
          />
        </Card>

        <div className="space-y-8 flex flex-col min-h-full">
          <Card className="p-8 sm:p-10 flex flex-col gap-8 flex-1 justify-center">
            <div className="flex items-center justify-between w-full">
              <div>
                <label className="text-lg font-black text-slate-900 dark:text-white block mb-1">I slept well last night</label>
                <p className="text-sm font-medium text-slate-500">Sleep fuels willpower.</p>
              </div>
              <Toggle checked={form.slept_well} onChange={set('slept_well')} />
            </div>
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center justify-between w-full">
              <div>
                <label className="text-lg font-black text-slate-900 dark:text-white block mb-1">I completed today's plan task</label>
                <p className="text-sm font-medium text-slate-500">From your 21-day plan.</p>
              </div>
              <Toggle checked={form.completed_task} onChange={set('completed_task')} />
            </div>
          </Card>

          <Card className="p-8 sm:p-10">
            <Textarea
              label="How was your day? (optional)"
              placeholder="Record your thoughts or challenges here..."
              rows={4}
              value={form.note}
              onChange={(e) => set('note')(e.target.value)}
              className="text-lg leading-relaxed bg-slate-50 dark:bg-slate-900/50"
            />
          </Card>
        </div>
      </div>

      <div className="pt-4 max-w-lg mx-auto">
        <Button onClick={handleSubmit} loading={loading} size="xl" className="w-full text-lg shadow-xl shadow-primary-500/20">
          Save Daily Check-in
        </Button>
      </div>
    </div>
  )
}
