import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      addictions: [],
      activeAddictionId: null,
      profile: null,
      onboardingComplete: false,
      darkMode: true,

      setAddictions: (addictions) => {
        set({ addictions })
        if (addictions.length > 0 && !get().activeAddictionId) {
          set({ activeAddictionId: addictions[0].id })
        }
      },

      setActiveAddiction: (id) => set({ activeAddictionId: id }),

      getActiveAddiction: () => {
        const { addictions, activeAddictionId } = get()
        return addictions.find((a) => a.id === activeAddictionId) || addictions[0] || null
      },

      addAddiction: (addiction) => {
        set((state) => ({
          addictions: [...state.addictions, addiction],
          activeAddictionId: state.activeAddictionId || addiction.id,
        }))
      },

      updateAddiction: (id, updates) => {
        set((state) => ({
          addictions: state.addictions.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }))
      },

      setProfile: (profile) => set({ profile }),

      setOnboardingComplete: (val) => set({ onboardingComplete: val }),

      toggleDarkMode: () => {
        // Disabled: App is permanently in Dark Mode
        set({ darkMode: true })
        document.documentElement.classList.add('dark')
      },

      initDarkMode: () => {
        document.documentElement.classList.add('dark')
        set({ darkMode: true })
      },

      reset: () => {
        set({
          addictions: [],
          activeAddictionId: null,
          profile: null,
          onboardingComplete: false,
        })
      },
    }),
    {
      name: 'arya-app',
    }
  )
)
