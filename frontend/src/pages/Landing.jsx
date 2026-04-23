import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function Landing() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col font-sans">
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex items-center pt-24 pb-32 relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary-500/20 dark:bg-primary-900/30 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold text-sm tracking-widest mb-8 border border-primary-100 dark:border-primary-800">
                REVIVE
              </div>
              <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight text-slate-900 dark:text-white mb-8" style={{ lineHeight: 1.02, letterSpacing: '-0.03em' }}>
                Recover one day <br className="hidden sm:block" />
                at a time.
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
                A structured, personalized plan to help you overcome addiction and build healthier habits. Connect with your daily progress in a private, supportive environment.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/signup">
                  <button className="bg-primary-600 shadow-primary-500/25 shadow-lg text-white hover:bg-primary-700 hover:-translate-y-1 rounded-2xl px-10 py-5 text-lg font-bold transition-all duration-300">
                    Start Your Journey
                  </button>
                </Link>
                <Link to="/login">
                  <button className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1 shadow-sm rounded-2xl px-10 py-5 text-lg font-bold transition-all duration-300">
                    Sign In
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-32 sm:py-48 relative border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            <div className="text-center mb-20 sm:mb-28">
              <h2 className="text-sm sm:text-base font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">The Process</h2>
              <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">How Revive Works</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12">
              {[
                { num: '01', title: 'Choose Your Goal', desc: 'Select what you want to overcome to tailor the recovery experience precisely to your needs.' },
                { num: '02', title: 'Get a AI-Built Plan', desc: 'Receive a custom daily 21-day roadmap crafted dynamically based on your unique triggers.' },
                { num: '03', title: 'Check In & Succeed', desc: 'Stay accountable with guided daily reflections and access immediate AI support when urges hit.' }
              ].map((step, i) => (
                <div key={i} className="relative pt-12 group">
                  <div className="absolute top-0 left-0 text-8xl font-black text-slate-100 dark:text-slate-800/50 group-hover:text-primary-100 dark:group-hover:text-primary-900/30 transition-colors z-0 select-none -ml-4 -mt-4">
                    {step.num}
                  </div>
                  <div className="relative z-10 pt-10">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{step.title}</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT YOU GET SECTION */}
        <section className="py-32 sm:py-48 bg-slate-50 dark:bg-[#080B13] border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-12">
                  Everything you need to regain control.
                </h2>
                <motion.ul 
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  {[
                    "Personalized 21-day dynamic recovery plan",
                    "Daily curated AI motivation and challenges",
                    "Urge tracking with instant AI support protocols",
                    "Private encrypted journal with AI reflection insights"
                  ].map((feature, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.15 }}
                    >
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center mr-6 shrink-0">
                        <Check className="h-6 w-6 text-primary-600 dark:text-primary-400" strokeWidth={3} />
                      </div>
                      <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{feature}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
              <div className="hidden lg:flex items-center justify-center relative">
                 <div className="w-[500px] h-[600px] bg-gradient-to-br from-primary-400/20 to-indigo-600/20 dark:from-primary-600/20 dark:to-indigo-900/20 rounded-3xl backdrop-blur-3xl border border-white/50 dark:border-white/10 shadow-2xl skew-y-6 transform rotate-3" />
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-40 bg-primary-600 dark:bg-primary-900 relative overflow-hidden flex items-center justify-center text-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-12">
              Your recovery starts today.
            </h2>
            <Link to="/signup">
              <button className="bg-white text-primary-900 hover:bg-slate-100 hover:scale-105 rounded-2xl px-12 py-6 text-xl font-black transition-all duration-300 shadow-xl">
                Begin Now For Free
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-50 dark:bg-[#0B0F19] py-12 text-base text-slate-500 font-medium border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">REVIVE</div>
          <div className="text-center">Built for your recovery</div>
          <div className="text-right tracking-widest">{new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  )
}
