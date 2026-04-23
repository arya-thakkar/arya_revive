import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button, Slider, Textarea, Toggle, PageHeader, Card } from '@/components/ui'
import { urgeAPI } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

const TRIGGER_CHIPS = ['Stress', 'Boredom', 'Loneliness', 'Social pressure', 'Anxiety', 'Late night', 'Idle time', 'After a meal', 'Celebration', 'Sadness']

function BreathingPulse() {
  return (
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto mt-16 mb-20">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-amber-500/30 dark:border-amber-400/20 shadow-lg shadow-amber-500/10"
          animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 5, repeat: Infinity, delay: i * 1.5, ease: 'easeInOut' }}
        />
      ))}
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.5)] z-10" />
    </div>
  )
}

export default function LogUrge() {
  const { activeAddictionId } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [form, setForm] = useState({
    intensity: 5,
    trigger: '',
    resisted: true,
    note: '',
  })
  const [selectedChip, setSelectedChip] = useState('')

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await urgeAPI.log({
        addiction_id: activeAddictionId,
        ...form,
        trigger: selectedChip || form.trigger,
      })
      setResponse(res.data.coping_message)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log urge')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResponse(null)
    setForm({ intensity: 5, trigger: '', resisted: true, note: '' })
    setSelectedChip('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <AnimatePresence mode="wait">
        {response ? (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center min-h-[70vh] text-center"
          >
            <BreathingPulse />
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Breathe. You got this.</h2>
            <p className="text-xl font-medium text-slate-500 mb-16">The urge is temporary. Time works for you.</p>
            
            <Card className="text-left w-full p-8 sm:p-12 border-t-8 border-t-amber-500 shadow-2xl relative overflow-hidden">
               <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none -mt-32 -mr-32" />
               <div className="relative z-10 space-y-6">
                {response.split('\n\n').map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic"
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
            </Card>
            
            <div className="mt-16 flex flex-col md:flex-row gap-6 w-full max-w-2xl">
              <Button variant="secondary" size="xl" className="flex-1" onClick={handleReset}>
                Log Another
              </Button>
              <Button size="xl" className="flex-1" onClick={() => window.history.back()}>
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            <PageHeader
              title="Log an Urge"
              subtitle="Recognizing and classifying urges strips them of their power."
            />

            <Card className="p-8 sm:p-12 relative overflow-hidden border-t-4 border-t-primary-500">
               <div className="absolute right-0 bottom-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[80px] pointer-events-none" />
              <Slider
                label="How intense is the urge right now?"
                value={form.intensity}
                onChange={set('intensity')}
                min={1}
                max={10}
              />
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mt-6">
                <span className="text-emerald-500">Mild thought</span>
                <span className="text-red-500">Overwhelming</span>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="p-8 sm:p-10 space-y-8 h-full flex flex-col">
                  <div>
                    <label className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">What triggered it?</label>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {TRIGGER_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setSelectedChip(selectedChip === chip ? '' : chip)}
                          className={cn(
                            'px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm focus:outline-none',
                            selectedChip === chip
                              ? 'bg-primary-600 border-transparent text-white ring-4 ring-primary-500/20'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'
                          )}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Or describe an unlisted trigger..."
                    rows={4}
                    value={form.trigger}
                    onChange={(e) => set('trigger')(e.target.value)}
                    className="flex-1 mt-auto"
                  />
               </Card>

               <Card className="p-8 sm:p-10 space-y-8 flex flex-col h-full">
                  <div className="flex items-center justify-between w-full pb-8 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <label className="text-lg font-black text-slate-900 dark:text-white">I resisted the urge</label>
                        <p className="text-sm font-medium text-slate-500 mt-1">Check this if you simply observed the urge.</p>
                    </div>
                    <Toggle checked={form.resisted} onChange={set('resisted')} />
                  </div>
                  <Textarea
                    label="Reflection Notes (optional)"
                    placeholder="What did you do instead?"
                    rows={5}
                    value={form.note}
                    onChange={(e) => set('note')(e.target.value)}
                    className="flex-1 mt-auto"
                  />
               </Card>
            </div>

            <div className="pt-4 max-w-lg mx-auto">
               <Button onClick={handleSubmit} loading={loading} size="xl" className="w-full text-lg shadow-xl shadow-primary-500/20">
                 Process Urge & Get Support
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
