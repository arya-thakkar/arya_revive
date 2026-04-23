import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { planAPI } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { sleep } from '@/lib/utils'
import { LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'

const messages = [
  'Analyzing your triggers and patterns...',
  'Building your personalized 21-day roadmap...',
  'Crafting daily motivation and challenges...',
  'Preparing your coping strategies...',
  'Testing contingency plans...',
  'Finalizing your recovery architecture...',
]

export default function PlanGenerating() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const { addictions, setOnboardingComplete } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      const interval = setInterval(() => {
        setMsgIndex((i) => (i + 1) % messages.length)
        setProgress((p) => Math.min(p + 16, 90))
      }, 2000)

      try {
        for (const addiction of addictions) {
          // ensure plan is generated for all addictions
          await planAPI.generate(addiction.id)
        }
        clearInterval(interval)
        setProgress(100)
        setDone(true)
        await sleep(1500)
        setOnboardingComplete(true)
        navigate('/dashboard')
      } catch (err) {
        clearInterval(interval)
        console.error('Plan generation error:', err)
        toast.error('Failed to generate your recovery plan. Please try again.')
        setDone(false)
        setProgress(0)
      }
    }

    run()
  }, [addictions, navigate, setOnboardingComplete])

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-[#080B13] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl flex flex-col items-center text-center relative z-10"
      >
        <div className="flex items-center gap-3 mb-24 opacity-80">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-widest uppercase">REVIVE</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-white mb-10 tracking-tight">
          {done ? 'Your framework is ready.' : 'Engineering your plan'}
        </h2>

        <div className="w-full h-2 bg-slate-800 rounded-full mb-12 overflow-hidden relative shadow-inner">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-primary-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="text-slate-400 text-xl font-medium h-8"
          >
            {done ? 'Redirecting you to your dashboard...' : messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
