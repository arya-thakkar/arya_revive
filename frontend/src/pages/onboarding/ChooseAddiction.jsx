import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const options = [
  {
    id: 'smoking',
    label: 'Smoking or Drinking',
    description: 'Overcome dependence on cigarettes, alcohol, or both. Build healthier coping mechanisms and reclaim your physical health.',
    details: ['Nicotine & alcohol dependency', 'Withdrawal management', 'Trigger identification', 'Financial impact tracking'],
  },
  {
    id: 'porn',
    label: 'Pornography',
    description: 'Break free from compulsive pornography use. Rewire your dopamine response and rebuild meaningful connections.',
    details: ['Behavioral addiction support', 'Dopamine detox guidance', 'Accountability tools', 'Privacy guaranteed'],
  },
]

export default function ChooseAddiction() {
  const [selected, setSelected] = useState([])
  const navigate = useNavigate()

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleContinue = () => {
    if (selected.length === 0) return
    sessionStorage.setItem('onboarding_addictions', JSON.stringify(selected))
    navigate('/onboarding/details')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B13] flex flex-col items-center">
      <header className="w-full max-w-4xl px-6 py-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase">REVIVE</span>
        </div>
        <div className="flex-1 max-w-md flex items-center gap-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Step 1 of 3</span>
          <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-primary-600 dark:bg-primary-500 w-1/3 rounded-full" />
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl flex-1 flex flex-col py-16 px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            What would you like to overcome?
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-500 max-w-2xl mx-auto">
            Select one or both. We'll generate a comprehensive recovery framework. Everything is completely private and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((option) => {
            const isSelected = selected.includes(option.id)
            return (
              <button
                key={option.id}
                onClick={() => toggle(option.id)}
                className={cn(
                  'w-full text-left p-8 sm:p-10 rounded-3xl border-2 transition-all duration-300 focus:outline-none flex flex-col h-full bg-white dark:bg-[#0A0A0A] shadow-sm',
                  isSelected
                    ? 'border-primary-500 ring-4 ring-primary-500/20 translate-y-[-4px] shadow-xl shadow-primary-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                )}
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {option.label}
                  </h3>
                  <div className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-200',
                    isSelected
                      ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500'
                      : 'border-slate-300 dark:border-slate-700 bg-transparent'
                  )}>
                    {isSelected && <Check size={18} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
                
                <p className="text-base text-slate-500 font-medium leading-relaxed mb-8 flex-1">
                  {option.description}
                </p>

                <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  {option.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                         <Check size={12} strokeWidth={3} />
                      </div>
                      {d}
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-16 flex justify-center pb-12">
          <button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-xl px-12 py-4 text-xl font-bold disabled:opacity-50 transition-colors shadow-lg shadow-primary-500/30"
          >
            Continue
          </button>
        </div>
      </main>
    </div>
  )
}
