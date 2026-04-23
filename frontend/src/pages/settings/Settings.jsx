import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { PageHeader, Card, Input, Button, Toggle } from '@/components/ui'
import { userAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { staggerContainer, staggerItem } from '@/lib/motionVariants'

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore()
  const { darkMode, toggleDarkMode, reset } = useAppStore()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({ name: user?.name || '', timezone: 'Asia/Kolkata' })
  const [emailOpt, setEmailOpt] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    userAPI.getProfile().then((res) => {
      const p = res.data.profile
      setProfile({ name: p.name, timezone: p.timezone || 'Asia/Kolkata' })
      setEmailOpt(p.daily_email_opt_in)
    }).catch(() => {})
  }, [])

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      await userAPI.updateProfile({ ...profile, daily_email_opt_in: emailOpt })
      updateUser({ name: profile.name })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await userAPI.deleteAccount()
      logout()
      reset()
      navigate('/')
      toast.success('Account deleted')
    } catch {
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <PageHeader title="Settings" subtitle="Manage your account preferences and configurations." />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <motion.div variants={staggerItem}>
          <Card className="p-8 sm:p-10 h-full">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Profile Details</h3>
            <div className="space-y-8">
              <Input
                label="Full name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="text-lg"
              />
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Timezone</label>
                <select
                  className="w-full border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0A0A0A] rounded-xl px-4 py-3 text-lg focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none dark:text-white transition-all font-medium"
                  value={profile.timezone}
                  onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                >
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Dubai">Dubai (GST)</option>
                </select>
              </div>
              <div className="pt-4">
                <Button size="lg" loading={savingProfile} onClick={saveProfile} className="w-full">Save Profile</Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-8">
          <motion.div variants={staggerItem}>
            <Card className="p-8 sm:p-10">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">System Preferences</h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">Dark mode</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">Toggle interface appearance</p>
                  </div>
                  <Toggle
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-start justify-between">
                  <div className="max-w-[75%]">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">Daily Motivation Emails</p>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed font-medium">
                      Get your AI-generated daily motivation and challenge delivered directly to your inbox every morning.
                    </p>
                  </div>
                  <Toggle
                    checked={emailOpt}
                    onChange={(val) => {
                      setEmailOpt(val)
                      userAPI.updateProfile({ daily_email_opt_in: val })
                        .then(() => toast.success(val ? 'Daily emails enabled' : 'Daily emails disabled'))
                        .catch(() => toast.error('Failed to update'))
                    }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="p-8 sm:p-10">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Account Control</h3>
              <div className="flex flex-col gap-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                   <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Signed in as</p>
                   <p className="text-lg font-black text-slate-900 dark:text-white">{user?.email}</p>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    logout()
                    reset()
                    navigate('/login')
                  }}
                >
                  Sign Out of Revive
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={staggerItem}>
            <Card className="p-8 sm:p-10 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/5">
              <h3 className="text-xs font-black text-red-600 dark:text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
              <p className="text-base text-slate-600 dark:text-slate-400 mb-8 font-medium">
                Permanently delete your account and all recovery data. This process is instant and cannot be reversed.
              </p>
              {showDeleteConfirm ? (
                <div className="space-y-6">
                  <p className="text-lg font-black text-red-700 dark:text-red-400 border-l-4 border-red-500 pl-4 py-1">Are you absolutely sure?</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="secondary" size="lg" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                    <Button variant="danger" size="lg" className="flex-1" onClick={handleDeleteAccount}>Yes, Delete Account</Button>
                  </div>
                </div>
              ) : (
                <Button variant="danger" size="lg" className="w-full" onClick={() => setShowDeleteConfirm(true)}>Delete My Account</Button>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
