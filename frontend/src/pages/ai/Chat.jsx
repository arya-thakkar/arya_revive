import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Zap } from 'lucide-react'
import { aiAPI } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

const QUICK_PROMPTS = [
  'I am feeling an urge right now',
  'I need motivation to keep going',
  'I relapsed. What do I do?',
  'Help me understand my triggers',
  'I am struggling today',
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-6 py-4 h-[52px]">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary-400 dark:bg-primary-600"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste. I am RAI, your recovery companion. I am here to blend modern science with the wisdom of the Bhagavad Gita to support your journey. How are you feeling right now?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const { getActiveAddiction } = useAppStore()
  const addiction = getActiveAddiction()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return
    setInput('')

    const userMsg = { role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await aiAPI.chat(content, addiction?.addiction_type)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }])
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I am having trouble connecting right now. Please try again in a moment.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-6rem)] relative">
      <div className="mb-8 flex-shrink-0 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">RAI Coach</h1>
          <p className="text-base font-medium text-slate-500 mt-1">Private, wisdom-backed support available 24/7.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-bold">
           <Zap size={16} className="fill-current"/> RAI Engine V1
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pb-32 scrollbar-hide px-2">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center mr-4 flex-shrink-0 shadow-lg shadow-primary-500/20">
                  <span className="text-lg text-white font-black font-serif italic">R</span>
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] sm:max-w-[75%] px-6 py-4 rounded-3xl text-lg leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-br-md font-medium'
                    : 'bg-white dark:bg-[#0A0A0A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-md font-medium'
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center mr-4 flex-shrink-0 shadow-lg shadow-primary-500/20">
              <span className="text-lg text-white font-black font-serif italic">R</span>
            </div>
            <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-3xl rounded-bl-md shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50 dark:from-[#0B0F19] dark:via-[#0B0F19] to-transparent pt-10 pb-4">
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={loading}
              className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 hover:text-slate-900 dark:hover:border-slate-600 dark:hover:text-white bg-white dark:bg-[#0A0A0A] transition-all disabled:opacity-50 whitespace-nowrap shadow-sm"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 p-2 bg-white dark:bg-[#0A0A0A] border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg focus-within:border-primary-500 dark:focus-within:border-primary-500 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Talk to RAI..."
            className="flex-1 bg-transparent border-none text-lg px-4 py-3 outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md"
          >
            <Send size={20} className="-ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
