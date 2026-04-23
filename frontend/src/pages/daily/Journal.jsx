import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, X, Sparkles, Trash2, Edit3, Calendar } from 'lucide-react'
import { Button, Input, Textarea, Slider, PageHeader, LoadingScreen, EmptyState, Badge, Card } from '@/components/ui'
import { journalAPI, aiAPI } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

function JournalModal({ onClose, onSave, addiction_id }) {
  const [form, setForm] = useState({ title: '', content: '', mood: 7, tags: '' })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!form.content.trim()) { toast.error('Please write something'); return }
    setLoading(true)
    try {
      const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      await journalAPI.create({ addiction_id, ...form, tags })
      toast.success('Journal entry saved')
      onSave()
      onClose()
    } catch {
      toast.error('Failed to save entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-auto"
      >
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">New Journal Entry</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <X size={20} strokeWidth={2.5}/>
          </button>
        </div>
        <div className="p-8 space-y-8">
          <Input
            label="Title (optional)"
            placeholder="Give your entry a name..."
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="text-xl font-bold px-0 border-none bg-transparent shadow-none focus:ring-0 placeholder:text-slate-300"
          />
          <Textarea
            label="Your thoughts"
            placeholder="Write freely. This space is entirely for you..."
            rows={8}
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            className="text-lg leading-relaxed px-4 py-4 border-slate-200 focus:ring-primary-500/20"
          />
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <Slider
              label="Mood today"
              value={form.mood}
              onChange={(v) => setForm((p) => ({ ...p, mood: v }))}
              min={1}
              max={10}
            />
          </div>
          <Input
            label="Tags (comma separated)"
            placeholder="proud, difficult, grateful..."
            value={form.tags}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
          />
        </div>
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
          <Button variant="ghost" size="lg" onClick={onClose} className="font-bold">Cancel</Button>
          <Button size="lg" loading={loading} onClick={handleSave} className="font-bold px-8 shadow-primary-500/30 shadow-lg">Save Entry</Button>
        </div>
      </motion.div>
    </div>
  )
}

function EntryItem({ entry, onDelete, addictionType }) {
  const [reflection, setReflection] = useState(null)
  const [loadingReflection, setLoadingReflection] = useState(false)

  const getReflection = async () => {
    setLoadingReflection(true)
    try {
      const res = await aiAPI.journalReflection(entry.content, addictionType)
      setReflection(res.data.reflection)
    } catch {
      toast.error('Failed to generate reflection')
    } finally {
      setLoadingReflection(false)
    }
  }

  // Choose border color based on mood
  const moodColor = entry.mood >= 8 ? 'border-t-emerald-500' : entry.mood <= 4 ? 'border-t-amber-500' : 'border-t-primary-500'

  return (
    <Card className={cn('p-8 sm:p-10 border-t-8 transition-all hover:-translate-y-2 hover:shadow-xl', moodColor)}>
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          {entry.title ? (
             <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{entry.title}</h3>
          ) : (
             <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest"><Calendar size={16}/> {formatDate(entry.created_at)}</div>
          )}
          
          {entry.title && (
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <Calendar size={16}/> <span>{formatDate(entry.created_at)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
           {entry.mood && (
             <Badge variant={entry.mood >= 8 ? 'success' : entry.mood <= 4 ? 'accent' : 'primary'} className="md:px-4 md:py-2 text-sm scale-100 gap-2">
                 Mood {entry.mood}/10
             </Badge>
           )}
           <button
             onClick={() => onDelete(entry.id)}
             className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors shrink-0"
             title="Delete entry"
           >
             <Trash2 size={20} />
           </button>
        </div>
      </div>

      <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8 whitespace-pre-wrap font-medium">{entry.content}</p>

      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="neutral" className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-3">{tag}</Badge>
          ))}
        </div>
      )}

      {reflection ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-6 sm:p-8 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/10 dark:to-indigo-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
               <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">AI Reflection</p>
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic pr-4">"{reflection}"</p>
        </motion.div>
      ) : (
        <Button
          variant="secondary"
          onClick={getReflection}
          disabled={loadingReflection}
          loading={loadingReflection}
          className="font-bold border-dashed"
        >
          <Sparkles size={16} />
          {loadingReflection ? 'Analyzing entry...' : 'Get AI Reflection'}
        </Button>
      )}
    </Card>
  )
}

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { activeAddictionId, getActiveAddiction } = useAppStore()
  const addiction = getActiveAddiction()

  const load = async () => {
    setLoading(true)
    try {
      const res = await journalAPI.getAll(activeAddictionId)
      setEntries(res.data.entries || [])
    } catch {} finally { setLoading(false) }
  }

  const deleteEntry = async (id) => {
    try {
      await journalAPI.delete(id)
      setEntries((prev) => prev.filter((e) => e.id !== id))
      toast.success('Entry deleted')
    } catch { toast.error('Failed to delete') }
  }

  useEffect(() => { load() }, [activeAddictionId])

  if (loading) return <LoadingScreen message="Loading your journal..." />

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <PageHeader
        title="Journal"
        subtitle="Write freely. Your thoughts are privately secured and encrypted."
        action={
          <Button size="lg" onClick={() => setShowModal(true)} className="px-8 shadow-lg shadow-primary-500/20 text-lg group">
            <Edit3 size={20} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" /> Write Entry
          </Button>
        }
      />

      <AnimatePresence>
        {showModal && (
          <JournalModal
            onClose={() => setShowModal(false)}
            onSave={load}
            addiction_id={activeAddictionId}
          />
        )}
      </AnimatePresence>

      {entries.length === 0 ? (
        <EmptyState
          title="No journal entries yet"
          description="Start tracking your thoughts, struggles, and massive victories throughout your recovery journey."
          action={<Button size="lg" onClick={() => setShowModal(true)}>Start Writing</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <EntryItem
                entry={entry}
                onDelete={deleteEntry}
                addictionType={addiction?.addiction_type}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
