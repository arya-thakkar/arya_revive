import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '@/lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, session) => {
        set({
          user,
          token: session?.access_token,
          refreshToken: session?.refresh_token,
          isAuthenticated: true,
        })
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }))
      },

      refreshToken: async () => {
        const rt = get().refreshToken
        if (!rt) return false
        try {
          const res = await authAPI.refresh(rt)
          const session = res.data.session
          set({
            token: session.access_token,
            refreshToken: session.refresh_token,
          })
          return true
        } catch {
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'arya-auth',
      partializer: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
