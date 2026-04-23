import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button, Slider, Textarea, Card } from '@/components/ui'
import { addictionAPI } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { LayoutDashboard } from 'lucide-react'

const TRIGGER_OPTIONS = {
  smoking: ['Stress', 'After meals', 'With friends', 'Boredom', 'Anxiety', 'Morning routine', 'After coffee', 'Driving'],
  drinking: ['Stress', 'Social events', 'Boredom', 'Loneliness', 'Celebration', 'After work', 'Anxiety', 'Weekends'],
  porn: ['Loneliness', 'Boredom', 'Late nights', 'Stress', 'Anxiety', 'After rejection', 'Idle time', 'Phone in bed'],
}

function TriggerChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border-2 shadow-sm',
        selected
          ? 'bg-primary-600 border-primary-600 text-white ring-4 ring-primary-500/20 shadow-primary-500/30'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
      )}
    >
      {label}
    </button>
  )
}

function AddictionForm({ type, index, total, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    daily_hours: 2,
    daily_spend: 0,
    why_quit: '',
    triggers: [],
    motivation_level: 7,
    last_use: '',
  })

  const triggers = TRIGGER_OPTIONS[type] || TRIGGER_OPTIONS.smoking
  const displayName = type === 'porn' ? 'Pornography' : type === 'smoking' ? 'Smoking / Drinking' : type

  const toggleTrigger = (t) => {
    setFormData((prev) => ({
      ...prev,
      triggers: prev.triggers.includes(t)
        ? prev.triggers.filter((x) => x !== t)
        : [...prev.triggers, t],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.why_quit.trim()) {
      toast.error('Please tell us why you want to quit')
      return
    }
    onSubmit({ ...formData, addiction_type: type })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="text-center mb-10">
        <p className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">
          Configuration {index + 1} of {total}
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{displayName}</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Supply these details to tune your AI recovery plan.</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">When did you last use?</label>
        <input
          type="date"
          className="w-full border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] rounded-xl px-4 py-3.5 text-lg font-bold focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          max={new Date().toISOString().split('T')[0]}
          value={formData.last_use}
          onChange={(e) => setFormData((p) => ({ ...p, last_use: e.target.value }))}
        />
      </div>

      <Card className="p-8 border-none bg-slate-50 dark:bg-[#0B0F19]">
        <Slider
          label="Daily hours spent on average"
          value={formData.daily_hours}
          onChange={(v) => setFormData((p) => ({ ...p, daily_hours: v }))}
          min={0}
          max={12}
          step={0.5}
        />
      </Card>

      {(type === 'smoking' || type === 'drinking') && (
        <Card className="p-8 border-none bg-emerald-50 dark:bg-emerald-950/20">
          <Slider
            label={<span className="text-emerald-700 dark:text-emerald-400">Daily money spent (INR)</span>}
            value={formData.daily_spend}
            onChange={(v) => setFormData((p) => ({ ...p, daily_spend: v }))}
            min={0}
            max={1000}
            step={10}
          />
        </Card>
      )}

      <div className="space-y-4 pt-4">
        <label className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">What triggers your urge?</label>
        <div className="flex flex-wrap gap-3">
          {triggers.map((t) => (
            <TriggerChip
              key={t}
              label={t}
              selected={formData.triggers.includes(t)}
              onClick={() => toggleTrigger(t)}
            />
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Textarea
          label="Why do you want to quit?"
          placeholder="Be completely honest with yourself. This becomes your anchor reason..."
          rows={4}
          value={formData.why_quit}
          onChange={(e) => setFormData((p) => ({ ...p, why_quit: e.target.value }))}
          className="text-lg bg-white dark:bg-[#0B0F19]"
        />
      </div>

      <Card className="p-8 border-none bg-slate-50 dark:bg-[#0B0F19]">
        <Slider
          label="How motivated are you right now?"
          value={formData.motivation_level}
          onChange={(v) => setFormData((p) => ({ ...p, motivation_level: v }))}
          min={1}
          max={10}
        />
        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mt-4">
          <span>Struggling</span>
          <span className="text-primary-500">Fully committed</span>
        </div>
      </Card>

      <div className="pt-6">
        <Button type="submit" loading={loading} size="xl" className="w-full text-xl shadow-xl shadow-primary-500/20 py-4">
          {index + 1 < total ? 'Next Addiction' : 'Generate My 21-Day Plan'}
        </Button>
      </div>
    </form>
  )
}

export default function AddictionDetails() {
  const navigate = useNavigate()
  const { addAddiction } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  const addictions = JSON.parse(sessionStorage.getItem('onboarding_addictions') || '["smoking"]')

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      const res = await addictionAPI.create(formData)
      addAddiction(res.data.addiction)

      if (currentIndex + 1 < addictions.length) {
        setCurrentIndex(currentIndex + 1)
      } else {
        navigate('/onboarding/generating')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const progress = ((currentIndex + 1) / (addictions.length + 1)) * 66 + 33

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080B13] flex flex-col items-center">
      <header className="w-full max-w-4xl px-6 py-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase">REVIVE</span>
        </div>
        <div className="flex-1 max-w-md flex items-center gap-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Step 2 of 3</span>
          <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-primary-600 dark:bg-primary-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-8 sm:p-14 shadow-2xl bg-white dark:bg-[#0A0A0A]">
                <AddictionForm
                  type={addictions[currentIndex]}
                  index={currentIndex}
                  total={addictions.length}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
